import React, { useContext, useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Box, Button, Paper, TextField, CircularProgress, Typography } from '@mui/material'; // Adicionado CircularProgress e Typography
import { AuthContext } from '../context/AuthProvider';

const Login = () => {
  // Correção 1: Desestruturar diretamente as propriedades do contexto
  const { login, loading, authError, setAuthError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Limpar erro ao digitar
  useEffect(() => {
    if (email || password) {
      setAuthError(null); // Limpa o erro quando o usuário começa a digitar
    }
  }, [email, password, setAuthError]);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  // Correção 2: handleSubmit como um event handler para o formulário
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) { // 'email' e 'password' aqui são do estado do componente
      setAuthError("Email e senha são obrigatórios.");
      return;
    }
    await login(email, password); // 'email' e 'password' são passados corretamente
  };

  return (
    <>
      <Header />
      <main className='min-h-screen bg-black'>
        <div className='flex justify-center pt-20'>
          {/* Correção 2: Envolver em um <form> e usar onSubmit */}
          <Box
            component="form" // Transforma o Box em um elemento form
            onSubmit={handleSubmit} // onSubmit no form
            sx={{
              backgroundColor: '#601b1c',
              width: { xs: '90%', sm: 500, md: 700 }, // Largura responsiva
              minHeight: 600, // Altura mínima, pode crescer se necessário
              color: 'white',
              borderRadius: 2,
              padding: { xs: 2, sm: 3, md: 4 }, // Padding responsivo
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h4" component="h1" sx={{ mb: 4, mt: { xs: 2, md: 0 }, textAlign: 'center' }}>
              Faça seu login
            </Typography>

            <TextField
              fullWidth // Ocupa a largura total do container Box interno
              label={'Email'}
              type="email"
              value={email}
              sx={{
                backgroundColor: 'white',
                borderRadius: 2,
                mb: 4, // Margin bottom
                '& .MuiInputBase-input': { color: 'black' }, // Cor do texto digitado
                '& label.Mui-focused': { color: '#601b1c' }, // Cor do label quando focado
                '& .MuiOutlinedInput-root': { // Estilo da borda
                  '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                  '&:hover fieldset': { borderColor: '#601b1c' },
                  '&.Mui-focused fieldset': { borderColor: '#601b1c' },
                },
              }}
              onChange={handleEmailChange}
              required
            />
            <TextField
              fullWidth
              label={'Senha'}
              type="password"
              value={password}
              sx={{
                backgroundColor: 'white',
                borderRadius: 2,
                mb: 4,
                '& .MuiInputBase-input': { color: 'black' },
                '& label.Mui-focused': { color: '#601b1c' },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
                  '&:hover fieldset': { borderColor: '#601b1c' },
                  '&.Mui-focused fieldset': { borderColor: '#601b1c' },
                },
              }}
              onChange={handlePasswordChange}
              required
            />

            {authError && (
              <Typography color="error" sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '4px', width: '100%', textAlign: 'center' }}>
                {authError}
              </Typography>
            )}

            <Button
              type="submit" // Botão tipo submit para o formulário
              variant='contained'
              disabled={loading} // Desabilita o botão durante o carregamento
              sx={{
                width: '100%',
                backgroundColor: 'black',
                py: 1.5, // Padding vertical
                '&:hover': { backgroundColor: '#333' },
                '&.Mui-disabled': { backgroundColor: 'grey' }
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Login'}
            </Button>
          </Box>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default Login;