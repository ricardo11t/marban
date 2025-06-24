import React, { useContext, useState, useEffect } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { Box, Button, Paper, TextField, CircularProgress, Typography, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { AuthContext } from '../context/AuthProvider';

const Login = () => {
  const { login, loading, authError, setAuthError } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (email || password) {
      setAuthError(null); 
    }
  }, [email, password, setAuthError]);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      setAuthError("Email e senha são obrigatórios.");
      return;
    }
    await login(email, password);
  };

  const toggleShowPassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };


  return (
    <>
      <Header />
      <main className='min-h-screen bg-black'>
        <div className='flex justify-center pt-20'>
          <Box
            component="form"
            onSubmit={handleSubmit} 
            sx={{
              backgroundColor: '#601b1c',
              width: { xs: '90%', sm: 500, md: 700 },
              minHeight: 600,
              color: 'white',
              borderRadius: 2,
              padding: { xs: 2, sm: 3, md: 4 },
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
              fullWidth
              label={'Email'}
              type="email"
              value={email}
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
              onChange={handleEmailChange}
              required
            />
            <TextField
              fullWidth
              label={'Senha'}
              type={!showPassword ? 'password' : 'text'}
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
              required
            />

            {authError && (
              <Typography color="error" sx={{ mb: 2, backgroundColor: 'rgba(255,255,255,0.1)', padding: '8px', borderRadius: '4px', width: '100%', textAlign: 'center' }}>
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