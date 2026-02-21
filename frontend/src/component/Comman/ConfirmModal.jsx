import { createPortal } from "react-dom";
import { HiExclamationTriangle, HiCheckCircle, HiXCircle } from "react-icons/hi2";

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-800 p-8 rounded-2xl w-96 shadow-2xl border border-slate-700 text-center animate-scaleIn">
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <div className="bg-amber-500/20 p-4 rounded-full animate-pulse">
            <HiExclamationTriangle className="w-12 h-12 text-amber-500" />
          </div>
        </div>

        {/* Message */}
        <h2 className="text-xl text-white font-bold mb-2">
          Confirm Action
        </h2>
        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
          {message}
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="group px-6 py-2.5 bg-slate-700 text-white rounded-lg font-medium transition-all duration-200 hover:bg-slate-600 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <HiXCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            No
          </button>

          <button
            onClick={onConfirm}
            className="group px-6 py-2.5 bg-linear-to-r from-red-600 to-red-700 text-white rounded-lg font-medium transition-all duration-200 hover:from-red-700 hover:to-red-800 hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg hover:shadow-red-500/50"
          >
            <HiCheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            Yes
          </button>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>,
    document.body
  );
};

export default ConfirmModal;