/**
 * The six role tracks. Shared by the landing index, the Tracks page and the
 * public roadmap page so the three cannot drift.
 *
 * `nodes` and `weeks` are what the generator actually produces, not figures
 * from the design composition — those claimed 34 nodes in 18 weeks for MERN
 * against a real 14 nodes in 55, promising more content in less time than the
 * product delivers, which is the worst direction to be wrong in.
 *
 * Regenerate after changing ai_service/data/role_templates.py:
 *
 *   cd ai_service && .venv/bin/python3 -c "
 *   import sys; sys.path.insert(0,'.')
 *   from agents.roadmap_generator import RoadmapGeneratorAgent
 *   g=RoadmapGeneratorAgent()
 *   for r in ['MERN Developer','AI/ML Engineer','Data Science Engineer',
 *             'DevOps Engineer','Mobile Developer','Cybersecurity Engineer']:
 *       o=g.generate({'user_id':'x','target_role':r,'experience_level':'beginner',
 *                     'hours_per_week':10,'skill_gaps':[],'skill_scores':{},'current_skills':[]})
 *       print(r, len(o['skills']), o['total_duration_weeks'])"
 *
 * Weeks are not a property of the track — they fall out of hours per week and
 * experience level. These assume the pace below, and the page says so rather
 * than quoting a bare number that is only true for one kind of learner.
 */
export const TRACK_PACE_HOURS = 10;
export const TRACK_PACE_LEVEL = 'beginner';

export const TRACKS = [
  {
    // Matches the canonical role names the roadmap generator matches on, so a
    // track shown here is a track that can actually be built.
    name: 'MERN Developer',
    stack: 'JavaScript, React, Node, Express, MongoDB',
    weeks: 49,
    nodes: 14,
    summary:
      'The full JavaScript stack, front to back: build interfaces with React, serve them from Express, and store what they produce in MongoDB.',
  },
  {
    name: 'AI/ML Engineer',
    stack: 'Python, PyTorch, LLMs, evaluation, MLOps',
    weeks: 42,
    nodes: 9,
    summary:
      'Train and evaluate models, then get them into production — including the parts most courses skip, like measurement and deployment.',
  },
  {
    name: 'Data Science Engineer',
    stack: 'SQL, pandas, statistics, visualisation',
    weeks: 30,
    nodes: 8,
    summary:
      'Query, clean and interrogate real data, then present a finding somebody can act on without needing you to explain it.',
  },
  {
    name: 'DevOps Engineer',
    stack: 'Linux, Docker, Kubernetes, CI/CD, IaC',
    weeks: 32,
    nodes: 8,
    summary:
      'Ship other people’s code safely and repeatedly: containers, pipelines, infrastructure written down rather than clicked together.',
  },
  {
    name: 'Mobile Developer',
    stack: 'React Native, Swift, Kotlin, store release',
    weeks: 29,
    nodes: 8,
    summary:
      'Build for phones and get through review — the release process is part of the track, not an afterthought.',
  },
  {
    name: 'Cybersecurity Engineer',
    stack: 'Networking, threat modelling, pentesting',
    weeks: 32,
    nodes: 7,
    summary:
      'Understand how systems are attacked so you can argue about how they should be defended, with evidence.',
  },
];

/**
 * Every technology the six tracks name, each once, in track order.
 *
 * Derived from the stacks above rather than written out again, so the band on
 * the home page cannot end up advertising something no track teaches — or
 * quietly miss something that was added to one.
 */
export const TRACK_TECHNOLOGIES = [
  ...new Set(
    TRACKS.flatMap((track) => track.stack.split(',').map((name) => name.trim())).filter(Boolean)
  ),
];

export default TRACKS;
