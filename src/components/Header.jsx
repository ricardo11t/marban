import { Button, CircularProgress, Typography } from '@mui/material';
import React, { useContext } from 'react';
import Navbar from './Navbar';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const Header = () => {
  const { isAuthenticated, user, logout, loading } = useContext(AuthContext);

  const navButtonStyle = {
    backgroundColor: 'darkgray',
    color: 'white',
    height: '38px',
    paddingX: 2,
    borderRadius: '6px',
    '&:hover': {
      backgroundColor: 'gray',
    }
  };

  return (
    <header>
      <div className='flex justify-between items-center p-2 md:p-4 bg-[#601b1c]'>
        <div className='ml-10 mr-4 max-[370px]:hidden'>
          <Link to="/"><img src="/img/logo-site.png" alt="Logo Marban" className='h-16' /></Link>
        </div>

        <div className='flex items-center gap-3 md:gap-4'>
          <div className='max-[450px]:hidden'>
            <Link to={`/`}>
              <Button variant="contained" sx={navButtonStyle} >
                Home
              </Button>
            </Link>
          </div >
          <Navbar />
        </div>

        {/* 3. Seção de Autenticação */}
        <div className='flex items-center gap-3 md:gap-4'>
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : isAuthenticated && user ? (
            <div className='flex flex-col sm:flex-row items-center gap-2 md:gap-4'>
                <div className='max-[250px]:hidden'>
                <Typography variant="subtitle1" sx={{ color: 'white', fontFamily: 'serif' }}>
                  Olá, <span className='font-sans text-emerald-400 font-semibold'>{user.username || user.nomeCompleto || user.email}</span>!
                </Typography>
              </div>
              <Button
                variant="contained"
                sx={navButtonStyle}
                onClick={logout}
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className='flex items-center gap-3 md:gap-4'>
              <Link to={`/login`}>
                <Button variant='contained' sx={navButtonStyle}>
                  Login
                </Button>
              </Link>
              <Link to={`/cadastro`}>
                <Button variant='contained' sx={{
                  ...navButtonStyle,
                  backgroundColor: 'black',
                  '&:hover': {
                    backgroundColor: '#333',
                  }
                }}>
                  Cadastrar
                </Button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;