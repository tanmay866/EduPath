const DashboardHeader = ({ totalAttempts }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Skill Assessment
          </h1>
          <p className="text-gray-500">
            Test your skills and track your performance
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-4 py-2 backdrop-blur-lg bg-green-500/20 text-green-400 rounded-full font-semibold text-sm border border-green-500/30">
            Active
          </span>
          <span className="px-4 py-2 backdrop-blur-lg bg-blue-500/20 text-blue-400 rounded-full font-semibold text-sm border border-blue-500/30">
            {totalAttempts} Completed
          </span>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
