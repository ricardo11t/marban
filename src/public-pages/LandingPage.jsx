import React, { useContext } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { Button } from '@mui/material'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthProvider'

const LandingPage = () => {
  const { isAuthenticated } = useContext(AuthContext);

  return (
    <div className='flex flex-col min-h-screen'>
        <Header />
      <main className='flex-1 bg-cover bg-center' style={{ backgroundImage: `url("../img/mapa_do_rpg.png")`}}>
          <section>
            <div className='relative w-full h-[100vh]'>
              <div className='absolute inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center'>
                {isAuthenticated ? (
                  null
                ) : (
                <div>
                  <h1 className = 'text-center text-white text-xl font-bold'>Logue para acessar as funcionalidades.</h1>
                  <br />
                  <div className='text-center gap-5'>
                    <Link to={`/login`}><Button variant='contained' sx={{ backgroundColor: '#601b1c', marginRight: 2 }}>Login</Button></Link>
                    <Link to={`/cadastro`}><Button variant='contained' sx={{ backgroundColor: '#601b1c' }}>Cadastre-se</Button></Link>
                  </div>
                </div>
                )}
              </div>
            </div>
          </section>
        </main>
        <Footer />
    </div>
  )
}

export default LandingPage