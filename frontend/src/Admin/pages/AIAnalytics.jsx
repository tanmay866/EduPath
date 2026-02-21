import React from 'react';
import AdminSidebar from '../component/AdminSidebar';
import AdminNavbar from '../component/AdminNavbar';
import StatCard from '../component/StatCard';
import ChartCard from '../component/ChartCard';
import { Zap, TrendingUp, ClipboardList, Map } from 'lucide-react';

const AIAnalytics = () => {
  const statsData = {
    totalRequests: 842,
    todayRequests: 37,
    quizGenerations: 512,
    roadmapGenerations: 330,
  };

  const skillsData = [
    { name: 'DSA', value: 120 },
    { name: 'MERN', value: 95 },
    { name: 'Java', value: 80 },
    { name: 'Python', value: 60 },
  ];

  const difficultyData = [
    { name: 'Easy', value: 200 },
    { name: 'Medium', value: 150 },
    { name: 'Hard', value: 100 },
  ];

  const tokenData = {
    totalTokens: 125000,
    avgTokensPerRequest: 148,
  };

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
            <h1 className="text-2xl font-semibold text-gray-100">AI Analytics</h1>
            <p className="text-sm text-gray-400 mt-1">
              Monitor AI usage, generation patterns, and system activity.
            </p>
          </div>

          {/* Section 1: AI Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total AI Requests"
              value={statsData.totalRequests}
              icon={Zap}
              change={15}
              changeType="increase"
            />
            <StatCard
              title="Requests Today"
              value={statsData.todayRequests}
              icon={TrendingUp}
              change={8}
              changeType="increase"
            />
            <StatCard
              title="Total Quiz Generations"
              value={statsData.quizGenerations}
              icon={ClipboardList}
              change={12}
              changeType="increase"
            />
            <StatCard
              title="Total Roadmap Generations"
              value={statsData.roadmapGenerations}
              icon={Map}
              change={5}
              changeType="increase"
            />
          </div>

          {/* Section 2: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Most Requested Skills"
              subtitle="Top skills requested by users"
              data={skillsData}
              type="bar"
            />
            <ChartCard
              title="Difficulty Distribution"
              subtitle="Quiz difficulty breakdown"
              data={difficultyData}
              type="pie"
            />
          </div>

          {/* Section 3: Token Usage Summary */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-100 mb-4">
              Token Usage Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-400">Total Tokens Used</p>
                <p className="text-2xl font-semibold text-gray-100 mt-1">
                  {tokenData.totalTokens.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Average Tokens per Request</p>
                <p className="text-2xl font-semibold text-gray-100 mt-1">
                  {tokenData.avgTokensPerRequest}
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AIAnalytics;