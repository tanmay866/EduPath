import React from 'react';
import AdminSidebar from '../component/AdminSidebar';
import AdminNavbar from '../component/AdminNavbar';
import StatCard from '../component/StatCard';
import ChartCard from '../component/ChartCard';
import AttemptsTable from '../component/AttemptsTable';
import { Users, ClipboardList, Map, Zap } from 'lucide-react';
import BackgroundAnimation from '../../Pages/Assessment/AssesmentDashboard/components/BackgroundAnimation';

const AdminDashboard = () => {
  const statsData = {
    users: 124,
    attempts: 356,
    roadmaps: 89,
    aiToday: 42,
  };

  const skillUsageData = [
    { name: 'DSA', value: 40 },
    { name: 'MERN', value: 30 },
    { name: 'Java', value: 20 },
  ];

  const difficultyData = [
    { name: 'Easy', value: 45 },
    { name: 'Medium', value: 35 },
    { name: 'Hard', value: 20 },
  ];

  const recentAttempts = [
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

  const handleDeleteAttempt = (id) => {
    console.log('Delete attempt with ID:', id);
  };

  return (
    <div className="flex h-screen bg-black relative overflow-hidden">
      <BackgroundAnimation />

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        {/* Navbar */}
        <AdminNavbar />

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Users"
              value={statsData.users}
              icon={Users}
              change={12}
              changeType="increase"
            />
            <StatCard
              title="Quiz Attempts"
              value={statsData.attempts}
              icon={ClipboardList}
              change={8}
              changeType="increase"
            />
            <StatCard
              title="Roadmaps Generated"
              value={statsData.roadmaps}
              icon={Map}
              change={5}
              changeType="increase"
            />
            <StatCard
              title="AI Requests Today"
              value={statsData.aiToday}
              icon={Zap}
              change={3}
              changeType="decrease"
            />
          </div>

          {/* Section 2: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Skill Usage"
              subtitle="Popular skills among users"
              data={skillUsageData}
              type="bar"
            />
            <ChartCard
              title="Difficulty Distribution"
              subtitle="Quiz difficulty breakdown"
              data={difficultyData}
              type="pie"
            />
          </div>

          {/* Section 3: Recent Quiz Attempts */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-100">Recent Quiz Attempts</h2>
            <AttemptsTable attempts={recentAttempts} onDelete={handleDeleteAttempt} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
