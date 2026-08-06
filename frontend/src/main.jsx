import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import URLNormalizer from './component/URLNormalizer.jsx'
import { QuizProvider } from './Pages/Context/QuizContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <URLNormalizer>
        <QuizProvider>
          <App />
        </QuizProvider>
      </URLNormalizer>
    </BrowserRouter>
  </StrictMode>,
)
