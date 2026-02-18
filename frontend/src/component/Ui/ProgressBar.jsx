const ProgressBar = ({ total, answered }) => {
  const percent = (answered / total) * 100;

  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-300">Progress</span>
        <span className="text-sm font-medium text-gray-300">{answered}/{total} Questions</span>
      </div>
      <div className="bg-gray-700 h-3 rounded-full overflow-hidden">
        <div
          className="bg-indigo-600 h-full transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
