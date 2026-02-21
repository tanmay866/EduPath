import React, { useState } from 'react';
import AdminSidebar from '../component/AdminSidebar';
import AdminNavbar from '../component/AdminNavbar';
import AttemptsTable from '../component/AttemptsTable';

const QuizAttempts = () => {
  const [attempts, setAttempts] = useState([
    {
      _id: '1',
      userName: 'John Doe',
      skill: 'DSA',
      difficulty: 'Easy',
      score: 8,
      totalQuestions: 10,
      createdAt: '2026-02-20',
    },
    {
      _id: '2',
      userName: 'Jane Smith',
      skill: 'MERN',
      difficulty: 'Medium',
      score: 6,
      totalQuestions: 10,
      createdAt: '2026-02-19',
    },
    {
      _id: '3',
      userName: 'Alex Johnson',
      skill: 'Java',
      difficulty: 'Hard',
      score: 4,
      totalQuestions: 10,
      createdAt: '2026-02-18',
    },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  const handleDelete = (id) => {
    setAttempts(attempts.filter((attempt) => attempt._id !== id));
  };

  const filteredAttempts = attempts.filter((attempt) => {
    const matchesSearch =
      attempt.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.skill.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDifficulty =
      difficultyFilter === 'All' || attempt.difficulty === difficultyFilter;

    return matchesSearch && matchesDifficulty;
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
            <h1 className="text-2xl font-semibold text-gray-100">Quiz Attempts</h1>
            <p className="text-sm text-gray-400 mt-1">
              Monitor all AI-generated quiz attempts.
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

            {/* Difficulty Filter */}
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-gray-900 border border-gray-800 text-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Attempts Table */}
          <AttemptsTable attempts={filteredAttempts} onDelete={handleDelete} />
        </main>
      </div>
    </div>
  );
};

export default QuizAttempts;