import axios from 'axios';
import React, { createContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Criação do Contexto
export const AuthContext = createContext(null); // Inicializa com null ou um objeto com valores padrão

// URL base da sua API (pode vir de uma variável de ambiente)
const API_URL = 'https://marban-git-feat-ricardo-ricardo11ts-projects.vercel.app/api/auth';

const AuthProvider = ({ children }) => { // Corrigido: children é recebido como prop
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken')); // Carrega o token inicial
  const [loading, setLoading] = useState(true); // Para verificar o estado inicial de autenticação
  const [authError, setAuthError] = useState(null); // Para armazenar erros de autenticação
  const navigate = useNavigate();

  // Função para configurar o header de autorização do Axios
  const setAuthHeader = useCallback((currentToken) => {
    if (currentToken) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, []);

  // Efeito para verificar o token e carregar dados do usuário na inicialização
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUserData = localStorage.getItem('userData');

      if (storedToken) {
        setToken(storedToken);
        setAuthHeader(storedToken); // Configura o header do Axios
        if (storedUserData) {
          try {
            setUser(JSON.parse(storedUserData));
          } catch (e) {
            console.error("Erro ao parsear userData do localStorage:", e);
            localStorage.removeItem('userData'); // Remove dados inválidos
          }
        } else {
          // Se tiver token mas não tiver user data, poderia buscar os dados do usuário
          // Ex: await fetchUserData(storedToken); (implementação necessária)
          // Por enquanto, vamos assumir que se não tem userData, o usuário não está completamente carregado
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [setAuthHeader]); // setAuthHeader é uma dependência estável devido ao useCallback

  // Função de LOGIN
  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await axios.post(`${API_URL}/login`, { // Ou /api/auth?action=login
        email,
        password, // Corrigido: nome da propriedade é 'password', não 'senha' se a API espera 'password'
      });

      // Axios coloca a resposta no campo 'data'
      const { token: receivedToken, user: userData, message } = response.data;

      if (receivedToken && userData) {
        localStorage.setItem('authToken', receivedToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        setToken(receivedToken);
        setUser(userData);
        setAuthHeader(receivedToken); // Configura o header do Axios
        navigate('/criacao'); // Ou para o dashboard/página principal após login
        return { success: true, message: message || "Login bem-sucedido!" };
      } else {
        throw new Error(message || "Token ou dados do usuário não recebidos.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao fazer login.';
      console.error("Erro no login:", err);
      setAuthError(errorMessage);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setToken(null);
      setUser(null);
      setAuthHeader(null);
      setLoading(false);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Função de REGISTER
  const register = async (username, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      // A API espera 'username', 'email', 'senha' (e não 'nome_completo' como no seu backend)
      // Ajuste os nomes dos campos conforme o que sua API de registro realmente espera.
      // Se sua API espera 'nome_completo', use isso em vez de 'username'.
      const response = await axios.post(`${API_URL}/register`, { // Ou /api/auth?action=register
        username, // Ou nome_completo, dependendo da sua API
        email,
        senha: password, // API espera 'senha'
      });

      const { message, user: registeredUser } = response.data; // A API de registro pode ou não retornar o usuário/token

      // Opcional: Fazer login automaticamente após o registro bem-sucedido
      if (registeredUser && response.data.token) { //Se a API de registro retornar token
          await login(email, password);
      } else {
          navigate('/login'); // Ou para uma página de "verifique seu email"
      }
      setLoading(false);
      return { success: true, message: message || "Usuário registrado com sucesso!" };

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao registrar.';
      console.error("Erro no registro:", err);
      setAuthError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  // Função de LOGOUT
  const logout = useCallback(() => { // useCallback para estabilizar a referência da função
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setToken(null);
    setUser(null);
    setAuthHeader(null); // Remove o header do Axios
    setAuthError(null);
    navigate('/login'); // Ou para a página inicial
  }, [navigate, setAuthHeader]);

  // Valor a ser fornecido pelo Contexto
  const contextValue = {
    user,
    token,
    isAuthenticated: !!token, // Um getter simples para verificar se está autenticado
    loading,
    authError,
    login,
    register,
    logout,
    setAuthError // Para permitir limpar o erro de fora, se necessário
  };

  return (
    <AuthContext.Provider value={contextValue}> {/* Corrigido: AuthContext.Provider */}
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;