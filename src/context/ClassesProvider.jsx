import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
// import axios from 'axios'; // REMOVE this direct import of global axios
import { AuthContext } from './AuthProvider'; // Correct path assumed

export const ClassesContext = createContext({
  classes: [],
  isLoading: true,
  error: null,
  refetchClasses: () => Promise.resolve(),
});

export const ClassesProvider = ({ children }) => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get axiosInstance directly from AuthContext
  const { token, loading: authLoading, isAuthenticated, axiosInstance } = useContext(AuthContext);

  // API_BASE_URL is usually part of the axiosInstance config.
  // If your axiosInstance baseURL is '/api', then just use relative paths.
  // If not, you might need to adjust. Assuming axiosInstance baseURL is '/api'.
  // const API_BASE_URL = '/api'; // This variable is now redundant if axiosInstance.baseURL is '/api'

  const fetchClasses = useCallback(async () => {
    if (authLoading) {
      console.log('[ClassesProvider] AuthProvider ainda carregando. Aguardando...');
      setIsLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setError('Autenticação necessária para buscar classes.');
      setClasses([]);
      setIsLoading(false);
      return;
    }

    // IMPORTANT: Ensure axiosInstance is available before using it
    if (!axiosInstance) {
      console.warn('[ClassesProvider] axiosInstance não disponível no AuthContext.');
      setError('Serviço de autenticação não inicializado corretamente.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Use axiosInstance instead of global axios
      const response = await axiosInstance.get('/classes'); // Use relative path if axiosInstance has baseURL '/api'
      let classesArray = response.data?.data || response.data || [];
      if (!Array.isArray(classesArray)) classesArray = [];
      setClasses(classesArray);

    } catch (err) {
      console.error("[ClassesProvider] Erro ao buscar classes:", err);
      const errorMessage = err.response?.data?.message || err.message || "Erro desconhecido ao buscar classes.";
      setError(errorMessage);
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, axiosInstance]); // Add axiosInstance to dependencies

  useEffect(() => {
    // Only fetch if auth is not loading AND axiosInstance is ready
    if (!authLoading && axiosInstance) { // Check for axiosInstance here too
      fetchClasses();
    }
  }, [authLoading, fetchClasses, axiosInstance]); // Include axiosInstance as a dependency

  return (
    <ClassesContext.Provider value={{ classes, isLoading, error, refetchClasses: fetchClasses }}>
      {children}
    </ClassesContext.Provider>
  );
};

export default ClassesProvider;