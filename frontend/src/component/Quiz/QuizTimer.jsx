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

  return (
    <div className="bg-white p-4 rounded-lg shadow text-center">
      <h3 className="font-bold text-lg">Time Left</h3>
      <p className="text-2xl text-red-500 font-bold">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </p>
    </div>
  );
};

export default QuizTimer;
