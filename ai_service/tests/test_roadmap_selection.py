"""
What ends up on a roadmap, and what a week of it looks like.

Both of these were wrong in the same direction: the plan said less than the
learner needed. The role's skills were filtered through a gap record that
belonged to a different track, and the weeks a skill spanned were copies of
each other. Neither failed loudly — a three-week roadmap for AI/ML Engineer
with no AI in it looks like a roadmap.
"""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from utils.dependency_resolver import (  # noqa: E402
    proven_skills,
    select_skills_for_role,
)
from utils.time_allocator import (  # noqa: E402
    PHASES,
    TASKS_BY_STYLE,
    build_weekly_plan_skeleton,
    phase_for_week,
)

TRACK = [
    "Python Basics",
    "NumPy & Pandas",
    "ML Fundamentals (Scikit-learn)",
]


def gap(skill, current, required=70):
    return {"skill": skill, "current_score": current, "required_score": required}


# ── what goes on the plan ────────────────────────────────────────────────

def test_a_skill_never_assessed_stays_on_the_plan():
    # The whole bug: no gap entry for NumPy meant NumPy was dropped, as
    # though silence were a pass.
    assert select_skills_for_role(TRACK, [gap("Python Basics", 40)]) == TRACK


def test_a_skill_scored_above_what_it_needs_comes_off():
    kept = select_skills_for_role(TRACK, [gap("Python Basics", 90)])
    assert "Python Basics" not in kept
    assert len(kept) == 2


def test_a_skill_scored_below_what_it_needs_stays():
    assert "Python Basics" in select_skills_for_role(TRACK, [gap("Python Basics", 40)])


def test_scores_from_another_track_do_not_shrink_this_one():
    # A learner's gaps are stored per learner, not per role, so an AI/ML plan
    # gets React scores from a web quiz. They should change nothing.
    other = [gap("React Basics", 100), gap("React Router", 100)]
    assert select_skills_for_role(TRACK, other) == TRACK


def test_an_untested_learner_gets_the_whole_track():
    assert select_skills_for_role(TRACK, []) == TRACK
    assert select_skills_for_role(TRACK, None) == TRACK


def test_sitting_an_assessment_never_shortens_the_plan_by_failing_it():
    # Failing everything must leave the plan whole; it was previously the
    # difference between nine skills and one.
    failed = [gap(s, 10) for s in TRACK]
    assert select_skills_for_role(TRACK, failed) == TRACK


def test_dependency_order_survives_the_filter():
    kept = select_skills_for_role(TRACK, [gap("NumPy & Pandas", 95)])
    assert kept == ["Python Basics", "ML Fundamentals (Scikit-learn)"]


def test_proving_every_skill_empties_the_plan_rather_than_erroring():
    assert select_skills_for_role(TRACK, [gap(s, 100) for s in TRACK]) == []


def test_a_missing_score_is_not_treated_as_proof():
    assert proven_skills([{"skill": "Python Basics"}]) == set()
    assert proven_skills([{"skill": "Python Basics", "current_score": None}]) == set()


def test_a_required_score_the_record_omits_falls_back_to_the_default():
    assert proven_skills([{"skill": "A", "current_score": 75}]) == {"A"}
    assert proven_skills([{"skill": "A", "current_score": 65}]) == set()


def test_raw_assessment_scores_also_count_as_proof():
    assert select_skills_for_role(TRACK, [], {"Python Basics": 88}) == TRACK[1:]
    assert select_skills_for_role(TRACK, [], {"Python Basics": 30}) == TRACK


# ── what a week of it looks like ─────────────────────────────────────────

def test_a_one_week_skill_has_no_phase():
    assert phase_for_week(1, 1, 1) is None


def test_a_skill_starts_by_learning_and_ends_by_applying():
    for span in range(2, 9):
        assert phase_for_week(1, 1, span) == "learn"
        assert phase_for_week(span, 1, span) == "apply"


def test_a_three_week_skill_gets_one_of_each_phase():
    assert [phase_for_week(w, 1, 3) for w in (1, 2, 3)] == list(PHASES)


def test_a_long_skill_spends_its_middle_practising():
    middle = [phase_for_week(w, 1, 8) for w in range(2, 8)]
    assert "practise" in middle


def test_the_weeks_of_one_skill_are_not_copies_of_each_other():
    # A three-week skill read "Study core concepts" three weeks running, and
    # only the quiz number told the weeks apart.
    weeks = build_weekly_plan_skeleton(
        [{"skill": "Python Basics", "start_week": 1, "end_week": 3}], 10, "mixed"
    )
    without_quiz = [
        tuple(t for t in w["tasks"] if not t.startswith("Weekly self-assessment"))
        for w in weeks
    ]
    assert len(set(without_quiz)) == 3, "each week of a skill must ask for something different"


def test_a_week_holding_two_skills_phases_each_one_separately():
    # Hours run continuously, so one week can end a skill and start the next.
    weeks = build_weekly_plan_skeleton(
        [
            {"skill": "Python Basics", "start_week": 1, "end_week": 2},
            {"skill": "NumPy & Pandas", "start_week": 2, "end_week": 3},
        ],
        10,
        "project",
    )
    second = weeks[1]["tasks"]
    assert second[0] == TASKS_BY_STYLE["project"]["apply"][0].format(skill="Python Basics")
    assert second[3] == TASKS_BY_STYLE["project"]["learn"][0].format(skill="NumPy & Pandas")


def test_every_style_and_phase_carries_tasks_that_name_the_skill():
    for style, phases in TASKS_BY_STYLE.items():
        assert tuple(phases) == PHASES, f"{style} is missing a phase"
        for phase, templates in phases.items():
            assert templates, f"{style}/{phase} has no tasks"
            assert any("{skill}" in t for t in templates), f"{style}/{phase} never names the skill"


def test_the_week_still_ends_with_its_quiz():
    weeks = build_weekly_plan_skeleton(
        [{"skill": "Python Basics", "start_week": 1, "end_week": 2}], 10, "reading"
    )
    for n, week in enumerate(weeks, start=1):
        assert week["tasks"][-1] == f"Weekly self-assessment quiz (Week {n})"
