export const performanceStats = {
  totalAttempts: 5,
  averageScore: 75,
  highestScore: 90,
  lastAttemptStatus: "Pass",
};

export const performanceCardsConfig = [
  {
    id: 1,
    label: "Total Attempts",
    value: performanceStats.totalAttempts,
    color: "blue",
    iconType: "document",
  },
  {
    id: 2,
    label: "Average Score",
    value: `${performanceStats.averageScore}%`,
    color: "purple",
    iconType: "chart",
  },
  {
    id: 3,
    label: "Highest Score",
    value: `${performanceStats.highestScore}%`,
    color: "yellow",
    iconType: "lightning",
  },
  {
    id: 4,
    label: "Last Attempt",
    value: performanceStats.lastAttemptStatus,
    color: "green",
    iconType: "badge",
  },
];

export const availableAssessments = [
  {
    id: "assessment-1",
    title: "Frontend Development Assessment",
    skill: "React.js",
    duration: 30,
    totalQuestions: 10,
    difficultyLevel: "Intermediate",
    isAvailable: true,
  },
  {
    id: "assessment-2",
    title: "Backend Development Assessment",
    skill: "Node.js & Express",
    duration: 45,
    totalQuestions: 15,
    difficultyLevel: "Advanced",
    isAvailable: true,
  },
  {
    id: "assessment-3",
    title: "Database Design Assessment",
    skill: "SQL & MongoDB",
    duration: 35,
    totalQuestions: 12,
    difficultyLevel: "Intermediate",
    isAvailable: true,
  },
];

export const previousAttempts = [
  {
    id: 1,
    date: "18 Feb 2026",
    score: 8,
    totalQuestions: 10,
    percentage: 80,
    status: "Pass",
  },
  {
    id: 2,
    date: "15 Feb 2026",
    score: 9,
    totalQuestions: 10,
    percentage: 90,
    status: "Pass",
  },
  {
    id: 3,
    date: "12 Feb 2026",
    score: 6,
    totalQuestions: 10,
    percentage: 60,
    status: "Fail",
  },
  {
    id: 4,
    date: "10 Feb 2026",
    score: 7,
    totalQuestions: 10,
    percentage: 70,
    status: "Pass",
  },
  {
    id: 5,
    date: "08 Feb 2026",
    score: 7,
    totalQuestions: 10,
    percentage: 70,
    status: "Pass",
  },
];
