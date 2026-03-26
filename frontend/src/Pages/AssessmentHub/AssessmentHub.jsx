import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, PuzzleIcon, Code, Mic, ArrowRight, Sparkles } from 'lucide-react';
import { getQuizHistory } from '../Services/assessmentService';

const AssessmentHub = () => {
  const navigate = useNavigate();
  const [completedAssessments, setCompletedAssessments] = useState({
    skill: false,
    aptitude: false,
    csFundamentals: false,
    mockInterview: false,
  });

  useEffect(() => {
    // Check if user has completed any assessments
    const checkCompletedAssessments = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (token) {
          const response = await getQuizHistory();
          if (response.data && response.data.history && response.data.history.length > 0) {
            // User has completed at least one assessment
            setCompletedAssessments(prev => ({
              ...prev,
              skill: true,
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching quiz history:', error);
      }
    };

    checkCompletedAssessments();
  }, []);

  const assessmentCards = [
    {
      id: 1,
      title: 'Skill Assessment',
      description: 'Analyze your technical skills and discover your strengths and weaknesses.',
      icon: Brain,
      path: '/assessment-hub/skill',
      gradient: 'from-indigo-500/20 to-purple-500/20',
      borderGradient: 'from-indigo-500 to-purple-500',
      iconBg: 'bg-indigo-500/20',
      iconBorder: 'border-indigo-500/40',
      iconColor: 'text-indigo-400',
      glowColor: 'shadow-indigo-500/50',
      hoverGlow: 'hover:shadow-indigo-500/60',
      completed: completedAssessments.skill,
    },
    {
      id: 2,
      title: 'Aptitude Test',
      description: 'Test your logical reasoning, quantitative ability, and problem-solving skills.',
      icon: PuzzleIcon,
      path: '/assessment-hub/aptitude',
      gradient: 'from-cyan-500/20 to-blue-500/20',
      borderGradient: 'from-cyan-500 to-blue-500',
      iconBg: 'bg-cyan-500/20',
      iconBorder: 'border-cyan-500/40',
      iconColor: 'text-cyan-400',
      glowColor: 'shadow-cyan-500/50',
      hoverGlow: 'hover:shadow-cyan-500/60',
      completed: completedAssessments.aptitude,
    },
    {
      id: 3,
      title: 'CS Fundamentals',
      description: 'Evaluate your core computer science knowledge including DSA, OOP, DBMS, and OS.',
      icon: Code,
      path: '/assessment-hub/cs-fundamentals',
      gradient: 'from-emerald-500/20 to-green-500/20',
      borderGradient: 'from-emerald-500 to-green-500',
      iconBg: 'bg-emerald-500/20',
      iconBorder: 'border-emerald-500/40',
      iconColor: 'text-emerald-400',
      glowColor: 'shadow-emerald-500/50',
      hoverGlow: 'hover:shadow-emerald-500/60',
      completed: completedAssessments.csFundamentals,
    },
    {
      id: 4,
      title: 'AI Mock Interview',
      description: 'Practice real interview scenarios with AI-powered mock interviews and feedback.',
      icon: Mic,
      path: '/assessment-hub/mock-interview',
      gradient: 'from-pink-500/20 to-rose-500/20',
      borderGradient: 'from-pink-500 to-rose-500',
      iconBg: 'bg-pink-500/20',
      iconBorder: 'border-pink-500/40',
      iconColor: 'text-pink-400',
      glowColor: 'shadow-pink-500/50',
      hoverGlow: 'hover:shadow-pink-500/60',
      completed: completedAssessments.mockInterview,
    },
  ];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-96 h-96 bg-purple-600/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-600/8 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">

          {/* Hero Section */}
          <div
            className="text-center mb-16 animate-fadeIn"
            style={{ animationDelay: '0s' }}
          >
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-semibold tracking-wide mb-6 backdrop-blur-lg animate-fadeIn"
              style={{ animationDelay: '0.2s' }}
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                AI-Powered Assessments
              </span>
            </div>

            {/* Title */}
            <h1
              className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight animate-fadeIn"
              style={{ animationDelay: '0.3s' }}
            >
              Assessment Hub
            </h1>

            {/* Subtitle */}
            <p
              className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fadeIn"
              style={{ animationDelay: '0.4s' }}
            >
              Evaluate your skills, test your knowledge, and prepare for real interviews with AI-powered assessments.
            </p>
          </div>

          {/* Assessment Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {assessmentCards.map((card, idx) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.id}
                  className="group relative animate-fadeInUp"
                  style={{ animationDelay: `${0.5 + idx * 0.1}s` }}
                >
                  {/* Gradient Border Effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.borderGradient} rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 ${card.glowColor}`} />

                  {/* Card */}
                  <div className={`relative backdrop-blur-xl bg-white/5 rounded-2xl p-8 border border-white/10 group-hover:border-white/20 transition-all duration-300 overflow-hidden h-full flex flex-col ${card.hoverGlow} shadow-2xl group-hover:scale-[1.02] group-hover:-translate-y-2`}>

                    {/* Background Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                    {/* Content */}
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Icon */}
                      <div className={`w-16 h-16 ${card.iconBg} ${card.iconColor} rounded-2xl flex items-center justify-center mb-6 border ${card.iconBorder} backdrop-blur-sm group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={32} strokeWidth={2} />
                      </div>

                      {/* Title */}
                      <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-gray-100 group-hover:to-gray-200 transition-all duration-300">
                        {card.title}
                      </h3>

                      {/* Description */}
                      <p className="text-gray-400 text-base leading-relaxed mb-6 flex-grow">
                        {card.description}
                      </p>

                      {/* Progress Indicator (if completed) */}
                      {card.completed && (
                        <div className="mb-4 flex items-center gap-2 text-sm">
                          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className={`h-full bg-gradient-to-r ${card.borderGradient} rounded-full`} style={{ width: '100%' }} />
                          </div>
                          <span className={`${card.iconColor} font-semibold`}>Completed</span>
                        </div>
                      )}

                      {/* Button */}
                      <button
                        onClick={() => navigate(card.path)}
                        className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white backdrop-blur-lg bg-gradient-to-r ${card.gradient} border border-white/20 group-hover:border-white/40 transition-all duration-300 group-hover:shadow-xl ${card.hoverGlow}`}
                      >
                        <span>Start Assessment</span>
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <div
            className="mt-20 text-center animate-fadeIn"
            style={{ animationDelay: '0.9s' }}
          >
            <p className="text-gray-400 text-lg">
              Not sure where to start?{' '}
              <button
                onClick={() => navigate('/assessment-hub/skill')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 transition-colors"
              >
                Try Skill Assessment first
              </button>
            </p>
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
            transform: translateY(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
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

export default AssessmentHub;
