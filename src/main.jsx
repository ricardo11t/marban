import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { RacesProvider } from './context/RacesProvider.jsx'
import { ClassesProvider } from './context/ClassesProvider.jsx';
import AuthProvider from './context/AuthProvider.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <StrictMode>
      <AuthProvider>
        <RacesProvider>
          <ClassesProvider>
            <App />
          </ClassesProvider>
        </RacesProvider>
      </AuthProvider>
    </StrictMode>
  </BrowserRouter>
)
