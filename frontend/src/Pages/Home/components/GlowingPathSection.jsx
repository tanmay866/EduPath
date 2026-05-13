import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const GlowingPathSection = () => {
  const containerRef = useRef(null);

  // Track the scroll progress within this specific container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // Calculate the height of the glowing line based on scroll
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  // Calculate the position of the glowing orb
  const orbPosition = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const milestones = [
    {
      title: "Skills Assessment",
      desc: "Take our comprehensive assessment to understand your level.",
      icon: "◎",
      color: "blue",
      align: "left"
    },
    {
      title: "Personalized Path",
      desc: "Get a custom roadmap with courses, projects, and milestones.",
      icon: "📊",
      color: "emerald",
      align: "right"
    },
    {
      title: "Learn & Build",
      desc: "Complete verified courses and build portfolio projects.",
      icon: "⟨⟩",
      color: "purple",
      align: "left"
    },
    {
      title: "Get Hired",
      desc: "Connect with hiring partners and showcase your skills.",
      icon: "👥",
      color: "pink",
      align: "right"
    }
  ];

  return (
    <section ref={containerRef} className="relative py-32 px-6 bg-black text-white min-h-[150vh] flex flex-col justify-between overflow-hidden">
      
      {/* Background ambient glows */}
      <div className="absolute top-1/4 -left-16 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-16 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto w-full text-center mb-20 z-10 relative">
        <h2 className="text-3xl md:text-5xl font-bold mb-4">How Your Career Journey Works</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Our AI-powered career engine creates a personalized roadmap based on your current skills, interests, and market demand.
        </p>
      </div>

      <div className="relative max-w-5xl mx-auto w-full flex-1 flex flex-col justify-between py-20 z-10">
        
        {/* Central Path Track (The unlit path) */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/10 -translate-x-1/2 rounded-full hidden md:block"></div>
        {/* Mobile Path Track */}
        <div className="absolute left-8 top-0 bottom-0 w-1 bg-white/10 rounded-full md:hidden"></div>

        {/* The Glowing Animated Line */}
        <motion.div 
          className="absolute left-1/2 top-0 w-1 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 -translate-x-1/2 rounded-full hidden md:block shadow-[0_0_15px_rgba(6,182,212,0.5)]"
          style={{ height: lineHeight }}
        />
        {/* Mobile Glowing Line */}
        <motion.div 
          className="absolute left-8 top-0 w-1 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 rounded-full md:hidden shadow-[0_0_15px_rgba(6,182,212,0.5)]"
          style={{ height: lineHeight }}
        />

        {/* The Traveling Glowing Orb */}
        <motion.div 
          className="absolute left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full hidden md:flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,1)] z-20"
          style={{ top: orbPosition, marginTop: '-12px' }}
        >
          <div className="w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full animate-pulse" />
        </motion.div>
        {/* Mobile Glowing Orb */}
        <motion.div 
          className="absolute left-8 -translate-x-1/2 w-6 h-6 bg-white rounded-full md:hidden flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,1)] z-20"
          style={{ top: orbPosition, marginTop: '-12px' }}
        >
          <div className="w-4 h-4 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full animate-pulse" />
        </motion.div>

        {/* Nodes */}
        {milestones.map((item, index) => {
          // Calculate when this specific node should appear based on its vertical position
          // Total height is roughly divided into 4 segments
          const threshold = index * 0.25 + 0.1; 

          // Map the opacity and scale of the card so it pops open when the orb reaches it
          const opacity = useTransform(scrollYProgress, [threshold - 0.1, threshold], [0, 1]);
          const scale = useTransform(scrollYProgress, [threshold - 0.1, threshold], [0.8, 1]);
          const y = useTransform(scrollYProgress, [threshold - 0.1, threshold], [50, 0]);

          const isLeft = item.align === 'left';

          return (
            <div key={index} className="relative w-full flex md:justify-center items-center my-12 md:my-0 h-32">
              
              {/* Desktop Layout */}
              <div className={`hidden md:flex w-full ${isLeft ? 'justify-start' : 'justify-end'} relative`}>
                
                {/* Node Connector Dot */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0a0a0a] border-2 border-slate-600 z-10" />

                <motion.div 
                  style={{ opacity, scale, y }}
                  className={`w-5/12 ${isLeft ? 'pr-12 text-right flex flex-col items-end' : 'pl-12 text-left flex flex-col items-start'}`}
                >
                  <div className={`w-14 h-14 backdrop-blur-lg rounded-2xl flex items-center justify-center text-xl mb-4 shadow-xl border
                    ${item.color === 'blue' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 shadow-blue-500/20' : ''}
                    ${item.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-emerald-500/20' : ''}
                    ${item.color === 'purple' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30 shadow-purple-500/20' : ''}
                    ${item.color === 'pink' ? 'bg-pink-500/10 text-pink-400 border-pink-500/30 shadow-pink-500/20' : ''}
                  `}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-2xl mb-2 text-white">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-sm">{item.desc}</p>
                </motion.div>
              </div>

              {/* Mobile Layout */}
              <div className="flex md:hidden w-full pl-16 relative">
                {/* Node Connector Dot */}
                <div className="absolute left-8 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#0a0a0a] border-2 border-slate-600 z-10" />

                <motion.div 
                  style={{ opacity, scale, y }}
                  className="w-full text-left flex flex-col items-start bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl"
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg mb-3 border
                    ${item.color === 'blue' ? 'bg-blue-500/20 text-blue-400 border-blue-500/40' : ''}
                    ${item.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : ''}
                    ${item.color === 'purple' ? 'bg-purple-500/20 text-purple-400 border-purple-500/40' : ''}
                    ${item.color === 'pink' ? 'bg-pink-500/20 text-pink-400 border-pink-500/40' : ''}
                  `}>
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-xl mb-1 text-white">{item.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              </div>

            </div>
          );
        })}
      </div>
    </section>
  );
};

export default GlowingPathSection;
