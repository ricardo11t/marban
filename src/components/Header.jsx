import { Button } from '@mui/material'
import React, { useContext } from 'react'
import Navbar from './Navbar'
import { Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthProvider'

const Header = () => {
  const { isAuthenticated, user , logout, loading } = useContext(AuthContext);



  return (
    <header>
      <div className='flex justify-around p-0 bg-[#601b1c]'>
        <div className='mt-0 p-2'>
          <a href="/"><img src="/img/logo-site.png" alt="" className='h-20' /></a>
        </div>
          <div className='flex gap-5'>
            <div className='flex mt-8 gap-4'>
              <div>
                <Link to={`/`}>            
                <Button variant="contained"
                  sx={{
                    backgroundColor: 'darkgray',
                    color: 'white',
                    height: '38px',
                    paddingX: 2,
                    borderRadius: '6px',
                    '&:hover': {
                      backgroundColor: 'gray',
                    }
                  }}>
                  Home
                </Button></Link>
              </div>
            <div>
              <Navbar />
            </div>
            </div>
            <div>
            </div>
          </div>
        <div></div>
        <div></div>
          <div className='flex gap-4 mt-8'>
              <div>
            {isAuthenticated ? (
              <div className='gap-5'>
                <div>
                  <h2 className='text-serif text-white'>Seja bem vindo, <span className='text-sans text-emerald-700'>{user.username}</span></h2>
                </div>
                <Button
                  variant="contained"
                  sx={{
                    backgroundColor: 'darkgray',
                    color: 'white',
                    height: '38px',
                    paddingX: 2,
                    borderRadius: '6px',
                    '&:hover': {
                      backgroundColor: 'gray',
                    }
                  }}
                  onClick={logout}
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className='gap-5'>
                <div>
                    <Link to={`/login`}>
                      <Button variant='contained' sx={{
                        backgroundColor: 'darkgray',
                        color: 'white',
                        height: '38px',
                        paddingX: 2,
                        borderRadius: '6px',
                        '&:hover': {
                          backgroundColor: 'gray',
                        }
                      }}>Login</Button>
                    </Link>
                </div>
                <div>
                    <Link to={`/cadastro`}>
                      <Button variant='contained' sx={{
                        backgroundColor: 'black',
                        color: 'white',
                        height: '38px',
                        paddingX: 2,
                        borderRadius: '6px',
                        '&:hover': {
                          backgroundColor: 'beige',
                        }
                      }}>Cadastrar</Button>
                    </Link>
                </div>
              </div>
            )}
        </div>
          </div>
        </div>
    </header>
  )
}

export default Header