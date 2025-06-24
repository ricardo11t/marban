// src/public-pages/Cadastro.jsx
import React, { useContext, useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
// Adicionado IconButton e InputAdornment
import { Box, Button, Paper, TextField, CircularProgress, Typography, IconButton, InputAdornment } from '@mui/material';
import { AuthContext } from '../context/AuthProvider';
import { useNavigate, Link } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Cadastro = () => {
  const { register, loading, authError, setAuthError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Limpar erros ao digitar
  useEffect(() => {
    if (username || email || password || confirmPassword) {
      setAuthError(null); // Limpa erro da API
      setFormError(null);   // Limpa erro local
    }
  }, [username, email, password, confirmPassword, setAuthError]);

  const handleUsernameChange = (event) => setUsername(event.target.value);
  const handleEmailChange = (event) => setEmail(event.target.value);
  const handlePasswordChange = (event) => setPassword(event.target.value);
  const handleConfirmPasswordChange = (event) => setConfirmPassword(event.target.value);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAuthError(null);
    setFormError(null);

    if (!username || !email || !password || !confirmPassword) {
      setFormError("Todos os campos são obrigatórios.");
      return;
    }

    if (username.length > 20) {
      setFormError("O username ultrapassa o limite de 20 caracteres.");
      return;
    }

    if (password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("As senhas não coincidem.");
      return;
    }

    const result = await register(username, email, password);

    if (result && result.success) {
      navigate('/login?status=registered_successfully');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const textFieldStyle = {
    backgroundColor: 'white',
    borderRadius: 2,
    mb: 3,
    '& .MuiInputBase-input': { color: 'black' },
    '& label': { color: 'rgba(0,0,0,0.6)' },
    '& label.Mui-focused': { color: '#601b1c' },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
      '&:hover fieldset': { borderColor: '#400a0b' },
      '&.Mui-focused fieldset': { borderColor: '#601b1c' },
    },
  };

  return (
    <>
      <Header />
      <main className='min-h-[900px] py-10 bg-black'>
        <div className='flex justify-center'>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              backgroundColor: '#601b1c',
              width: { xs: '95%', sm: 500, md: 700 },
              minHeight: 650,
              color: 'white',
              borderRadius: 6,
              padding: { xs: 3, sm: 4, md: 5 },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 5,
            }}
          >
            <Typography variant="h4" component="h1" sx={{ mb: 4, textAlign: 'center' }}>
              Crie sua Conta
            </Typography>

            <TextField
              fullWidth
              label="Nome de Usuário"
              type="text"
              value={username}
              sx={textFieldStyle}
              onChange={handleUsernameChange}
              required
              autoComplete="username"
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              sx={textFieldStyle}
              onChange={handleEmailChange}
              required
              autoComplete="email"
            />
            <TextField
              fullWidth
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              value={password}
              sx={textFieldStyle}
              onChange={handlePasswordChange}
              required
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={toggleShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Confirmar Senha"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              sx={textFieldStyle}
              onChange={handleConfirmPasswordChange}
              required
              autoComplete="new-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={toggleShowConfirmPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {formError && (
              <Typography color="error" sx={{ backgroundColor: 'rgba(255,100,100,0.2)', color: 'white', fontWeight: 'bold', mb: 2, padding: '8px 16px', borderRadius: '4px', width: '100%', textAlign: 'center' }}>
                {formError}
              </Typography>
            )}
            {authError && (
              <Typography color="error" sx={{ backgroundColor: 'rgba(255,100,100,0.2)', color: 'white', fontWeight: 'bold', mb: 2, padding: '8px 16px', borderRadius: '4px', width: '100%', textAlign: 'center' }}>
                {authError}
              </Typography>
            )}

            <Button
              type="submit"
              variant='contained'
              disabled={loading}
              sx={{
                width: '100%',
                backgroundColor: 'black',
                py: 1.5,
                mt: 2,
                fontSize: '1rem',
                '&:hover': { backgroundColor: '#333' },
                '&.Mui-disabled': { backgroundColor: 'grey' }
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Cadastrar'}
            </Button>

            <Typography sx={{ mt: 3, textAlign: 'center' }}>
              Já tem uma conta?{' '}
              <Link to="/login" style={{ color: 'lightblue', textDecoration: 'underline' }}>
                Faça login aqui!
              </Link>
            </Typography>
          </Box>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Cadastro;