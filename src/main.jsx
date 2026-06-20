import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { DebugProvider } from './hooks/useDebug'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <DebugProvider>
        <App />
      </DebugProvider>
    </BrowserRouter>
  </StrictMode>
)
