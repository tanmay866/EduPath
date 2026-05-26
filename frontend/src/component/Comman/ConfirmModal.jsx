import { createPortal } from "react-dom";
import { HiExclamationTriangle, HiCheckCircle, HiXCircle } from "react-icons/hi2";

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md animate-fadeIn px-4">

      {/* Ambient glow behind modal */}
      <div className="absolute w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute w-48 h-48 bg-purple-600/15 rounded-full blur-2xl pointer-events-none translate-x-20 translate-y-10" />

      <div className="relative backdrop-blur-xl bg-slate-900/80 border border-white/10 p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center animate-scaleIn overflow-hidden">

        {/* Top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

        {/* Icon */}
        <div className="mb-5 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-md animate-pulse" />
            <div className="relative bg-amber-500/10 border border-amber-500/30 p-4 rounded-full backdrop-blur-sm">
              <HiExclamationTriangle className="w-10 h-10 text-amber-400" />
            </div>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">
          Confirm Action
        </h2>

        {/* Message */}
        <p className="text-gray-400 mb-7 text-sm leading-relaxed">
          {message}
        </p>

        {/* Divider */}
        <div className="w-full h-px bg-white/5 mb-6" />

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="group flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-gray-300 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <HiXCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="group flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-600/80 to-purple-600/80 border border-indigo-500/40 hover:from-indigo-500/90 hover:to-purple-500/90 hover:border-indigo-400/50 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <HiCheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
            Confirm
          </button>
        </div>

        {/* Bottom gradient line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.2s ease-out; }
        .animate-scaleIn { animation: scaleIn 0.25s ease-out; }
      `}</style>
    </div>,
    document.body
  );
};

export default ConfirmModal;
