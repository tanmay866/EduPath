import React from 'react';

const UsersTable = ({ users, onDelete, onToggleBlock }) => {
  const fallbackData = [
    {
      _id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      isBlocked: false,
      createdAt: '2026-02-18',
    },
    {
      _id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      isBlocked: true,
      createdAt: '2026-02-17',
    },
  ];

  const data = !users || users.length === 0 ? fallbackData : users;

  const handleDelete = (id) => {
    if (onDelete) {
      onDelete(id);
    } else {
      console.log('Delete user with ID:', id);
    }
  };

  const handleToggleBlock = (id) => {
    if (onToggleBlock) {
      onToggleBlock(id);
    } else {
      console.log('Toggle block for user with ID:', id);
    }
  };

  const getStatusBadgeClass = (isBlocked) => {
    const baseClass = 'px-2 py-1 rounded-md text-xs font-medium';
    if (isBlocked) {
      return `${baseClass} bg-red-900 text-red-300`;
    }
    return `${baseClass} bg-green-900 text-green-300`;
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
      <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg p-8">
        <p className="text-center text-gray-400">No users found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-700 bg-gray-800">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Joined Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700 text-gray-200">
          {data.map((user) => (
            <tr key={user._id} className="hover:bg-gray-800 transition">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                {user.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {user.email}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={getStatusBadgeClass(user.isBlocked)}>
                  {user.isBlocked ? 'Blocked' : 'Active'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {formatDate(user.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <button
                  onClick={() => handleToggleBlock(user._id)}
                  className="text-yellow-400 hover:text-yellow-300 font-medium mr-4"
                >
                  {user.isBlocked ? 'Unblock' : 'Block'}
                </button>
                <button
                  onClick={() => handleDelete(user._id)}
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

export default UsersTable;