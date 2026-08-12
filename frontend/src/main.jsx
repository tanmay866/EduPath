import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import URLNormalizer from './component/URLNormalizer.jsx'
import { QuizProvider } from './Pages/Context/QuizContext'
import { AuthProvider } from './Pages/Context/AuthContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <URLNormalizer>
        {/* Outside QuizProvider: who is signed in decides whether there is a
            quiz to hold at all, and the route guards read it. */}
        <AuthProvider>
          <QuizProvider>
            <App />
          </QuizProvider>
        </AuthProvider>
      </URLNormalizer>
    </BrowserRouter>
  </StrictMode>,
)
