import React from 'react'
import Navbar from './component/Navbar/Navbar'
import { Routes, Route, useLocation } from 'react-router-dom'
import PageTransition from './component/PageTransition'
import Home from './Pages/Home/Home'
import About from './Pages/About/About'
import Work from './Pages/Work/Work'
import Contact from './Pages/Contact/Contact'
import Signup from './Pages/Authentication/Signup'
import Signin from './Pages/Authentication/Signin'
import ResetPassword from './Pages/Authentication/ResetPassword'
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

// New Features - Resume Builder, Portfolio Generator, ATS Analyzer
import ResumeBuilder from './component/features/ResumeBuilder'
import PortfolioGenerator from './component/features/PortfolioGenerator'
import ATSAnalyzer from './component/features/ATSAnalyzer'
import PublicPortfolio from './Pages/PublicPortfolio'

// Assessment Hub Components
import SkillAssessment from './Pages/AssessmentHub/SkillAssessment'
import AptitudeTest from './Pages/AssessmentHub/AptitudeTest'
import CSFundamentals from './Pages/AssessmentHub/CSFundamentals'
import AIMockInterview from './Pages/AssessmentHub/AIMockInterview'

// Admin Components
import AdminNavbar from './Admin/component/AdminNavbar'
import AdminSidebar from './Admin/component/AdminSidebar'
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

      <div className="bg-slate-950 min-h-screen">
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
          <Route path="/*" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="/admin/*" element={<PageTransition><AdminDashboard /></PageTransition>} />
          <Route path="/admin/users" element={<PageTransition><ManageUsers /></PageTransition>} />
          <Route path="/admin/quiz-attempts" element={<PageTransition><QuizAttempts /></PageTransition>} />
          <Route path="/admin/roadmaps" element={<PageTransition><RoadmapHistory /></PageTransition>} />
          <Route path="/admin/analytics" element={<PageTransition><AIAnalytics /></PageTransition>} />
          <Route path="/admin/settings" element={<PageTransition><SystemSettings /></PageTransition>} />
        </Routes>

      </div>
    )

  } else {
    return (
      <div className="bg-slate-950 min-h-screen">

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
          <Route path="/" element={<PageTransition><Navbar /><Home /><Footer /></PageTransition>} />
          <Route path="/about" element={<PageTransition><Navbar /><About /></PageTransition>} />
          <Route path="/work" element={<PageTransition><Navbar /><Work /></PageTransition>} />
          <Route path="/contact" element={<PageTransition><Navbar /><Contact /></PageTransition>} />
          <Route path="/faq" element={<PageTransition><Navbar /><FAQ /></PageTransition>} />
          <Route path="/services" element={<PageTransition><Navbar /><Services /></PageTransition>} />
          <Route path="/signup" element={<PageTransition><Navbar /><Signup /></PageTransition>} />
          <Route path="/signin" element={<PageTransition><Navbar /><Signin /></PageTransition>} />
          <Route path="/reset-password/:token" element={<PageTransition><Navbar /><ResetPassword /></PageTransition>} />
          <Route path="/profile" element={<PageTransition><Navbar /><ProfilePage /></PageTransition>} />
          <Route path="/settings" element={<PageTransition><Navbar /><SettingsPage /></PageTransition>} />
          <Route path="/resume" element={<PageTransition><Navbar /><ResumePage /></PageTransition>} />
          <Route path="/assessment" element={<PageTransition><AssessmentDashboard /></PageTransition>} />
          <Route path="/assessment/instructions" element={<PageTransition><AssessmentInstructions /></PageTransition>} />
          <Route path="/assessment/result" element={<PageTransition><AllResult /></PageTransition>} />
          <Route path="/assessment/quiz" element={<PageTransition><QuizPage /></PageTransition>} />
          <Route path="/assessment/result/:resultId" element={<PageTransition><ResultPage /></PageTransition>} />

          {/* Assessment Hub Routes */}
          <Route path="/assessment-hub/skill" element={<PageTransition><Navbar /><SkillAssessment /><Footer /></PageTransition>} />
          <Route path="/assessment-hub/aptitude" element={<PageTransition><Navbar /><AptitudeTest /><Footer /></PageTransition>} />
          <Route path="/assessment-hub/cs-fundamentals" element={<PageTransition><Navbar /><CSFundamentals /><Footer /></PageTransition>} />
          <Route path="/assessment-hub/mock-interview" element={<PageTransition><Navbar /><AIMockInterview /><Footer /></PageTransition>} />

          {/* New Feature Routes */}
          <Route path="/resume-builder" element={<PageTransition><Navbar /><ResumeBuilder /></PageTransition>} />
          <Route path="/portfolio-generator" element={<PageTransition><Navbar /><PortfolioGenerator /></PageTransition>} />
          <Route path="/ats-analyzer" element={<PageTransition><Navbar /><ATSAnalyzer /></PageTransition>} />

          {/* Public Portfolio Routes */}
          <Route path="/p/:portfolioId" element={<PublicPortfolio />} />
          <Route path="/:username" element={<PublicPortfolio />} />
        </Routes>
      </div>
    )
  }

}

export default App
