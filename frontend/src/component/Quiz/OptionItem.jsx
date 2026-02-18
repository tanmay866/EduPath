const OptionItem = ({ option, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3 border rounded-lg cursor-pointer
      ${
        isSelected
          ? "bg-indigo-100 border-indigo-500"
          : "hover:bg-gray-100"
      }`}
    >
      {option}
    </div>
  );
};

export default OptionItem;
