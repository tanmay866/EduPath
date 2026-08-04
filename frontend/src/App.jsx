import React from 'react'
import Navbar from './component/Navbar/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home/Home'
import About from './Pages/About/About'
import Work from './Pages/Work/Work'
import Contact from './Pages/Contact/Contact'
import Signup from './Pages/Authentication/Signup'
import Signin from './Pages/Authentication/Signin'
import ResetPassword from './Pages/Authentication/ResetPassword'
import VerifyEmail from './Pages/Authentication/VerifyEmail'
import Footer from './component/Footer/Footer'
import AssessmentDashboard from './Pages/Assessment/AssesmentDashboard/AssessmentDashboard'
import AssessmentInstructions from './Pages/Assessment/AssesmentInstructions/AssessmentInstructions'
import QuizPage from './Pages/Assessment/QuizPage/QuizPage'
import ResultPage from './Pages/Assessment/Result/ResultPage'
import ProfilePage from './Pages/Profile/ProfilePage'
import SettingsPage from './Pages/Settings/SettingsPage'
import ResumePage from './Pages/Profile/ResumePage'
import AllResult from './Pages/Assessment/Result/AllResult'
import FAQ from './Pages/FAQ/FAQ'
import Services from './Pages/Services/Services'
import CareerRoadmap from './Pages/Roadmap/CareerRoadmap'
import RoadmapPage from './Pages/Roadmap/RoadmapPage'

// New Features - Resume Builder, Portfolio Generator, ATS Analyzer
import ResumeBuilder from './component/features/ResumeBuilder'
import PortfolioGenerator from './component/features/PortfolioGenerator'
import ATSAnalyzer from './component/features/ATSAnalyzer'
import PublicPortfolio from './Pages/PublicPortfolio'

// Assessment Hub Components
import AssessmentHub from './Pages/AssessmentHub/AssessmentHub'
import SkillAssessment from './Pages/AssessmentHub/SkillAssessment'
import AptitudeTest from './Pages/AssessmentHub/AptitudeTest'
import CSFundamentals from './Pages/AssessmentHub/CSFundamentals'
import AIMockInterview from './Pages/AssessmentHub/AIMockInterview'
import PracticeResults from './Pages/AssessmentHub/PracticeResults'
import PracticeResultDetail from './Pages/AssessmentHub/PracticeResultDetail'

// Admin Components — the sidebar and header now come from AdminShell.
import AdminDashboard from './Admin/pages/AdminDashboard'
import ManageUsers from './Admin/pages/ManageUsers'
import QuizAttempts from './Admin/pages/QuizAttempts'
import RoadmapHistory from './Admin/pages/RoadmapHistory'
import AIAnalytics from './Admin/pages/AIAnalytics'
import SystemSettings from './Admin/pages/SystemSettings'

//comman components
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from './component/ScrollToTop';

const App = () => {

  const selectedRole = sessionStorage.getItem('role');
  if (selectedRole === 'admin') {

    return (

      <div style={{ background: 'var(--color-paper)', minHeight: '100vh' }}>
        {/* Admin Routes */}

        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='dark'
          toastClassName="toast-glass"
        />

        <ScrollToTop />
        <Routes>
          <Route path="/*" element={<AdminDashboard />} />
          <Route path="/admin/*" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/quiz-attempts" element={<QuizAttempts />} />
          <Route path="/admin/roadmaps" element={<RoadmapHistory />} />
          <Route path="/admin/analytics" element={<AIAnalytics />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
        </Routes>

      </div>
    )

  } else {
    return (
      <div style={{ background: 'var(--color-paper)', minHeight: '100vh' }}>

        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme='dark'
          toastClassName="toast-glass"
        />

        <ScrollToTop />
        <Routes>
          <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
          <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
          <Route path="/work" element={<><Navbar /><Work /><Footer /></>} />
          <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />
          <Route path="/faq" element={<><Navbar /><FAQ /><Footer /></>} />
          <Route path="/services" element={<><Navbar /><Services /><Footer /></>} />
          <Route path="/roadmap" element={<><Navbar /><CareerRoadmap /><Footer /></>} />
          <Route path="/roadmap/generate" element={<RoadmapPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/assessment" element={<AssessmentDashboard />} />
          <Route path="/assessment/instructions" element={<AssessmentInstructions />} />
          <Route path="/assessment/result" element={<AllResult />} />
          <Route path="/assessment/quiz" element={<QuizPage />} />
          <Route path="/assessment/result/:resultId" element={<ResultPage />} />

          {/* Assessment Hub Routes — the actual test-taking screens (and the
              past-result detail view, which reuses the same layout) drop the
              marketing Navbar entirely so there's nothing to look at but the
              test. The hub itself and the plain results-list screens keep
              it; they're browsing, not mid-attempt. */}
          <Route path="/assessment-hub" element={<AssessmentHub />} />
          <Route path="/assessment-hub/skill" element={<SkillAssessment />} />
          <Route path="/assessment-hub/aptitude" element={<AptitudeTest />} />
          <Route path="/assessment-hub/aptitude/results" element={<PracticeResults type="aptitude" label="Aptitude" retakePath="/assessment-hub/aptitude" />} />
          <Route path="/assessment-hub/aptitude/results/:resultId" element={<PracticeResultDetail type="aptitude" />} />
          <Route path="/assessment-hub/cs-fundamentals" element={<CSFundamentals />} />
          <Route path="/assessment-hub/cs-fundamentals/results" element={<PracticeResults type="cs-fundamentals" label="CS fundamentals" retakePath="/assessment-hub/cs-fundamentals" />} />
          <Route path="/assessment-hub/cs-fundamentals/results/:resultId" element={<PracticeResultDetail type="cs-fundamentals" />} />
          <Route path="/assessment-hub/mock-interview" element={<AIMockInterview />} />

          {/* New Feature Routes */}
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/portfolio-generator" element={<PortfolioGenerator />} />
          <Route path="/ats-analyzer" element={<ATSAnalyzer />} />

          {/* Public Portfolio Routes */}
          <Route path="/p/:portfolioId" element={<PublicPortfolio />} />
          <Route path="/:username" element={<PublicPortfolio />} />
        </Routes>
      </div>
    )
  }

}

export default App
