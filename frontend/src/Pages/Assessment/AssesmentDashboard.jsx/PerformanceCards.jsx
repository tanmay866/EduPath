const PerformanceCard = ({ label, value, color = "blue", icon }) => {
  const colorConfig = {
    blue: {
      border: "border-blue-500 hover:border-blue-400",
      bg: "bg-blue-500/20",
      borderRing: "border-blue-500/30",
      text: "text-blue-400",
    },
    purple: {
      border: "border-purple-500 hover:border-purple-400",
      bg: "bg-purple-500/20",
      borderRing: "border-purple-500/30",
      text: "text-purple-400",
    },
    yellow: {
      border: "border-yellow-500 hover:border-yellow-400",
      bg: "bg-yellow-500/20",
      borderRing: "border-yellow-500/30",
      text: "text-yellow-400",
    },
    green: {
      border: "border-green-500 hover:border-green-400",
      bg: "bg-green-500/20",
      borderRing: "border-green-500/30",
      text: "text-green-400",
    },
  };

  const colorClasses = colorConfig[color] || colorConfig.blue;

  return (
    <div className={`bg-slate-800 rounded-xl shadow-xl p-6 border-l-4 ${colorClasses.border} transition-all`}>
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
