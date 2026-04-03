"""
Priority Sorter
Sorts the topologically-resolved skill list by:
  1. Dependency order (already resolved upstream)
  2. Gap severity (critical > high > medium > low)
  3. Role template priority weight
  4. Industry importance
"""

from typing import Dict, List

SEVERITY_RANK = {
    "critical": 4,
    "high": 3,
    "medium": 2,
    "low": 1,
    "none": 0,
}


def build_gap_lookup(skill_gaps: List[dict]) -> Dict[str, dict]:
    """Creates a dict of skill_name -> gap_data for O(1) lookups."""
    return {g["skill"]: g for g in skill_gaps}


def sort_skills_by_priority(
    ordered_skills: List[str],
    skill_template: Dict[str, dict],
    skill_gaps: List[dict],
) -> List[str]:
    """
    Re-sorts skills within the topological order using gap severity and
    role priority weight. Dependencies are never violated — we only
    re-order siblings (skills at the same DAG level).

    Strategy: Assign a composite priority score; higher = schedule sooner.

    Args:
        ordered_skills: topologically sorted list of skill names
        skill_template: full skill template data for the role
        skill_gaps: gap analysis output with severity info

    Returns:
        Re-sorted skill list (dependencies still respected).
    """
    gap_lookup = build_gap_lookup(skill_gaps)

    def priority_score(skill_name: str) -> float:
        template_data = skill_template.get(skill_name, {})
        gap_data = gap_lookup.get(skill_name, {})

        severity_score = SEVERITY_RANK.get(gap_data.get("gap_severity", "none"), 0)
        role_weight = template_data.get("priority_weight", 5)

        # Higher is scheduled earlier
        return (severity_score * 10) + role_weight

    # Group by "wave" (skills whose all deps appear before this index)
    # Simple approach: stable sort preserving relative topological order
    # within each dependency wave.
    waves = _build_waves(ordered_skills, skill_template)

    sorted_skills = []
    for wave in waves:
        wave_sorted = sorted(wave, key=lambda s: priority_score(s), reverse=True)
        sorted_skills.extend(wave_sorted)

    return sorted_skills


def _build_waves(
    ordered_skills: List[str],
    skill_template: Dict[str, dict],
) -> List[List[str]]:
    """
    Groups skills into waves where all skills in wave N+1
    depend only on skills in waves 0..N.
    """
    skill_set = set(ordered_skills)
    assigned_wave: Dict[str, int] = {}

    for skill in ordered_skills:
        deps = [
            d for d in skill_template.get(skill, {}).get("dependencies", [])
            if d in skill_set
        ]
        if not deps:
            assigned_wave[skill] = 0
        else:
            assigned_wave[skill] = max(assigned_wave.get(d, 0) for d in deps) + 1

    max_wave = max(assigned_wave.values(), default=0)
    waves: List[List[str]] = [[] for _ in range(max_wave + 1)]

    for skill, wave_num in assigned_wave.items():
        waves[wave_num].append(skill)

    return waves