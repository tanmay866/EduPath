import React, { useState } from 'react';
import AdminSidebar from '../component/AdminSidebar';
import AdminNavbar from '../component/AdminNavbar';
import RoadmapTable from '../component/RoadmapTable';

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
    <div className="flex h-screen bg-gray-950 relative overflow-hidden">
      {/* Live Moving Background Animations */}
      <div className="animated-bg">
        {/* Moving Shapes */}
        <div className="moving-shape shape-1"></div>
        <div className="moving-shape shape-2"></div>
        <div className="moving-shape shape-3"></div>
        <div className="moving-shape shape-4"></div>
        <div className="moving-shape shape-5"></div>
        <div className="moving-shape shape-6"></div>
        <div className="moving-shape shape-7"></div>
        <div className="moving-shape shape-8"></div>
        
        {/* Rotating Center Gradient */}
        <div className="rotating-gradient"></div>
        
        {/* Floating Particles */}
        <div className="floating-particle" style={{top: '5%', left: '15%', animationDelay: '0s'}}></div>
        <div className="floating-particle" style={{top: '8%', left: '85%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '12%', left: '50%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '15%', left: '20%', animationDelay: '0s'}}></div>
        <div className="floating-particle" style={{top: '25%', left: '70%', animationDelay: '1s'}}></div>
        <div className="floating-particle" style={{top: '45%', left: '10%', animationDelay: '2s'}}></div>
        <div className="floating-particle" style={{top: '55%', left: '85%', animationDelay: '1.5s'}}></div>
        <div className="floating-particle" style={{top: '75%', left: '30%', animationDelay: '0.5s'}}></div>
        <div className="floating-particle" style={{top: '65%', left: '60%', animationDelay: '2.5s'}}></div>
        <div className="floating-particle" style={{top: '35%', left: '50%', animationDelay: '3s'}}></div>
        <div className="floating-particle" style={{top: '85%', left: '75%', animationDelay: '1.2s'}}></div>
      </div>

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
              className="bg-gray-900 border border-gray-800 text-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-96"
            />

            {/* Level Filter */}
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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