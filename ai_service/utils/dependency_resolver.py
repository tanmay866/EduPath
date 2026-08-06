"""
Dependency Resolver — Directed Acyclic Graph (DAG) based topological sort.
Ensures skills are always scheduled after their prerequisites.
"""

from collections import defaultdict, deque
from typing import Dict, List, Optional, Set


def topological_sort(skills: Dict[str, dict]) -> List[str]:
    """
    Performs Kahn's algorithm (BFS-based topological sort) on the skill
    dependency graph.

    Args:
        skills: dict of {skill_name: {dependencies: [...], ...}}

    Returns:
        Ordered list of skill names respecting all dependencies.

    Raises:
        ValueError: if a cycle is detected in the dependency graph.
    """
    # Build adjacency list and in-degree count
    in_degree: Dict[str, int] = {skill: 0 for skill in skills}
    adjacency: Dict[str, List[str]] = defaultdict(list)

    for skill, data in skills.items():
        for dep in data.get("dependencies", []):
            if dep in skills:  # only consider deps that exist in the template
                adjacency[dep].append(skill)
                in_degree[skill] += 1

    # Start with all nodes that have no dependencies
    queue = deque([s for s, deg in in_degree.items() if deg == 0])
    ordered: List[str] = []

    while queue:
        node = queue.popleft()
        ordered.append(node)

        for neighbor in adjacency[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)

    if len(ordered) != len(skills):
        raise ValueError("Cycle detected in skill dependency graph.")

    return ordered


# The score a skill is assumed to require when the gap record does not say.
DEFAULT_REQUIRED_SCORE = 70


def proven_skills(
    skill_gaps: List[dict],
    skill_scores: Optional[Dict[str, float]] = None,
) -> Set[str]:
    """
    The skills the learner has actually demonstrated.

    Only a score does that. A skill nobody has ever been asked about is
    unknown, not known, and the difference is the whole point of this module.
    """
    proven: Set[str] = set()
    judged: Set[str] = set()

    for gap in skill_gaps or []:
        name = gap.get("skill")
        current = gap.get("current_score")
        if not name or current is None:
            continue
        required = gap.get("required_score")
        if required is None:
            required = DEFAULT_REQUIRED_SCORE
        judged.add(name)
        if current >= required:
            proven.add(name)

    # Only for skills the gap record says nothing about. A gap entry carries
    # the bar that skill has to clear, and the caller builds this map out of
    # the same records with that bar dropped — so letting it speak for a skill
    # already judged would pass anything scoring 70 against a bar set higher.
    for name, score in (skill_scores or {}).items():
        if name not in judged and score is not None and score >= DEFAULT_REQUIRED_SCORE:
            proven.add(name)

    return proven


def select_skills_for_role(
    ordered_skills: List[str],
    skill_gaps: List[dict],
    skill_scores: Optional[Dict[str, float]] = None,
) -> List[str]:
    """
    The skills of this role that the learner still has to cover.

    This used to run the other way round: it started from the gap list and
    kept only the role skills that appeared in it. That reads a gap record as
    if it were a syllabus, and it is not — it is a record of what happened to
    be assessed. Gaps are stored per learner rather than per role, so an
    AI/ML roadmap was filtered through React scores from a web quiz, matched
    on the single name the two lists had in common, and came back as three
    weeks of Python with no AI or ML in it at all.

    The perverse part was that sitting an assessment made the roadmap worse.
    With no gap data the generator fell through to the whole track; with one
    quiz behind you it collapsed to whatever that quiz happened to name.

    So the role decides what is on the plan, and evidence only takes things
    off it. Absence of evidence about a skill is not evidence the learner has
    it. A skill scored below what it requires stays on the plan and is given
    fewer hours instead, which the hour estimate already handles.

    Args:
        ordered_skills: the role's skills, already in dependency order
        skill_gaps: list of {skill, current_score, required_score, ...}
        skill_scores: optional {skill: score} from assessments

    Returns:
        The same list minus anything already demonstrated, order preserved.
    """
    known = proven_skills(skill_gaps, skill_scores)
    return [s for s in ordered_skills if s not in known]