import axios from 'axios';
import React, { createContext, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// 1. Criação do Contexto
export const AuthContext = createContext(null); // Inicializa com null ou um objeto com valores padrão

// URL base da sua API (pode vir de uma variável de ambiente)
const API_URL = 'https://marban-ghnxrzcgq-ricardo11ts-projects.vercel.app/api/auth';

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
      const response = await axios.post(`${API_URL}/login`, {
        email: email,
        password: password
      });

      const { token: receivedToken, user: userData, message } = response.data;

      if (receivedToken && userData) {
        localStorage.setItem('authToken', receivedToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        setToken(receivedToken);
        setUser(userData);
        setAuthHeader(receivedToken);
        navigate('/criacao');
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

  const register = async (username, email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const response = await axios.post(`${API_URL}/register`, {
        username,
        email,
        senha: password
      });

      const { message, user: registeredUser } = response.data;


      if (registeredUser && response.data.token) {
          await login(email, password);
      } else {
          navigate('/login');
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

  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setToken(null);
    setUser(null);
    setAuthHeader(null);
    setAuthError(null);
    navigate('/');
  }, [navigate, setAuthHeader]);

  const isAdmin = () => {
    const userDataString = localStorage.getItem('userData');

    if (!userDataString) {
      return false;
    }

    try {
      const userDataObject = JSON.parse(userDataString);

      if (userDataObject && userDataObject.role === 'admin') {
        return true;
      } else {
        return false;
      }
    } catch (e) {
      console.error("Erro ao parsear dados do usuário ou verificar a role:", e);
      return false;
    }
  }


  const contextValue = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    authError,
    login,
    register,
    logout,
    setAuthError,
    isAdmin
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;