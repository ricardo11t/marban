import './App.css'
import { Route, Routes } from 'react-router-dom'
import LandingPage from './public-pages/LandingPage'
import CriacaoPage from './private-pages/CriacaoPage'
import Races from './private-pages/Races'
import Classes from './private-pages/Class'
import Login from './public-pages/Login'
import Cadastro from './public-pages/Cadastro'
import ProtectedRoute from './components/ProtectedRoute'

function App() {

  return (
    <Routes>
      {/**Rotas Publicas */}
      <Route path='/' element={<LandingPage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/cadastro' element={<Cadastro />} />

      {/**Rotas Privadas */}
      <Route element={<ProtectedRoute />}>
        <Route path='/criacao' element={<CriacaoPage />} />
        <Route path='/racas' element={<Races />} />
        <Route path='/classes' element={<Classes />} />
      </Route>
    </Routes>
  )
}

export default App
