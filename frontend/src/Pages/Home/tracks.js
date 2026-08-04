/**
 * The six role tracks, from the landing composition in
 * design_handoff_edupath_redesign/EduPath - New Design.dc.html.
 *
 * Shared by the landing index and the Tracks page so the two cannot drift.
 * These are the tracks the roadmap generator supports — see
 * backend/services/roadmapGenerator for the same six.
 */
export const TRACKS = [
  {
    name: 'MERN Developer',
    stack: 'JavaScript, React, Node, Express, MongoDB',
    weeks: 18,
    nodes: 34,
    summary:
      'The full JavaScript stack, front to back: build interfaces with React, serve them from Express, and store what they produce in MongoDB.',
  },
  {
    name: 'AI / ML Engineer',
    stack: 'Python, PyTorch, LLMs, evaluation, MLOps',
    weeks: 24,
    nodes: 41,
    summary:
      'Train and evaluate models, then get them into production — including the parts most courses skip, like measurement and deployment.',
  },
  {
    name: 'Data Science Engineer',
    stack: 'SQL, pandas, statistics, visualisation',
    weeks: 20,
    nodes: 37,
    summary:
      'Query, clean and interrogate real data, then present a finding somebody can act on without needing you to explain it.',
  },
  {
    name: 'DevOps Engineer',
    stack: 'Linux, Docker, Kubernetes, CI/CD, IaC',
    weeks: 16,
    nodes: 29,
    summary:
      'Ship other people’s code safely and repeatedly: containers, pipelines, infrastructure written down rather than clicked together.',
  },
  {
    name: 'Mobile Developer',
    stack: 'React Native, Swift, Kotlin, store release',
    weeks: 14,
    nodes: 26,
    summary:
      'Build for phones and get through review — the release process is part of the track, not an afterthought.',
  },
  {
    name: 'Cybersecurity Engineer',
    stack: 'Networking, threat modelling, pentesting',
    weeks: 22,
    nodes: 38,
    summary:
      'Understand how systems are attacked so you can argue about how they should be defended, with evidence.',
  },
];

export default TRACKS;
