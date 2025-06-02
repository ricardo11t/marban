// src/public-pages/Cadastro.jsx (ou o caminho que você preferir)
import React, { useContext, useState, useEffect } from 'react';
import Footer from '../components/Footer';
import HeaderPLC from '../components/HeaderPLC';
import { Box, Button, Paper, TextField, CircularProgress, Typography } from '@mui/material';
import { AuthContext } from '../context/AuthProvider';
import { useNavigate, Link } from 'react-router-dom'; // Adicionado Link

const Cadastro = () => {
  const { register, loading, authError, setAuthError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState(null); // Para erros de validação do formulário local

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
    if (password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("As senhas não coincidem.");
      return;
    }
    // Adicione mais validações se necessário (ex: formato de email)

    // A função register no AuthProvider espera (username, email, password)
    // e a API espera 'username', 'email', 'senha'
    const result = await register(username, email, password);

    if (result && result.success) {
      // Redireciona para o login com uma mensagem ou diretamente para uma página de "verifique seu email"
      // ou, se o registro já logar o usuário, para a área logada.
      // Por enquanto, vamos redirecionar para o login com uma mensagem de sucesso (via query param).
      navigate('/login?status=registered_successfully');
    }
    // Se result.success for false, authError no context será atualizado pela função register
  };

  // Estilo comum para TextFields para manter consistência
  const textFieldStyle = {
    backgroundColor: 'white',
    borderRadius: 2,
    mb: 3, // Margin bottom
    '& .MuiInputBase-input': { color: 'black' },
    '& label': { color: 'rgba(0,0,0,0.6)' }, // Cor do label padrão
    '& label.Mui-focused': { color: '#601b1c' }, // Cor do label quando focado
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: 'rgba(0, 0, 0, 0.23)' },
      '&:hover fieldset': { borderColor: '#400a0b' }, // Um pouco mais escuro que #601b1c no hover
      '&.Mui-focused fieldset': { borderColor: '#601b1c' },
    },
  };

  return (
    <>
      <HeaderPLC />
      <main className='min-h-[900px] py-10 bg-gray-100'> {/* Adicionado um fundo e padding */}
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
              boxShadow: 5, // Adiciona uma sombra sutil
            }}
          >
            <Typography variant="h4" component="h1" sx={{ mb: 4, fontFamily: 'serif', textAlign: 'center' }}>
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
              type="password"
              value={password}
              sx={textFieldStyle}
              onChange={handlePasswordChange}
              required
              autoComplete="new-password"
            />
            <TextField
              fullWidth
              label="Confirmar Senha"
              type="password"
              value={confirmPassword}
              sx={textFieldStyle}
              onChange={handleConfirmPasswordChange}
              required
              autoComplete="new-password"
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
                mt: 2, // Margin top
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