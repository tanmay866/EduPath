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
import AssessmentDashboard from './Pages/Assessment/AssessmentDashboard'
import AssessmentInstructions from './Pages/Assessment/AssessmentInstructions'
import QuizPage from './Pages/Assessment/QuizPage'
import ResultPage from './Pages/Assessment/ResultPage'
import ProfilePage from './Pages/Profile/ProfilePage'
import SettingsPage from './Pages/Settings/SettingsPage'

const App = () => {
  return (
    <div className="bg-slate-950 min-h-screen">
      
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
        <Route path="/assessment/result" element={<><ResultPage /></>} />
      </Routes>
    </div>
  )
}

export default App