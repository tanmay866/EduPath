import React from 'react';

const StatCard = ({ title, value, icon: Icon, change, changeType }) => {
  const displayValue = value !== undefined && value !== null ? value : '0';

  const getChangeClass = () => {
    if (changeType === 'increase') {
      return 'text-green-400';
    }
    if (changeType === 'decrease') {
      return 'text-red-400';
    }
    return 'text-gray-400';
  };

  const getChangeSymbol = () => {
    if (changeType === 'increase') {
      return '+';
    }
    if (changeType === 'decrease' && change > 0) {
      return '-';
    }
    return '';
  };

  return (
    <div className="backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-xl shadow-lg p-5 transition hover:border-white/20 hover:bg-slate-900/80">
      <div className="flex justify-between items-center">
        {/* Left Side */}
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-2xl font-semibold text-white mt-1">{displayValue}</p>
          {change !== undefined && change !== null && (
            <p className={`text-sm font-medium mt-1 ${getChangeClass()}`}>
              {getChangeSymbol()}
              {Math.abs(change)}%
            </p>
          )}
        </div>

        {/* Right Side - Icon */}
        {Icon && (
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;