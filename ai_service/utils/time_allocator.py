"""
Time Allocation Engine
- Rule-based (Phase 1): time = difficulty_weight × base_hours × experience_factor
- ML-assisted (Phase 2): regression/clustering model using learner history
"""

import math
from typing import Dict, List, Optional
from data.role_templates import DIFFICULTY_MULTIPLIER, EXPERIENCE_ADJUSTMENT


def estimate_skill_hours(
    skill_name: str,
    skill_data: dict,
    experience_level: str,
    skill_scores: Optional[Dict[str, float]] = None,
) -> float:
    """
    Estimates hours needed to learn a skill for this particular learner.

    Args:
        skill_name: name of the skill
        skill_data: template data for the skill
        experience_level: beginner / intermediate / advanced
        skill_scores: optional existing scores (0-100) per skill from assessment

    Returns:
        Estimated hours as float
    """
    base_hours: float = skill_data.get("base_hours", 20)
    difficulty: str = skill_data.get("difficulty", "beginner")

    diff_multiplier = DIFFICULTY_MULTIPLIER.get(difficulty, 1.0)
    exp_adjustment = EXPERIENCE_ADJUSTMENT.get(experience_level, 1.0)

    # If user already knows some of this skill, reduce hours proportionally
    partial_knowledge_factor = 1.0
    if skill_scores and skill_name in skill_scores:
        score = skill_scores[skill_name]  # 0-100
        # Score 80+ → 20% of hours needed, score 50 → 50%, score 0 → 100%
        partial_knowledge_factor = max(0.2, 1.0 - (score / 100) * 0.8)

    estimated = base_hours * diff_multiplier * exp_adjustment * partial_knowledge_factor
    return round(estimated, 1)


def allocate_weeks(
    skills_with_hours: List[Dict],
    hours_per_week: int,
) -> List[Dict]:
    """
    Assigns start_week and end_week to each skill based on estimated hours
    and the learner's weekly availability.

    Args:
        skills_with_hours: list of {skill, hours_estimated, ...}
        hours_per_week: learner's available hours per week

    Returns:
        Same list with start_week and end_week added.
    """
    if hours_per_week <= 0:
        hours_per_week = 10  # safe default

    current_week = 1

    for skill_entry in skills_with_hours:
        hours = skill_entry["hours_estimated"]
        duration_weeks = max(1, math.ceil(hours / hours_per_week))

        skill_entry["start_week"] = current_week
        skill_entry["end_week"] = current_week + duration_weeks - 1
        skill_entry["hours_allocated"] = hours

        current_week += duration_weeks

    return skills_with_hours


def build_weekly_plan_skeleton(
    skills_with_weeks: List[Dict],
    hours_per_week: int,
) -> List[Dict]:
    """
    Groups skills by week into a weekly plan skeleton.

    Args:
        skills_with_weeks: skills with start_week and end_week
        hours_per_week: weekly hours

    Returns:
        List of weekly plan dicts.
    """
    if not skills_with_weeks:
        return []

    total_weeks = max(s["end_week"] for s in skills_with_weeks)
    weekly_plans = []

    for week_num in range(1, total_weeks + 1):
        # Skills active during this week
        active_skills = [
            s["skill"]
            for s in skills_with_weeks
            if s["start_week"] <= week_num <= s["end_week"]
        ]

        # Grab mini project if any skill ends this week
        mini_project = None
        for s in skills_with_weeks:
            if s["end_week"] == week_num and s.get("mini_project"):
                mini_project = {
                    "title": s["mini_project"],
                    "description": f"Apply your {s['skill']} knowledge in a hands-on project.",
                }
                break

        weekly_plans.append(
            {
                "week_number": week_num,
                "skills": active_skills,
                "tasks": _generate_tasks_for_week(active_skills, week_num),
                "estimated_hours": hours_per_week,
                "mini_project": mini_project,
                "status": "pending",
            }
        )

    return weekly_plans


def _generate_tasks_for_week(skills: List[str], week_num: int) -> List[str]:
    """Generates generic but relevant task descriptions for the week."""
    tasks = []
    for skill in skills:
        tasks += [
            f"Study core concepts of {skill}",
            f"Complete practice exercises for {skill}",
            f"Review and take notes on {skill}",
        ]
    tasks.append(f"Weekly self-assessment quiz (Week {week_num})")
    return tasks