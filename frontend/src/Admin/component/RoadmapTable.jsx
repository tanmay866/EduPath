import React from 'react';

const RoadmapTable = ({ roadmaps, onDelete }) => {
  const fallbackData = [
    {
      _id: '1',
      userName: 'John Doe',
      skill: 'MERN Stack',
      level: 'Beginner',
      modulesCount: 6,
      createdAt: '2026-02-20',
    },
    {
      _id: '2',
      userName: 'Jane Smith',
      skill: 'DSA',
      level: 'Advanced',
      modulesCount: 8,
      createdAt: '2026-02-19',
    },
  ];

  const data = !roadmaps || roadmaps.length === 0 ? fallbackData : roadmaps;

  const handleDelete = (id) => {
    if (onDelete) {
      onDelete(id);
    } else {
      console.log('Delete roadmap with ID:', id);
    }
  };

  const getLevelBadgeClass = (level) => {
    const baseClass = 'px-2 py-1 rounded-md text-xs font-medium';
    switch (level) {
      case 'Beginner':
        return `${baseClass} bg-green-500/10 border border-green-500/20 text-green-400`;
      case 'Intermediate':
        return `${baseClass} bg-yellow-500/10 border border-yellow-500/20 text-yellow-400`;
      case 'Advanced':
        return `${baseClass} bg-red-500/10 border border-red-500/20 text-red-400`;
      default:
        return `${baseClass} bg-white/5 border border-white/10 text-gray-300`;
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

  if (!data || data.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl shadow-lg p-8">
        <p className="text-center text-gray-400">No roadmaps found.</p>
      </div>
    );
  }

  return (
    <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl shadow-lg overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10 bg-white/5">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Skill
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Level
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Modules
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Generated Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {data.map((roadmap) => (
            <tr key={roadmap._id} className="hover:bg-white/5 transition">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">
                {roadmap.userName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {roadmap.skill}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getLevelBadgeClass(roadmap.level)}>
                  {roadmap.level}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {roadmap.modulesCount}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {formatDate(roadmap.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button className="text-indigo-400 hover:text-indigo-300 font-medium mr-4">
                  View
                </button>
                <button
                  onClick={() => handleDelete(roadmap._id)}
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

export default RoadmapTable;
