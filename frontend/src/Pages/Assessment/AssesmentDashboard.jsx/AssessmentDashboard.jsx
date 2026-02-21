import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../Services/assessmentService";
import { useQuiz } from "../../context/QuizContext";
import AssessmentSidebar from "../../../component/Assessment/AssessmentSidebar";
import BackgroundAnimation from "./BackgroundAnimation";
import DashboardHeader from "./DashboardHeader";
import PerformanceCards from "./PerformanceCards";
import AvailableAssessments from "./AvailableAssessments";
import PreviousAttemptsTable from "./PreviousAttemptsTable";
import {
  performanceStats,
  performanceCardsConfig,
  availableAssessments,
  previousAttempts,
} from "./assessmentDummyData";

const AssessmentDashboard = () => {
  const { setAssessment } = useQuiz();
  const navigate = useNavigate();

  const fetchAssessment = async () => {
    try {
      const res = await API.get("/assessment/quiz");
      setAssessment(res.data);
    } catch (error) {
      console.error("Failed to fetch assessment:", error);
    }
  };

  useEffect(() => {
    fetchAssessment();
  }, []);

  const handleStartAssessment = (assessment) => {
    setAssessment({
      title: assessment.title,
      skill: assessment.skill,
      duration: assessment.duration,
      totalQuestions: assessment.totalQuestions,
      assessmentId: assessment.id,
      questions: [],
    });
    navigate("/assessment/instructions");
  };

  return (
    <div className="flex min-h-screen bg-slate-900 relative">
      <BackgroundAnimation />

      <AssessmentSidebar />

      <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto relative z-10">
        <div className="max-w-7xl mx-auto">
          <DashboardHeader totalAttempts={performanceStats.totalAttempts} />

          <PerformanceCards cards={performanceCardsConfig} />

          <AvailableAssessments
            assessments={availableAssessments}
            onStartAssessment={handleStartAssessment}
          />

          <PreviousAttemptsTable attempts={previousAttempts} />
        </div>
      </div>
    </div>
  );
};

export default AssessmentDashboard;
