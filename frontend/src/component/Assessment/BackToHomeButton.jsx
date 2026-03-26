import { useNavigate } from "react-router-dom";

const BackToHomeButton = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate("/")}
      className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-200 bg-white/10 border border-white/20 rounded-lg hover:bg-white/15 hover:text-white transition-all ${className}`}
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back to Home
    </button>
  );
};

export default BackToHomeButton;
