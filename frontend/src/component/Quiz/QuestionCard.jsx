import OptionItem from "./OptionItem";

const QuestionCard = ({
  question,
  selectedAnswer,
  handleSelectOption,
  index,
}) => {
  return (
    <>
      <h2 className="text-xl font-bold mb-4">
        Question {index + 1}
      </h2>

      <p className="mb-6">{question.questionText}</p>

      <div className="space-y-3">
        {question.options.map((opt, i) => (
          <OptionItem
            key={i}
            option={opt}
            index={i}
            isSelected={selectedAnswer === i}
            onSelect={() =>
              handleSelectOption(question._id, i)
            }
          />
        ))}
      </div>
    </>
  );
};

export default QuestionCard;
