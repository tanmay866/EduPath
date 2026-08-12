import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'

/**
 * Routes are loaded on demand.
 *
 * Every screen used to be a static import, so one bundle held the whole app —
 * around 786 kB minified — and the person reading the landing page downloaded
 * the admin console, the quiz engine, the resume builder and the portfolio
 * deployer before anything appeared. Nobody needs all of that, and most
 * visitors need almost none of it.
 *
 * What stays eager is what the first paint actually uses: the chrome around
 * the page, the two route guards that decide where a visitor is sent before
 * any screen renders, and Home itself. Making Home lazy would cost the most
 * common landing an extra round trip to discover its chunk, which is the one
 * place splitting makes things worse rather than better.
 */
import Navbar from './component/Navbar/Navbar'
import Footer from './component/Footer/Footer'
import RequiresProfile from './component/RequiresProfile'
import RequiresAuth from './component/RequiresAuth'
import Home from './Pages/Home/Home'

// Marketing and legal.
const About = lazy(() => import('./Pages/About/About'))
const Terms = lazy(() => import('./Pages/Legal/Terms'))
const Privacy = lazy(() => import('./Pages/Legal/Privacy'))
const Work = lazy(() => import('./Pages/Work/Work'))
const Contact = lazy(() => import('./Pages/Contact/Contact'))
const FAQ = lazy(() => import('./Pages/FAQ/FAQ'))
const Services = lazy(() => import('./Pages/Services/Services'))

// Authentication and account.
const Signup = lazy(() => import('./Pages/Authentication/Signup'))
const Signin = lazy(() => import('./Pages/Authentication/Signin'))
const ResetPassword = lazy(() => import('./Pages/Authentication/ResetPassword'))
const VerifyEmail = lazy(() => import('./Pages/Authentication/VerifyEmail'))
const Unsubscribe = lazy(() => import('./Pages/Unsubscribe'))
const Onboarding = lazy(() => import('./Pages/Onboarding/Onboarding'))
const ProfilePage = lazy(() => import('./Pages/Profile/ProfilePage'))
const SettingsPage = lazy(() => import('./Pages/Settings/SettingsPage'))
const ResumePage = lazy(() => import('./Pages/Profile/ResumePage'))

// Roadmap.
const CareerRoadmap = lazy(() => import('./Pages/Roadmap/CareerRoadmap'))
const RoadmapPage = lazy(() => import('./Pages/Roadmap/RoadmapPage'))
const JobFit = lazy(() => import('./Pages/Roadmap/JobFit'))

// Assessment.
const AssessmentDashboard = lazy(() => import('./Pages/Assessment/AssesmentDashboard/AssessmentDashboard'))
const AssessmentInstructions = lazy(() => import('./Pages/Assessment/AssesmentInstructions/AssessmentInstructions'))
const QuizPage = lazy(() => import('./Pages/Assessment/QuizPage/QuizPage'))
const ResultPage = lazy(() => import('./Pages/Assessment/Result/ResultPage'))
const AllResult = lazy(() => import('./Pages/Assessment/Result/AllResult'))

// New Features - Resume Builder, Portfolio Generator, ATS Analyzer
const ResumeBuilder = lazy(() => import('./component/features/ResumeBuilder'))
const PortfolioGenerator = lazy(() => import('./component/features/PortfolioGenerator'))
const ATSAnalyzer = lazy(() => import('./component/features/ATSAnalyzer'))
const PublicPortfolio = lazy(() => import('./Pages/PublicPortfolio'))

// Assessment Hub Components
const AssessmentHub = lazy(() => import('./Pages/AssessmentHub/AssessmentHub'))
const SkillAssessment = lazy(() => import('./Pages/AssessmentHub/SkillAssessment'))
const AptitudeTest = lazy(() => import('./Pages/AssessmentHub/AptitudeTest'))
const CSFundamentals = lazy(() => import('./Pages/AssessmentHub/CSFundamentals'))
const AIMockInterview = lazy(() => import('./Pages/AssessmentHub/AIMockInterview'))
const PracticeResults = lazy(() => import('./Pages/AssessmentHub/PracticeResults'))
const PracticeResultDetail = lazy(() => import('./Pages/AssessmentHub/PracticeResultDetail'))
const InterviewResults = lazy(() => import('./Pages/AssessmentHub/InterviewResults'))
const InterviewResultDetail = lazy(() => import('./Pages/AssessmentHub/InterviewResultDetail'))

// Admin Components — the sidebar and header now come from AdminShell.
// Split hardest of all: a learner never opens any of these.
const AdminDashboard = lazy(() => import('./Admin/pages/AdminDashboard'))
const ManageUsers = lazy(() => import('./Admin/pages/ManageUsers'))
const QuizAttempts = lazy(() => import('./Admin/pages/QuizAttempts'))
const RoadmapHistory = lazy(() => import('./Admin/pages/RoadmapHistory'))
const AIAnalytics = lazy(() => import('./Admin/pages/AIAnalytics'))
const SystemSettings = lazy(() => import('./Admin/pages/SystemSettings'))
const AdminFeedback = lazy(() => import('./Admin/pages/Feedback'))

//comman components
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ScrollToTop from './component/ScrollToTop';
import { Loading } from './design';

const PageLoading = () => <Loading style={{ padding: '120px 20px' }} />

/**
 * A marketing page between the navbar and the footer.
 *
 * The Suspense boundary sits here, inside the chrome, rather than around the
 * whole route table — so following a link paints the new page's header and
 * footer immediately and waits only in the middle. A single boundary outside
 * would blank the navbar on every navigation, which is a strange thing to do
 * to someone who just clicked a link in it.
 */
