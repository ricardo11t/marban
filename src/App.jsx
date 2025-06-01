import './App.css'
import { Route, Routes } from 'react-router-dom'
import LandingPage from './pages/(public)/LandingPage'
import CriacaoPage from './pages/(private)/CriacaoPage'
import Races from './pages/(private)/Races'
import Classes from './pages/(private)/Class'

function App() {

  return (
    <Routes>
      <Route path='/' element={<LandingPage />} />
      <Route path='/criacao' element={<CriacaoPage />} />
      <Route path='/racas' element={<Races />} />
      <Route path='/classes' element={<Classes />} />
    </Routes>
  )
}

export default App
