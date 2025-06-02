import { Button, CircularProgress, Typography } from '@mui/material'; // Adicionado CircularProgress
import React, { useContext } from 'react';
import Navbar from './Navbar'; // Assumindo que Navbar está no mesmo nível ou caminho correto
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const Header = () => {
  const { isAuthenticated, user, logout, loading } = useContext(AuthContext);

  // Estilo comum para botões de navegação para evitar repetição
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
      {/* Container Principal do Header */}
      <div className='flex justify-between items-center p-2 md:p-4 bg-[#601b1c]'> {/* Ajustado para justify-between e items-center */}

        {/* 1. Logo */}
        <div>
          <Link to="/"><img src="/img/logo-site.png" alt="Logo Marban" className='h-16 md:h-20' /></Link> {/* Usado Link para navegação SPA */}
        </div>

        {/* 2. Navegação Central */}
        <div className='flex items-center gap-3 md:gap-4'>
          <Link to={`/`}>
            <Button variant="contained" sx={navButtonStyle}>
              Home
            </Button>
          </Link>
          <Navbar /> {/* Seu componente Navbar */}
        </div>

        {/* 3. Seção de Autenticação */}
        <div className='flex items-center gap-3 md:gap-4'>
          {loading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : isAuthenticated && user ? ( // Adicionada verificação para user não ser null
            <div className='flex flex-col sm:flex-row items-center gap-2 md:gap-4'> {/* Itens lado a lado em telas maiores */}
              <Typography variant="subtitle1" sx={{ color: 'white', fontFamily: 'serif' }}> {/* Usando Typography do MUI */}
                Olá, <span className='font-sans text-emerald-400 font-semibold'>{user.username || user.nomeCompleto || user.email}</span>! {/* Prioriza username, depois nome_completo, depois email */}
              </Typography>
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
                  ...navButtonStyle, // Reutiliza o estilo base
                  backgroundColor: 'black', // Sobrescreve o que for diferente
                  '&:hover': {
                    backgroundColor: '#333', // Um hover mais escuro para o botão preto
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

// Se Typography não estiver importado, adicione:
// import { Typography } from '@mui/material';
// Certifique-se de que Navbar é importado corretamente ou defina-o se for simples.
// Se Navbar for complexo, pode precisar de seus próprios items condicionais de autenticação.

export default Header;