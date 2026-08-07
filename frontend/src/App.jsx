import React from 'react'
import Navbar from './component/Navbar/Navbar'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './Pages/Home/Home'
import About from './Pages/About/About'
import Work from './Pages/Work/Work'
import Contact from './Pages/Contact/Contact'
import Signup from './Pages/Authentication/Signup'
import Signin from './Pages/Authentication/Signin'
import ResetPassword from './Pages/Authentication/ResetPassword'
import VerifyEmail from './Pages/Authentication/VerifyEmail'
import Unsubscribe from './Pages/Unsubscribe'
import Footer from './component/Footer/Footer'
import AssessmentDashboard from './Pages/Assessment/AssesmentDashboard/AssessmentDashboard'
import AssessmentInstructions from './Pages/Assessment/AssesmentInstructions/AssessmentInstructions'
import QuizPage from './Pages/Assessment/QuizPage/QuizPage'
import ResultPage from './Pages/Assessment/Result/ResultPage'
import ProfilePage from './Pages/Profile/ProfilePage'
import SettingsPage from './Pages/Settings/SettingsPage'
import Onboarding from './Pages/Onboarding/Onboarding'
import RequiresProfile from './component/RequiresProfile'
import ResumePage from './Pages/Profile/ResumePage'
import AllResult from './Pages/Assessment/Result/AllResult'
import FAQ from './Pages/FAQ/FAQ'
import Services from './Pages/Services/Services'
import CareerRoadmap from './Pages/Roadmap/CareerRoadmap'
import RoadmapPage from './Pages/Roadmap/RoadmapPage'
import JobFit from './Pages/Roadmap/JobFit'

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
import InterviewResults from './Pages/AssessmentHub/InterviewResults'
import InterviewResultDetail from './Pages/AssessmentHub/InterviewResultDetail'

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
          {/* The plan lives at a URL that names the page. It used to be
              /roadmap/generate, which describes an action — you land there to
              read a plan you already have, and generating is a button on it. */}
          <Route path="/roadmap/plan" element={<RequiresProfile><RoadmapPage /></RequiresProfile>} />
          {/* Anyone holding the old link keeps working. */}
          <Route path="/roadmap/generate" element={<Navigate to="/roadmap/plan" replace />} />
          {/* Needs a profile: the estimate is in the learner's own hours. */}
          <Route path="/job-fit" element={<RequiresProfile><JobFit /></RequiresProfile>} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin" element={<Signin />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          {/* Reached from a link in an email, so it sits with the other
              routes that must work with no session. */}
          <Route path="/unsubscribe" element={<Unsubscribe />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/resume" element={<ResumePage />} />
          <Route path="/assessment" element={<AssessmentDashboard />} />
          <Route path="/assessment/instructions" element={<AssessmentInstructions />} />
          <Route path="/assessment/result" element={<AllResult />} />
          {/* Needs a role: results are filed against the role they were
              earned under, so an attempt with none set is recorded where
              nothing will read it. */}
          <Route path="/assessment/quiz" element={<RequiresProfile><QuizPage /></RequiresProfile>} />
          <Route path="/assessment/result/:resultId" element={<ResultPage />} />

          {/* Assessment Hub Routes — the actual test-taking screens (and the
              past-result detail views, which reuse that same bare layout)
              carry no marketing Navbar, so there's nothing to look at but
              the test. The hub and the results-list screens are a different
              chrome entirely (LearnerShell's own sidebar and header) since
              they're for browsing, not mid-attempt. */}
          <Route path="/assessment-hub" element={<AssessmentHub />} />
          <Route path="/assessment-hub/skill" element={<SkillAssessment />} />
          <Route path="/assessment-hub/aptitude" element={<AptitudeTest />} />
          <Route path="/assessment-hub/aptitude/results" element={<PracticeResults type="aptitude" label="Aptitude" retakePath="/assessment-hub/aptitude" />} />
          <Route path="/assessment-hub/aptitude/results/:resultId" element={<PracticeResultDetail type="aptitude" />} />
          <Route path="/assessment-hub/cs-fundamentals" element={<CSFundamentals />} />
          <Route path="/assessment-hub/cs-fundamentals/results" element={<PracticeResults type="cs-fundamentals" label="CS fundamentals" retakePath="/assessment-hub/cs-fundamentals" />} />
          <Route path="/assessment-hub/cs-fundamentals/results/:resultId" element={<PracticeResultDetail type="cs-fundamentals" />} />
          <Route path="/assessment-hub/mock-interview/results" element={<InterviewResults />} />
          <Route path="/assessment-hub/mock-interview/results/:resultId" element={<InterviewResultDetail />} />
          <Route path="/assessment-hub/mock-interview" element={<RequiresProfile><AIMockInterview /></RequiresProfile>} />

          {/* New Feature Routes */}
          <Route path="/resume-builder" element={<ResumeBuilder />} />
          <Route path="/portfolio-generator" element={<PortfolioGenerator />} />
          <Route path="/ats-analyzer" element={<ATSAnalyzer />} />

          {/* Public Portfolio Routes */}
          <Route path="/p/:portfolioId" element={<PublicPortfolio />} />
          {/* The readable form. PublicPortfolio has always accepted a
              username and fetched /portfolio/u/:username; the route was
              never added, so the handle had nowhere to land. Namespaced
              under /u so a handle cannot shadow /roadmap or /profile. */}
          <Route path="/u/:username" element={<PublicPortfolio />} />
          <Route path="/:username" element={<PublicPortfolio />} />
        </Routes>
      </div>
    )
  }

}

export default App
