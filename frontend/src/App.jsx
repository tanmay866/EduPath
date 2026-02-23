import React from 'react'
import Navbar from './component/Navbar/Navbar'
import { Routes, Route } from 'react-router-dom'
import Home from './Pages/Home/Home'
import About from './Pages/About/About'
import Work from './Pages/Work/Work'
import Contact from './Pages/Contact/Contact'
import Signup from './Pages/Authentication/Signup'
import Signin from './Pages/Authentication/Signin'
import Footer from './component/Footer/Footer'
import AssessmentDashboard from './Pages/Assessment/AssesmentDashboard.jsx/AssessmentDashboard'
import AssessmentInstructions from './Pages/Assessment/AssessmentInstructions'
import QuizPage from './Pages/Assessment/QuizPage/QuizPage'
import ResultPage from './Pages/Assessment/ResultPage'
import ProfilePage from './Pages/Profile/ProfilePage'
import SettingsPage from './Pages/Settings/SettingsPage'

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

        <Routes>
          <Route path="/*" element={<> <AdminDashboard/> </>} />
          <Route path="/admin/*" element={<> <AdminDashboard/> </>} />
          <Route path="/admin/users" element={<> <ManageUsers/> </>} />
          <Route path="/admin/quiz-attempts" element={<> <QuizAttempts/> </>} />
          <Route path="/admin/roadmaps" element={<> <RoadmapHistory/> </>} />
          <Route path="/admin/analytics" element={<> <AIAnalytics/> </>} />
          <Route path="/admin/settings" element={<> <SystemSettings/> </>} />
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
      
      <Routes>
        <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><About /></>} />
        <Route path="/work" element={<><Navbar /><Work /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /></>} />
        <Route path="/signup" element={<><Navbar /><Signup /></>} />
        <Route path="/signin" element={<><Navbar /><Signin /></>} />
        <Route path="/profile" element={<><Navbar /><ProfilePage /></>} />
        <Route path="/settings" element={<><Navbar /><SettingsPage /></>} />
        <Route path="/assessment" element={<><AssessmentDashboard /></>} />
        <Route path="/assessment/instructions" element={<><AssessmentInstructions /></>} />
        <Route path="/assessment/quiz" element={<><QuizPage /></>} />
        <Route path="/assessment/result/:resultId" element={<><ResultPage /></>} />
      </Routes>
    </div>
  )
  }
  
}

export default App