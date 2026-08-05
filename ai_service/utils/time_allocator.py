"""
Time Allocation Engine
- Rule-based (Phase 1): time = difficulty_weight × base_hours × experience_factor
- ML-assisted (Phase 2): regression/clustering model using learner history
"""

import math
from typing import Dict, List, Optional
from data.role_templates import DIFFICULTY_MULTIPLIER, EXPERIENCE_ADJUSTMENT


# How a week's work is phrased for each learning style.
#
# The learner picks this and is told it decides "what your weekly plan leans
# on", but it was collected, stored, sent here and then never read — every
# style produced the same three tasks per skill.
#
# It changes the tasks rather than the resources on purpose: the role templates
# only carry docs and articles, with no video or course links anywhere, so
# filtering resources by style would hand a video learner an empty list. What
# can honestly differ is how the week is spent.
TASKS_BY_STYLE = {
    "reading": [
        "Read the documentation for {skill}",
        "Write a short summary of {skill} in your own words",
        "Work through the examples in the {skill} docs",
    ],
    "video": [
        "Watch a walkthrough covering {skill}",
        "Follow along and build the example yourself",
        "Rebuild the {skill} example once without the video",
    ],
    "project": [
        "Build something small that uses {skill}",
        "Extend it with one part of {skill} you have not tried",
        "Refactor it and note what you would do differently",
    ],
    "mixed": [
        "Study core concepts of {skill}",
        "Complete practice exercises for {skill}",
        "Review and take notes on {skill}",
    ],
}

DEFAULT_LEARNING_STYLE = "mixed"


def normalize_learning_style(learning_style: Optional[str]) -> str:
    """Anything unrecognised falls back to mixed rather than losing the week's tasks."""
    key = str(learning_style or "").strip().lower()
    return key if key in TASKS_BY_STYLE else DEFAULT_LEARNING_STYLE


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

    Hours run continuously: a skill starts in the week the previous one ran
    out, rather than waiting for the next whole week. Each skill used to be
    rounded up to whole weeks on its own, so every remainder was discarded —
    a 16.9 hour skill occupied two full weeks and threw away 3.1 hours of the
    learner's time. Across a track that lost 11-18% of the schedule: MERN
    spanned 55 weeks to teach 483 hours of material at 10 hours a week, which
    is 67 hours of capacity nobody was ever given anything to do in.

    A week can therefore hold the end of one skill and the start of the next,
    which is what the weekly plan already assumed when it listed the skills
    active in a given week.

    Args:
        skills_with_hours: list of {skill, hours_estimated, ...}
        hours_per_week: learner's available hours per week

    Returns:
        Same list with start_week and end_week added.
    """
    if hours_per_week <= 0:
        hours_per_week = 10  # safe default

    scheduled_hours = 0.0

    for skill_entry in skills_with_hours:
        hours = skill_entry["hours_estimated"]

        # Begins in whichever week the running total currently sits in.
        start_week = int(scheduled_hours // hours_per_week) + 1
        scheduled_hours += hours

        # Ends in the week the running total reaches, and never before it
        # starts — a zero-hour skill still occupies the week it falls in.
        end_week = max(start_week, math.ceil(scheduled_hours / hours_per_week))

        skill_entry["start_week"] = start_week
        skill_entry["end_week"] = end_week
        skill_entry["hours_allocated"] = hours

    return skills_with_hours


def build_weekly_plan_skeleton(
    skills_with_weeks: List[Dict],
    hours_per_week: int,
    learning_style: Optional[str] = DEFAULT_LEARNING_STYLE,
) -> List[Dict]:
    """
    Groups skills by week into a weekly plan skeleton.

    Args:
        skills_with_weeks: skills with start_week and end_week
        hours_per_week: weekly hours
        learning_style: how the week's tasks are phrased

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
                "tasks": _generate_tasks_for_week(active_skills, week_num, learning_style),
                "estimated_hours": hours_per_week,
                "mini_project": mini_project,
                "status": "pending",
            }
        )

    return weekly_plans


def _generate_tasks_for_week(
    skills: List[str],
    week_num: int,
    learning_style: Optional[str] = DEFAULT_LEARNING_STYLE,
) -> List[str]:
    """Task descriptions for the week, phrased for how the learner prefers to work."""
    templates = TASKS_BY_STYLE[normalize_learning_style(learning_style)]

    tasks = []
    for skill in skills:
        tasks += [template.format(skill=skill) for template in templates]

    # Every style ends the week the same way: the plan is only worth anything
    # if what was learned gets checked.
    tasks.append(f"Weekly self-assessment quiz (Week {week_num})")
    return tasks