"""
Dependency Resolver — Directed Acyclic Graph (DAG) based topological sort.
Ensures skills are always scheduled after their prerequisites.
"""

from collections import defaultdict, deque
from typing import Dict, List


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


def filter_skills_by_gap(
    ordered_skills: List[str],
    skill_gaps: List[dict],
    include_all: bool = False,
) -> List[str]:
    """
    Filter the full topologically-sorted skill list down to only what
    the user actually needs to learn, while preserving dependency order.

    Args:
        ordered_skills: topologically sorted full skill list
        skill_gaps: list of {skill, gap_severity, priority_rank, ...}
        include_all: if True, return all skills (e.g. beginner users)

    Returns:
        Filtered & ordered list of skill names to include in roadmap.
    """
    if include_all:
        return ordered_skills

    gap_skill_names = {g["skill"] for g in skill_gaps}

    # Also include any transitive dependencies even if not in gap list
    # (we can't do Async JS without JS Basics even if JS Basics score is OK)
    return [s for s in ordered_skills if s in gap_skill_names]


def resolve_with_dependencies(
    ordered_skills: List[str],
    skill_gaps: List[dict],
    all_skills: Dict[str, dict],
) -> List[str]:
    """
    Ensures transitive dependencies are included even if they aren't
    in the skill gap list directly.
    """
    gap_skill_names = {g["skill"] for g in skill_gaps}
    required: set = set()

    def add_with_deps(skill_name: str):
        if skill_name not in all_skills or skill_name in required:
            return
        for dep in all_skills[skill_name].get("dependencies", []):
            add_with_deps(dep)
        required.add(skill_name)

    for skill in gap_skill_names:
        add_with_deps(skill)

    return [s for s in ordered_skills if s in required]