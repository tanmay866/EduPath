const OptionItem = ({ option, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 mb-3
      ${
        isSelected
          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg transform scale-[1.02]"
          : "bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500 hover:shadow-md"
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
