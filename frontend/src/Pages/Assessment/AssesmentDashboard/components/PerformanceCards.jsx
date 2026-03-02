const PerformanceCard = ({ label, value, color = "blue", icon }) => {
  const colorConfig = {
    blue: {
      border: "border-l-blue-500 hover:border-l-blue-400",
      bg: "bg-blue-500/20",
      borderRing: "border-blue-500/30",
      text: "text-blue-400",
    },
    purple: {
      border: "border-l-purple-500 hover:border-l-purple-400",
      bg: "bg-purple-500/20",
      borderRing: "border-purple-500/30",
      text: "text-purple-400",
    },
    yellow: {
      border: "border-l-yellow-500 hover:border-l-yellow-400",
      bg: "bg-yellow-500/20",
      borderRing: "border-yellow-500/30",
      text: "text-yellow-400",
    },
    green: {
      border: "border-l-green-500 hover:border-l-green-400",
      bg: "bg-green-500/20",
      borderRing: "border-green-500/30",
      text: "text-green-400",
    },
  };

  const colorClasses = colorConfig[color] || colorConfig.blue;

  return (
    <div className={`backdrop-blur-xl bg-slate-900/60 rounded-xl shadow-xl p-6 border border-white/10 border-l-4 ${colorClasses.border} transition-all`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">
            {label}
          </p>
          <p className="text-3xl font-bold text-white">
            {value}
          </p>
        </div>
        <div className={`backdrop-blur-lg ${colorClasses.bg} p-3 rounded-full border ${colorClasses.borderRing}`}>
          <div className={colorClasses.text}>
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

const PerformanceCards = ({ cards }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <PerformanceCard
          key={card.id}
          label={card.label}
          value={card.value}
          color={card.color}
          icon={card.icon}
        />
      ))}
    </div>
  );
};

export default PerformanceCards;
