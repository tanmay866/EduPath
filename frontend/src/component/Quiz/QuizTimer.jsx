import { useEffect } from "react";

const QuizTimer = ({ timer, setTimer, onTimeUp }) => {
  useEffect(() => {
    if (timer <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const isLowTime = timer < 300; // Less than 5 minutes

  return (
    <div className={`p-4 rounded-lg shadow-lg text-center border transition-all ${
      isLowTime 
        ? 'bg-red-900 border-red-500/50' 
        : 'bg-slate-800 border-white/10'
    }`}>
      <div className="flex items-center justify-center gap-2 mb-1">
        <svg className={`w-4 h-4 ${isLowTime ? 'text-red-300' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className={`font-bold text-xs ${isLowTime ? 'text-red-300' : 'text-gray-400'}`}>
          TIME LEFT
        </h3>
      </div>
      <p className={`text-3xl font-bold ${
        isLowTime ? 'text-red-100 animate-pulse' : 'text-white'
      }`}>
        {minutes}:{seconds.toString().padStart(2, "0")}
      </p>
      {isLowTime && (
        <p className="text-red-300 text-xs mt-2 font-semibold">⚠ Hurry up!</p>
      )}
    </div>
  );
};

export default QuizTimer;
