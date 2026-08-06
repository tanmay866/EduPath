"""
Time Allocation Engine
- Rule-based (Phase 1): time = difficulty_weight × base_hours × experience_factor
- ML-assisted (Phase 2): regression/clustering model using learner history
"""

import math
from typing import Dict, List, Optional
from data.role_templates import DIFFICULTY_MULTIPLIER, EXPERIENCE_ADJUSTMENT


# A skill takes as many weeks as its hours need, and those weeks used to be
# identical: the same three tasks regenerated each time, so a three-week skill
# read "Study core concepts" three weeks running and the only thing that
# changed was the number on the quiz. It looked like the plan had nothing to
# say after week one.
#
# So a skill's weeks are phased. The first is for meeting it, the last is for
# using it without help, and anything between is practice.
PHASES = ("learn", "practise", "apply")

# How a week's work is phrased, for each learning style and each phase.
#
# The learner picks the style and is told it decides "what your weekly plan
# leans on", but it was collected, stored, sent here and then never read —
# every style produced the same three tasks per skill.
#
# It changes the tasks rather than the resources on purpose: the role templates
# only carry docs and articles, with no video or course links anywhere, so
# filtering resources by style would hand a video learner an empty list. What
# can honestly differ is how the week is spent.
TASKS_BY_STYLE = {
    "reading": {
        "learn": [
            "Read the documentation for {skill}",
            "Note the parts of {skill} you could not follow",
            "Look up one thing the {skill} docs assumed you already knew",
        ],
        "practise": [
            "Work through the examples in the {skill} docs",
            "Write a short summary of {skill} in your own words",
            "Go back to your notes and close the gaps you left",
        ],
        "apply": [
            "Write something of your own that uses {skill}",
            "Explain {skill} in a short write-up, without the docs open",
            "Correct your earlier notes on {skill} where they were wrong",
        ],
    },
    "video": {
        "learn": [
            "Watch a walkthrough covering {skill}",
            "Mark the points in it you want to come back to",
            "Pause and say what {skill} is doing before moving on",
        ],
        "practise": [
            "Follow along and build the {skill} example yourself",
            "Rebuild the {skill} example once without the video",
            "Find where your version differs and work out why",
        ],
        "apply": [
            "Build something with {skill} that no video covered",
            "Talk through your own {skill} work start to finish",
            "Rewatch the part you found hardest and check you had it right",
        ],
    },
    "project": {
        "learn": [
            "Build the smallest thing that uses {skill}",
            "Read enough of the {skill} docs to get it working",
            "Note where you had to guess at {skill}",
        ],
        "practise": [
            "Extend it with one part of {skill} you have not tried",
            "Break it on purpose to see how {skill} fails",
            "Handle the case you skipped the first time",
        ],
        "apply": [
            "Rebuild it with {skill} from scratch, without your notes",
            "Refactor it and note what you would do differently",
            "Write down what you would want to know before using {skill} again",
        ],
    },
    "mixed": {
        "learn": [
            "Study the core concepts of {skill}",
            "Write down what you expect {skill} to be useful for",
            "List the parts of {skill} you cannot yet explain",
        ],
        "practise": [
            "Complete practice exercises for {skill}",
            "Redo the ones you got wrong, without help",
            "Review and take notes on {skill}",
        ],
        "apply": [
            "Use {skill} on a problem that was not set for you",
            "Explain {skill} without looking at your notes",
            "Note what you still avoid doing with {skill}",
        ],
    },
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
        # Skills active during this week, kept whole rather than reduced to
        # names: the tasks depend on how far into a skill the week falls.
        active = [
            s
            for s in skills_with_weeks
            if s["start_week"] <= week_num <= s["end_week"]
        ]
        active_skills = [s["skill"] for s in active]

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
                "tasks": _generate_tasks_for_week(active, week_num, learning_style),
                "estimated_hours": hours_per_week,
                "mini_project": mini_project,
                "status": "pending",
            }
        )

    return weekly_plans


def phase_for_week(week_num: int, start_week: int, end_week: int) -> Optional[str]:
    """
    Which phase of a skill this week is.

    The first week of a skill is always "learn" and the last is always
    "apply", however many weeks lie between; a two-week skill therefore goes
    straight from meeting something to using it, which is what two weeks
    buys you. None means the skill has a single week and gets all of it.
    """
    span = max(1, end_week - start_week + 1)
    if span == 1:
        return None

    position = min(max(week_num - start_week, 0), span - 1)
    return PHASES[round(position * (len(PHASES) - 1) / (span - 1))]


def _generate_tasks_for_week(
    skills: List[dict],
    week_num: int,
    learning_style: Optional[str] = DEFAULT_LEARNING_STYLE,
) -> List[str]:
    """Task descriptions for the week, phrased for how the learner prefers to work."""
    by_phase = TASKS_BY_STYLE[normalize_learning_style(learning_style)]

    tasks = []
    for skill in skills:
        name = skill["skill"]
        phase = phase_for_week(week_num, skill["start_week"], skill["end_week"])

        if phase is None:
            # One week for the whole skill: meet it, practise it and use it,
            # rather than three weeks' worth of any one of those.
            templates = [by_phase[p][0] for p in PHASES]
        else:
            templates = by_phase[phase]

        tasks += [template.format(skill=name) for template in templates]

    # Every style ends the week the same way: the plan is only worth anything
    # if what was learned gets checked.
    tasks.append(f"Weekly self-assessment quiz (Week {week_num})")
    return tasks