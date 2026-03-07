import AssessmentSidebar from "../../../../component/Assessment/AssessmentSidebar";
import ConfirmModal from "../../../../component/Comman/ConfirmModal";
import QuizHeader from "./QuizHeader";
import QuestionPanel from "./QuestionPanel";
import QuizNavigator from "./QuizNavigator";
import SubmitSection from "./SubmitSection";

const QuizLayout = ({
  assessment,
  currentQuestionIndex,
  currentQuestion,
  questions,
  isMarked,
  selectedAnswer,
  timer,
  setTimer,
  answers,
  visitedQuestions,
  markedForReview,
  allAnswered,
  showSubmitModal,
  onSelectOption,
  onMarkForReview,
  onPrevious,
  onNext,
  onQuestionSelect,
  onTimeUp,
  onSubmitClick,
  onConfirmSubmit,
  onCancelSubmit,
  setCurrentQuestionIndex,
}) => {
  return (
    <div className="flex min-h-screen bg-black relative">
      <AssessmentSidebar />
      
      <div className="flex-1 flex flex-col relative z-10">
        <div className="flex-1 p-4 overflow-auto">
          <div className="max-w-7xl mx-auto space-y-8">
            <QuizHeader
              assessment={assessment}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={questions.length}
            />

            <div className="grid grid-cols-10 gap-4">
              <QuestionPanel
                currentQuestion={currentQuestion}
                currentQuestionIndex={currentQuestionIndex}
                isMarked={isMarked}
                selectedAnswer={selectedAnswer}
                onSelectOption={onSelectOption}
                onMarkForReview={onMarkForReview}
                onPrevious={onPrevious}
                onNext={onNext}
                isFirstQuestion={currentQuestionIndex === 0}
                isLastQuestion={currentQuestionIndex === questions.length - 1}
              />

              <QuizNavigator
                timer={timer}
                setTimer={setTimer}
                onTimeUp={onTimeUp}
                questions={questions}
                answers={answers}
                visitedQuestions={visitedQuestions}
                markedForReview={markedForReview}
                currentQuestionIndex={currentQuestionIndex}
                onQuestionSelect={onQuestionSelect}
              />
            </div>

            <div className="grid grid-cols-10 gap-4">
              <div className="col-span-7"></div>
              <div className="col-span-3">
                <SubmitSection
                  allAnswered={allAnswered}
                  answeredCount={answers?.length || 0}
                  totalQuestions={questions?.length || 0}
                  onSubmit={onSubmitClick}
                />
              </div>
            </div>
          </div>
        </div>

        <ConfirmModal
          isOpen={showSubmitModal}
          message="Are you sure you want to submit your assessment? You cannot change answers after submission."
          onConfirm={onConfirmSubmit}
          onCancel={onCancelSubmit}
        />
      </div>
    </div>
  );
};

export default QuizLayout;
