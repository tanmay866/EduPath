import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, ArrowLeft, CheckCircle, Clock, MessageSquare, BarChart } from 'lucide-react';

const MockInterview = () => {
  const navigate = useNavigate();

  const features = [
    { icon: MessageSquare, text: 'AI-powered interview simulation' },
    { icon: Clock, text: 'Flexible duration based on role' },
    { icon: BarChart, text: 'Detailed feedback and improvement tips' },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-rose-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">

          {/* Back Button */}
          <button
            onClick={() => navigate('/assessment-hub')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8 group animate-fadeIn"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Assessment Hub</span>
          </button>

          {/* Main Card */}
          <div
            className="backdrop-blur-xl bg-white/5 rounded-3xl p-10 border border-white/10 shadow-2xl animate-fadeInUp"
          >
            {/* Icon */}
            <div className="w-20 h-20 bg-pink-500/20 text-pink-400 rounded-2xl flex items-center justify-center mb-6 border border-pink-500/40">
              <Mic size={40} strokeWidth={2} />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              AI Mock Interview
            </h1>

            {/* Description */}
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Practice real interview scenarios with AI-powered mock interviews and receive personalized feedback to improve your performance.
            </p>

            {/* Features */}
            <div className="space-y-4 mb-10">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 text-gray-300 animate-fadeIn"
                  style={{ animationDelay: `${0.2 + idx * 0.1}s` }}
                >
                  <feature.icon className="text-pink-400 flex-shrink-0" size={24} />
                  <span className="text-lg">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
              <h3 className="text-xl font-bold text-white mb-3">What to Expect:</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex gap-2">
                  <span className="text-pink-400">•</span>
                  <span>Role-specific technical and behavioral questions</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pink-400">•</span>
                  <span>Real-time AI analysis of your responses</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pink-400">•</span>
                  <span>Communication and confidence assessment</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-pink-400">•</span>
                  <span>Actionable feedback to improve interview skills</span>
                </li>
              </ul>
            </div>

            {/* Coming Soon Badge */}
            <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-500/40 rounded-xl p-4 mb-8 text-center">
              <p className="text-pink-400 font-semibold text-lg">🚀 Coming Soon</p>
              <p className="text-gray-400 text-sm mt-1">This feature is currently under development</p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                disabled
                className="flex-1 px-8 py-4 bg-gradient-to-r from-pink-500/50 to-rose-500/50 text-white font-bold rounded-xl cursor-not-allowed opacity-50"
              >
                Coming Soon
              </button>
              <button
                onClick={() => navigate('/assessment-hub')}
                className="flex-1 px-8 py-4 backdrop-blur-lg bg-white/5 text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300 border border-white/20"
              >
                Back to Hub
              </button>
            </div>
          </div>

        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
};

export default MockInterview;
