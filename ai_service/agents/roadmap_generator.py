"""
Curriculum Generation Agent — Core Roadmap Generator
Orchestrates: Skill Mapping → Dependency Resolution → Priority Sort
             → Time Allocation → Weekly Plan Skeleton
"""

import logging
from typing import Dict, List, Optional

from data.role_templates import ROLE_TEMPLATES
from utils.dependency_resolver import topological_sort, resolve_with_dependencies
from utils.priority_sorter import sort_skills_by_priority
from utils.time_allocator import (
    estimate_skill_hours,
    allocate_weeks,
    build_weekly_plan_skeleton,
)

logger = logging.getLogger(__name__)


class RoadmapGeneratorAgent:
    """
    Generates a structured, dependency-aware, time-bounded learning roadmap.

    Pipeline:
      1. Map target role → skill template
      2. Topological sort of all skills in template (DAG)
      3. Filter to skills the user actually needs (gap + transitive deps)
      4. Priority sort within each dependency wave
      5. Estimate hours per skill (rule-based + partial knowledge reduction)
      6. Assign start_week / end_week based on hours_per_week
      7. Build weekly plan skeleton
    """

    SUPPORTED_ROLES = list(ROLE_TEMPLATES.keys())

    def generate(self, payload: dict) -> dict:
        """
        Main entry point.

        Args:
            payload: {
                user_id, target_role, experience_level,
                hours_per_week, learning_style,
                skill_gaps, skill_scores, current_skills
            }

        Returns:
            {
                total_duration_weeks, skills, weekly_plans, model_used
            }
        """
        target_role: str = payload.get("target_role", "")
        experience_level: str = payload.get("experience_level", "beginner")
        hours_per_week: int = max(1, int(payload.get("hours_per_week", 10)))
        skill_gaps: List[dict] = payload.get("skill_gaps", [])
        skill_scores: Dict[str, float] = payload.get("skill_scores", {})

        logger.info(f"Generating roadmap for role='{target_role}' exp='{experience_level}'")

        # ── Step 1: Match role template ───────────────────────────────────
        role_template = self._get_role_template(target_role)
        if not role_template:
            raise ValueError(
                f"Unsupported role '{target_role}'. "
                f"Supported: {self.SUPPORTED_ROLES}"
            )

        skill_definitions = role_template["skills"]

        # ── Step 2: Topological sort ──────────────────────────────────────
        topo_ordered = topological_sort(skill_definitions)
        logger.debug(f"Topo order: {topo_ordered}")

        # ── Step 3: Filter to skills user needs (with transitive deps) ────
        if skill_gaps:
            needed_skills = resolve_with_dependencies(
                topo_ordered, skill_gaps, skill_definitions
            )
        else:
            # No gap data — include everything (new user / beginner)
            needed_skills = topo_ordered

        logger.debug(f"Skills after gap filter: {needed_skills}")

        # ── Step 4: Priority sort (within dependency waves) ───────────────
        sorted_skills = sort_skills_by_priority(
            needed_skills, skill_definitions, skill_gaps
        )

        # ── Step 5 & 6: Estimate hours + assign weeks ─────────────────────
        skills_with_hours = []
        for skill_name in sorted_skills:
            skill_data = skill_definitions.get(skill_name, {})
            hours = estimate_skill_hours(
                skill_name, skill_data, experience_level, skill_scores
            )
            skills_with_hours.append(
                {
                    "skill": skill_name,
                    "category": skill_data.get("category", "General"),
                    "difficulty": skill_data.get("difficulty", "beginner"),
                    "hours_estimated": hours,
                    "dependencies": skill_data.get("dependencies", []),
                    "resources": skill_data.get("resources", []),
                    "mini_project": skill_data.get("mini_project"),
                    "status": "pending",
                }
            )

        skills_with_weeks = allocate_weeks(skills_with_hours, hours_per_week)

        # ── Step 7: Build weekly plan skeleton ────────────────────────────
        weekly_plans = build_weekly_plan_skeleton(skills_with_weeks, hours_per_week)

        total_weeks = (
            max(s["end_week"] for s in skills_with_weeks)
            if skills_with_weeks
            else 0
        )

        # Clean output for Mongo (remove internal keys)
        output_skills = self._clean_skills(skills_with_weeks)

        return {
            "total_duration_weeks": total_weeks,
            "skills": output_skills,
            "weekly_plans": weekly_plans,
            "model_used": "rule-based-v1",
        }

    # ─── Private helpers ──────────────────────────────────────────────────

    def _get_role_template(self, target_role: str) -> Optional[dict]:
        """Case-insensitive role lookup."""
        for role_name, template in ROLE_TEMPLATES.items():
            if role_name.lower() == target_role.lower():
                return template
        # Partial match fallback
        for role_name, template in ROLE_TEMPLATES.items():
            if target_role.lower() in role_name.lower():
                return template
        return None

    def _clean_skills(self, skills_with_weeks: List[dict]) -> List[dict]:
        """
        Transforms internal skill dicts into the MongoDB SkillNode schema format.
        """
        cleaned = []
        for s in skills_with_weeks:
            mini_project_data = None
            if s.get("mini_project"):
                mini_project_data = {
                    "title": s["mini_project"],
                    "description": f"Hands-on project to solidify your {s['skill']} skills.",
                    "week": s["end_week"],
                }

            cleaned.append(
                {
                    "skill": s["skill"],
                    "category": s.get("category", "General"),
                    "difficulty": s.get("difficulty", "beginner"),
                    "start_week": s["start_week"],
                    "end_week": s["end_week"],
                    "hours_allocated": s.get("hours_allocated", 0),
                    "dependencies": s.get("dependencies", []),
                    "status": "pending",
                    "resources": s.get("resources", []),
                    "mini_project": mini_project_data,
                }
            )
        return cleaned