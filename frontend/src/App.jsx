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
        <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
        <Route path="/work" element={<><Navbar /><Work /><Footer /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /><Footer /></>} />
        <Route path="/signup" element={<><Navbar /><Signup /></>} />
        <Route path="/signin" element={<><Navbar /><Signin /></>} />
        <Route path="/profile" element={<><Navbar /><ProfilePage /><Footer /></>} />
        <Route path="/settings" element={<><Navbar /><SettingsPage /><Footer /></>} />
        <Route path="/assessment" element={<><AssessmentDashboard /><Footer /></>} />
        <Route path="/assessment/instructions" element={<><AssessmentInstructions /><Footer /></>} />
        <Route path="/assessment/quiz" element={<><QuizPage /><Footer /></>} />
        <Route path="/assessment/result" element={<><ResultPage /><Footer /></>} />
      </Routes>
    </div>
  )
}

export default App