const Chrome = ({ children }) => (
  <>
    <Navbar />
    <Suspense fallback={<PageLoading />}>{children}</Suspense>
    <Footer />
  </>
)

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
        <Suspense fallback={<Loading style={{ paddingTop: 120 }} />}>
          <Routes>
            <Route path="/*" element={<AdminDashboard />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<ManageUsers />} />
            <Route path="/admin/quiz-attempts" element={<QuizAttempts />} />
            <Route path="/admin/roadmaps" element={<RoadmapHistory />} />
            <Route path="/admin/analytics" element={<AIAnalytics />} />
            <Route path="/admin/feedback" element={<AdminFeedback />} />
            <Route path="/admin/settings" element={<SystemSettings />} />
          </Routes>
        </Suspense>

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
        <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<Chrome><Home /></Chrome>} />
          <Route path="/about" element={<Chrome><About /></Chrome>} />
          {/* Public on purpose: someone deciding whether to sign up needs to
              read these before handing over an email address. */}
          <Route path="/terms" element={<Chrome><Terms /></Chrome>} />
          <Route path="/privacy" element={<Chrome><Privacy /></Chrome>} />
          <Route path="/work" element={<Chrome><Work /></Chrome>} />
          <Route path="/contact" element={<Chrome><Contact /></Chrome>} />
          <Route path="/faq" element={<Chrome><FAQ /></Chrome>} />
          <Route path="/services" element={<Chrome><Services /></Chrome>} />
          <Route path="/roadmap" element={<Chrome><CareerRoadmap /></Chrome>} />
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
          <Route path="/profile" element={<RequiresAuth><ProfilePage /></RequiresAuth>} />
          <Route path="/settings" element={<RequiresAuth><SettingsPage /></RequiresAuth>} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/resume" element={<RequiresAuth><ResumePage /></RequiresAuth>} />
          <Route path="/assessment" element={<RequiresAuth><AssessmentDashboard /></RequiresAuth>} />
          <Route path="/assessment/instructions" element={<RequiresAuth><AssessmentInstructions /></RequiresAuth>} />
          <Route path="/assessment/result" element={<RequiresAuth><AllResult /></RequiresAuth>} />
          {/* Needs a role: results are filed against the role they were
              earned under, so an attempt with none set is recorded where
              nothing will read it. */}
          <Route path="/assessment/quiz" element={<RequiresProfile><QuizPage /></RequiresProfile>} />
          <Route path="/assessment/result/:resultId" element={<RequiresAuth><ResultPage /></RequiresAuth>} />

          {/* Assessment Hub Routes — the actual test-taking screens (and the
              past-result detail views, which reuse that same bare layout)
              carry no marketing Navbar, so there's nothing to look at but
              the test. The hub and the results-list screens are a different
              chrome entirely (LearnerShell's own sidebar and header) since
              they're for browsing, not mid-attempt. */}
          <Route path="/assessment-hub" element={<RequiresAuth><AssessmentHub /></RequiresAuth>} />
          <Route path="/assessment-hub/skill" element={<RequiresAuth><SkillAssessment /></RequiresAuth>} />
          <Route path="/assessment-hub/aptitude" element={<RequiresAuth><AptitudeTest /></RequiresAuth>} />
          <Route path="/assessment-hub/aptitude/results" element={<RequiresAuth><PracticeResults type="aptitude" label="Aptitude" retakePath="/assessment-hub/aptitude" /></RequiresAuth>} />
          <Route path="/assessment-hub/aptitude/results/:resultId" element={<RequiresAuth><PracticeResultDetail type="aptitude" /></RequiresAuth>} />
          <Route path="/assessment-hub/cs-fundamentals" element={<RequiresAuth><CSFundamentals /></RequiresAuth>} />
          <Route path="/assessment-hub/cs-fundamentals/results" element={<RequiresAuth><PracticeResults type="cs-fundamentals" label="CS fundamentals" retakePath="/assessment-hub/cs-fundamentals" /></RequiresAuth>} />
          <Route path="/assessment-hub/cs-fundamentals/results/:resultId" element={<RequiresAuth><PracticeResultDetail type="cs-fundamentals" /></RequiresAuth>} />
          <Route path="/assessment-hub/mock-interview/results" element={<RequiresAuth><InterviewResults /></RequiresAuth>} />
          <Route path="/assessment-hub/mock-interview/results/:resultId" element={<RequiresAuth><InterviewResultDetail /></RequiresAuth>} />
          <Route path="/assessment-hub/mock-interview" element={<RequiresProfile><AIMockInterview /></RequiresProfile>} />

          {/* New Feature Routes */}
          <Route path="/resume-builder" element={<RequiresAuth><ResumeBuilder /></RequiresAuth>} />
          <Route path="/portfolio-generator" element={<RequiresAuth><PortfolioGenerator /></RequiresAuth>} />
          <Route path="/ats-analyzer" element={<RequiresAuth><ATSAnalyzer /></RequiresAuth>} />

          {/* Public Portfolio Routes */}
          <Route path="/p/:portfolioId" element={<PublicPortfolio />} />
          {/* The readable form. PublicPortfolio has always accepted a
              username and fetched /portfolio/u/:username; the route was
              never added, so the handle had nowhere to land. Namespaced
              under /u so a handle cannot shadow /roadmap or /profile. */}
          <Route path="/u/:username" element={<PublicPortfolio />} />
          <Route path="/:username" element={<PublicPortfolio />} />
        </Routes>
        </Suspense>
      </div>
    )
  }

}

export default App
