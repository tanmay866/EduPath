import AssessmentCard from "./AssessmentCard";

const AvailableAssessments = ({ assessments, onStartAssessment }) => {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-4">
        Available Assessments
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {assessments.map((assessment) => (
          <AssessmentCard
            key={assessment.id}
            assessment={assessment}
            onStart={onStartAssessment}
          />
        ))}
      </div>

      {assessments.length === 0 && (
        <div className="bg-slate-800 rounded-xl shadow-xl p-12 text-center border border-white/10">
          <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Active Assessments Available
          </h3>
          <p className="text-gray-400">
            Check back later for new assessment opportunities
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailableAssessments;
