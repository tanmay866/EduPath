import React from 'react';

const AttemptsTable = () => {
  // Static data for demonstration
  const attempts = [
    {
      _id: '1',
      userName: 'John Doe',
      skill: 'JavaScript',
      difficulty: 'Easy',
      score: 8,
      totalQuestions: 10,
      createdAt: '2026-02-20T10:30:00Z',
    },
    {
      _id: '2',
      userName: 'Jane Smith',
      skill: 'React',
      difficulty: 'Medium',
      score: 7,
      totalQuestions: 10,
      createdAt: '2026-02-19T14:20:00Z',
    },
    {
      _id: '3',
      userName: 'Mike Johnson',
      skill: 'Node.js',
      difficulty: 'Hard',
      score: 6,
      totalQuestions: 10,
      createdAt: '2026-02-18T09:15:00Z',
    },
    {
      _id: '4',
      userName: 'Sarah Williams',
      skill: 'Python',
      difficulty: 'Easy',
      score: 9,
      totalQuestions: 10,
      createdAt: '2026-02-17T16:45:00Z',
    },
    {
      _id: '5',
      userName: 'Tom Brown',
      skill: 'TypeScript',
      difficulty: 'Medium',
      score: 5,
      totalQuestions: 10,
      createdAt: '2026-02-16T11:00:00Z',
    },
  ];

  const onDelete = (id) => {
    console.log('Delete attempt with ID:', id);
    // Delete logic will be implemented later
  };

  const getDifficultyBadgeClass = (difficulty) => {
    const baseClass = 'px-2 py-1 rounded-md text-xs font-medium';
    switch (difficulty) {
      case 'Easy':
        return `${baseClass} bg-green-900 text-green-300`;
      case 'Medium':
        return `${baseClass} bg-yellow-900 text-yellow-300`;
      case 'Hard':
        return `${baseClass} bg-red-900 text-red-300`;
      default:
        return `${baseClass} bg-gray-700 text-gray-300`;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!attempts || attempts.length === 0) {
    return (
      <div className="bg-gray-800 rounded-xl shadow-md p-8">
        <p className="text-center text-gray-400">No quiz attempts found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-xl shadow-md overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-900">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Skill
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Difficulty
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Score
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {attempts.map((attempt) => (
            <tr key={attempt._id} className="hover:bg-gray-700 transition">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                {attempt.userName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {attempt.skill}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getDifficultyBadgeClass(attempt.difficulty)}>
                  {attempt.difficulty}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {attempt.score} / {attempt.totalQuestions}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {formatDate(attempt.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button className="text-indigo-400 hover:text-indigo-300 font-medium mr-4">
                  View
                </button>
                <button
                  onClick={() => onDelete(attempt._id)}
                  className="text-red-400 hover:text-red-300 font-medium"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AttemptsTable;