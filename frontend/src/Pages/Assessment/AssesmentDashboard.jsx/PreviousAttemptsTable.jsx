import { useNavigate } from "react-router-dom";

const PreviousAttemptsTable = ({ attempts }) => {
  const navigate = useNavigate();

  const handleViewResult = (attempt) => {
    navigate(`/assessment/result/${attempt.resultId || attempt.id}`);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">
        Previous Attempts
      </h2>

      <div className="bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50 border-b-2 border-white/10">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Attempt Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {attempts.map((attempt) => (
                <tr key={attempt.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {attempt.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                    {attempt.score}/{attempt.totalQuestions}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <div className="flex items-center gap-2">
                      <div className="w-16 backdrop-blur-lg bg-white/10 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            attempt.percentage >= 70 ? "bg-green-500" : "bg-red-500"
                          }`}
                          style={{ width: `${attempt.percentage}%` }}
                        />
                      </div>
                      <span className="font-medium">{attempt.percentage}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full backdrop-blur-lg ${
                        attempt.status === "Pass"
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {attempt.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleViewResult(attempt)}
                      className="text-indigo-400 hover:text-indigo-300 font-medium hover:underline"
                    >
                      View Result →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {attempts.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No previous attempts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousAttemptsTable;
