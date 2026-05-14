const COLORS = {
  blue:   { orb: 'rgba(99,102,241,0.07)',  border: 'indigo',  label: 'text-indigo-400',  icon: 'bg-indigo-500/15 border-indigo-500/25',  glow: 'rgba(99,102,241,0.25)'  },
  purple: { orb: 'rgba(139,92,246,0.07)', border: 'violet',  label: 'text-violet-400',  icon: 'bg-violet-500/15 border-violet-500/25',  glow: 'rgba(139,92,246,0.25)'  },
  yellow: { orb: 'rgba(251,191,36,0.07)', border: 'amber',   label: 'text-amber-400',   icon: 'bg-amber-500/15 border-amber-500/25',    glow: 'rgba(251,191,36,0.25)'  },
  green:  { orb: 'rgba(52,211,153,0.07)', border: 'emerald', label: 'text-emerald-400', icon: 'bg-emerald-500/15 border-emerald-500/25', glow: 'rgba(52,211,153,0.25)'  },
  red:    { orb: 'rgba(251,113,133,0.07)',border: 'rose',    label: 'text-rose-400',    icon: 'bg-rose-500/15 border-rose-500/25',      glow: 'rgba(251,113,133,0.25)' },
};

const PerformanceCard = ({ label, value, color = 'blue', icon }) => {
  const c = COLORS[color] || COLORS.blue;
  return (
    <div
      className="relative backdrop-blur-3xl bg-[#090b14]/70 rounded-[1.5rem] border border-white/5 shadow-2xl p-6 overflow-hidden group"
      style={{ transition: 'border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease' }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = c.glow.replace('0.25','0.35');
        e.currentTarget.style.boxShadow   = `0 0 32px -8px ${c.glow}`;
        e.currentTarget.style.transform   = 'translateY(-3px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.boxShadow   = '';
        e.currentTarget.style.transform   = '';
      }}
    >
      {/* Bottom radial orb */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(circle at 80% 110%, ${c.orb}, transparent 65%)`,
        pointerEvents: 'none',
      }} />

      <div className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 mb-2">{label}</p>
          <p className={`text-4xl font-black tracking-tight ${c.label}`}>{value}</p>
        </div>
        <div className={`p-3.5 rounded-2xl border ${c.icon} ${c.label} shrink-0`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const PerformanceCards = ({ cards }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
    {cards.map(card => (
      <PerformanceCard key={card.id} label={card.label} value={card.value} color={card.color} icon={card.icon} />
    ))}
  </div>
);

export default PerformanceCards;
