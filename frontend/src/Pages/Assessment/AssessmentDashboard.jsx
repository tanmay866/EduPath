import { useEffect } from "react";
import API from "../services/assessmentService";
import { useQuiz } from "../context/QuizContext";
import { useNavigate } from "react-router-dom";

const AssessmentDashboard = () => {
  const { setAssessment } = useQuiz();
  const navigate = useNavigate();

  const fetchAssessment = async () => {
    const res = await API.get("/assessment/quiz");
    setAssessment(res.data);
  };

  useEffect(() => {
    fetchAssessment();
  }, []);

  return (
    <div>
      <h1>Skill Assessment</h1>

      <button onClick={() => navigate("/assessment/instructions")}>
        Start Assessment
      </button>
    </div>
  );
};

export default AssessmentDashboard;
