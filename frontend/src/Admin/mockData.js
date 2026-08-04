/**
 * Sample data for the admin screens.
 *
 * None of the admin pages have ever been wired to the API — each one declared
 * its own literal array inline. Collecting them here does not make them real,
 * but it does put the fiction in one file so it is obvious what still needs an
 * endpoint, and so the screens stop disagreeing with each other about who the
 * users are.
 */

export const IS_SAMPLE_DATA = true;

export const overviewStats = [
  { label: 'Users', value: 124, delta: '+12%' },
  { label: 'Quiz attempts', value: 356, delta: '+8%' },
  { label: 'Roadmaps', value: 89, delta: '+5%' },
  { label: 'AI calls today', value: 42, delta: '-3%' },
];

export const skillUsage = [
  { label: 'DSA', value: 40 },
  { label: 'MERN', value: 30 },
  { label: 'Java', value: 20 },
  { label: 'Python', value: 16 },
  { label: 'DevOps', value: 11 },
  { label: 'Mobile', value: 7 },
];

export const difficultySplit = [
  { label: 'Easy', value: 45 },
  { label: 'Medium', value: 35 },
  { label: 'Hard', value: 20 },
  { label: 'Mixed', value: 12 },
  { label: 'Untagged', value: 4 },
];

export const attempts = [
  { _id: '1', userName: 'John Doe', skill: 'JavaScript', difficulty: 'Easy', score: 8, totalQuestions: 10, createdAt: '2026-02-20T10:30:00Z' },
  { _id: '2', userName: 'Jane Smith', skill: 'React', difficulty: 'Medium', score: 7, totalQuestions: 10, createdAt: '2026-02-19T14:20:00Z' },
  { _id: '3', userName: 'Mike Johnson', skill: 'Node.js', difficulty: 'Hard', score: 6, totalQuestions: 10, createdAt: '2026-02-18T09:15:00Z' },
  { _id: '4', userName: 'Sarah Williams', skill: 'Python', difficulty: 'Easy', score: 9, totalQuestions: 10, createdAt: '2026-02-17T16:45:00Z' },
  { _id: '5', userName: 'Tom Brown', skill: 'TypeScript', difficulty: 'Medium', score: 5, totalQuestions: 10, createdAt: '2026-02-16T11:00:00Z' },
  { _id: '6', userName: 'Alex Johnson', skill: 'Java', difficulty: 'Hard', score: 4, totalQuestions: 10, createdAt: '2026-02-15T08:05:00Z' },
];

export const users = [
  { _id: '1', name: 'John Doe', email: 'john@example.com', isBlocked: false, createdAt: '2026-02-18' },
  { _id: '2', name: 'Jane Smith', email: 'jane@example.com', isBlocked: true, createdAt: '2026-02-17' },
  { _id: '3', name: 'Alex Johnson', email: 'alex@example.com', isBlocked: false, createdAt: '2026-02-16' },
  { _id: '4', name: 'Sarah Williams', email: 'sarah@example.com', isBlocked: false, createdAt: '2026-02-14' },
];

export const roadmaps = [
  { _id: '1', userName: 'John Doe', skill: 'MERN Stack', level: 'Beginner', weeks: 12, progress: 42, createdAt: '2026-02-20' },
  { _id: '2', userName: 'Jane Smith', skill: 'DSA', level: 'Advanced', weeks: 16, progress: 78, createdAt: '2026-02-19' },
  { _id: '3', userName: 'Alex Johnson', skill: 'Java', level: 'Intermediate', weeks: 14, progress: 15, createdAt: '2026-02-18' },
  { _id: '4', userName: 'Sarah Williams', skill: 'Data Science', level: 'Beginner', weeks: 20, progress: 63, createdAt: '2026-02-15' },
];

export const aiStats = [
  { label: 'AI requests', value: 842, delta: '+15%' },
  { label: 'Today', value: 37, delta: '+8%' },
  { label: 'Quizzes made', value: 512, delta: '+12%' },
  { label: 'Roadmaps made', value: 330, delta: '+5%' },
];

export const requestedSkills = [
  { label: 'DSA', value: 120 },
  { label: 'MERN', value: 95 },
  { label: 'Java', value: 80 },
  { label: 'Python', value: 60 },
];

export const tokenUsage = {
  total: 125000,
  averagePerRequest: 148,
};
