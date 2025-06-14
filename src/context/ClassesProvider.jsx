import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthProvider'; // Verifique o caminho

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
 
  const API_BASE_URL = '/api';

  const { token, loading: authLoading, isAuthenticated } = useContext(AuthContext);

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

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/classes`);
      let classesArray = response.data?.data || response.data || [];
      if (!Array.isArray(classesArray)) classesArray = [];
      setClasses(classesArray);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Erro desconhecido ao buscar classes.";
      setError(errorMessage);
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, token]);

  useEffect(() => {
    if (!authLoading) {
      fetchClasses();
    }
  }, [authLoading, fetchClasses]);

  return (
    <ClassesContext.Provider value={{ classes, isLoading, error, refetchClasses: fetchClasses }}>
      {children}
    </ClassesContext.Provider>
  );
};