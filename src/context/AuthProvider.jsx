import axios from 'axios';
import React, { createContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export const AuthContext = createContext(null);

const API_URL = '/api'; // Changed to general API base for authenticated requests

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();

  // Memoize logout to ensure stability for dependencies
  const logout = useCallback(async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setToken(null);
    setUser(null);
    setAuthError(null);
    // Clean up axios header if you were using global defaults (now largely irrelevant if using instance)
    delete axios.defaults.headers.common['Authorization'];

    await Swal.fire({
      icon: 'warning',
      title: 'Sessão Expirada',
      text: 'Sua sessão expirou ou você não tem permissão. Por favor, faça login novamente.',
      showConfirmButton: false,
      timer: 2000
    });
    navigate('/login'); // Redirect to login page
  }, [navigate]);

  // Create an Axios instance for authenticated requests
  // Dependency on 'token' is crucial here, so the interceptor gets the latest token
  const axiosInstance = useMemo(() => {
    const instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request Interceptor: Add Authorization header if token exists
    instance.interceptors.request.use(
      (config) => {
        // Get token from state or directly from localStorage right before request
        const currentToken = token || localStorage.getItem('authToken'); // Prioritize state, fallback to localStorage
        if (currentToken) {
          config.headers['Authorization'] = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response Interceptor: Handle 401/403 errors
    instance.interceptors.response.use(
      (response) => response, // Just return response for success
      async (error) => {
        const originalRequest = error.config;

        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          // Check if it's already a retried request or if we're already logging out
          if (!originalRequest._retry && !originalRequest._isLogoutFlow) { // Add _isLogoutFlow flag
            originalRequest._retry = true; // Mark this request as retried
            originalRequest._isLogoutFlow = true; // Mark to prevent re-triggering logout

            console.warn("Requisição não autorizada ou token expirado. Acionando logout.");
            await logout(); // Calls the memoized logout function

            return new Promise(() => { }); // Return a never-resolving promise to halt further processing of this request
          }
        }
        // For all other errors, or if _retry was true (meaning an already retried request failed again)
        return Promise.reject(error); // Re-throw the error
      }
    );

    return instance;
  }, [token, logout]); // Dependency array: token (to re-create if token changes) and logout

  // Effect to initialize user data and token from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem('authToken');
      const storedUserData = localStorage.getItem('userData');

      if (storedToken) {
        setToken(storedToken); // Ensure state is updated from localStorage
        if (storedUserData) {
          try {
            setUser(JSON.parse(storedUserData));
          } catch (e) {
            console.error("Erro ao parsear userData do localStorage:", e);
            localStorage.removeItem('userData');
          }
        }
      }
      setLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      // Use base axios for login/register as they don't require auth header yet
      const response = await axios.post(`${API_URL}/auth/login`, {
        email: email,
        password: password
      });

      const { token: receivedToken, user: userData, message } = response.data;

      if (receivedToken && userData) {
        localStorage.setItem('authToken', receivedToken);
        localStorage.setItem('userData', JSON.stringify(userData));
        setToken(receivedToken); // Update token state
        setUser(userData);
        navigate('/criacao');
        return { success: true, message: message || "Login bem-sucedido!" };
      } else {
        throw new Error(message || "Token ou dados do usuário não recebidos.");
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao fazer login.';
      console.error("Erro no login:", err);
      setAuthError(errorMessage);
      // Clear all auth related local storage and state on login failure
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setToken(null);
      setUser(null);
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
      const response = await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        senha: password
      });

      const { message, user: registeredUser, token: receivedToken } = response.data; // Ensure token is destructured

      if (registeredUser && receivedToken) { // Check for receivedToken here
        localStorage.setItem('authToken', receivedToken); // Save token from registration
        localStorage.setItem('userData', JSON.stringify(registeredUser));
        setToken(receivedToken); // Update state token
        setUser(registeredUser);
        navigate('/criacao');
        return { success: true, message: message || "Usuário registrado e logado com sucesso!" };
      } else {
        navigate('/login');
        return { success: true, message: message || "Usuário registrado com sucesso! Por favor, faça login." };
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erro ao registrar.';
      console.error("Erro no registro:", err);
      setAuthError(errorMessage);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  const isAdmin = () => {
    const userDataString = localStorage.getItem('userData');
    if (!userDataString) {
      return false;
    }
    try {
      const userDataObject = JSON.parse(userDataString);
      return userDataObject && userDataObject.role === 'admin';
    } catch (e) {
      console.error("Erro ao parsear dados do usuário ou verificar a role:", e);
      return false;
    }
  };

  const contextValue = {
    user,
    token, // Provide token in context
    isAuthenticated: !!token,
    loading,
    authError,
    login,
    register,
    logout,
    setAuthError,
    isAdmin,
    axiosInstance, // Provide the custom axios instance
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;