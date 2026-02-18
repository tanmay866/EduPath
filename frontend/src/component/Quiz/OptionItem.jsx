const OptionItem = ({ option, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 mb-3
      ${
        isSelected
          ? "backdrop-blur-lg bg-indigo-500/40 border-indigo-400/50 text-white shadow-lg transform scale-[1.02]"
          : "backdrop-blur-lg bg-white/5 border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isSelected ? 'border-white bg-white' : 'border-gray-500'
        }`}>
          {isSelected && (
            <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
          )}
        </div>
        <span className="text-base leading-relaxed">{option}</span>
      </div>
    </div>
  );
};

export default OptionItem;
