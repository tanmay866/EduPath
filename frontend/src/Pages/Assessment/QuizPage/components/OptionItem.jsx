const OptionItem = ({ option, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 mb-2
      ${
        isSelected
          ? "bg-indigo-600 border-indigo-400/50 text-white shadow-lg transform scale-[1.02]"
          : "bg-slate-800 border-white/20 text-gray-300 hover:bg-slate-700 hover:border-white/30 hover:shadow-md"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
          isSelected ? 'border-white bg-white' : 'border-gray-500'
        }`}>
          {isSelected && (
            <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
          )}
        </div>
        <span className="text-sm leading-relaxed">{option}</span>
      </div>
    </div>
  );
};

export default OptionItem;
