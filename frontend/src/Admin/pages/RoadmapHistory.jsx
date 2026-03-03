import React, { useState } from 'react';
import AdminSidebar from '../component/AdminSidebar';
import AdminNavbar from '../component/AdminNavbar';
import RoadmapTable from '../component/RoadmapTable';
import BackgroundAnimation from '../../Pages/Assessment/AssesmentDashboard/components/BackgroundAnimation';

const RoadmapHistory = () => {
  const [roadmaps, setRoadmaps] = useState([
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
    {
      _id: '3',
      userName: 'Alex Johnson',
      skill: 'Java',
      level: 'Intermediate',
      modulesCount: 7,
      createdAt: '2026-02-18',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');

  const handleDelete = (id) => {
    setRoadmaps(roadmaps.filter((roadmap) => roadmap._id !== id));
  };

  const filteredRoadmaps = roadmaps.filter((roadmap) => {
    const matchesSearch =
      roadmap.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      roadmap.skill.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesLevel =
      levelFilter === 'All' || roadmap.level === levelFilter;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="flex h-screen bg-black relative overflow-hidden">
      <BackgroundAnimation />

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Navbar */}
        <AdminNavbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-semibold text-gray-100">Roadmap History</h1>
            <p className="text-sm text-gray-400 mt-1">
              View all AI-generated learning roadmaps.
            </p>
          </div>

          {/* Controls Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by user or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white/5 border border-white/10 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-96"
            />

            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-white/5 border border-white/10 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Roadmap Table */}
          <RoadmapTable roadmaps={filteredRoadmaps} onDelete={handleDelete} />
        </main>
      </div>
    </div>
  );
};

export default RoadmapHistory;