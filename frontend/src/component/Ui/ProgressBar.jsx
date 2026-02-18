const ProgressBar = ({ total, answered }) => {
  const percent = (answered / total) * 100;

  return (
    <div className="bg-gray-200 h-3 rounded-full overflow-hidden">
      <div
        className="bg-indigo-600 h-full"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};

export default ProgressBar;
