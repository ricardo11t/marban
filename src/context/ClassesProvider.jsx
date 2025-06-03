import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from './AuthProvider';
import axios from 'axios';

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

  const { token, loading: authLoading, isAuthenticated } = useContext(AuthContext);

  const API_BASE_URL = '/api';

  const fetchClasses = useCallback(async () => {
    if (authLoading) {
      console.log('[ClassesProvider] Autenticação ainda carregando, aguardando para buscar classes');
      setIsLoading(true);
      return;
    }

    console.log('[ClassesProvider] Tentando buscar classes. AuthHeader do Axios:', axios.defaults.headers.common['Authorization']);
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/classes`);
      let classesArray = [];
      if (response.data && Array.isArray(response.data.data)) {
        classesArray = response.data.data;
      } else if (Array.isArray(response.data)) {
        classesArray = response.data;
      } else {
        console.warn('API /api/classes não retornou um array esperado:', response.data)
      }
      setClasses(classesArray);
    } catch (err) {
      console.error("[ClassesProvider] Falha ao buscar as classes:", err);
      const errorMessage = err.response?.data?.message || err.message || "Erro desconhecido ao buscar classes.";
      setError(errorMessage);
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, token])

  useEffect(() => {
    if (!authLoading) {
      fetchClasses();
    }

  }, [authLoading, fetchClasses]);

  // Renomeei para refetchClasses para consistência.
  // Lembre-se de usar { classes, refetchClasses } no seu componente Classes.js
  return (
    <ClassesContext.Provider value={{ classes, isLoading, error, refetchClasses: fetchClasses }}>
      {children}
    </ClassesContext.Provider>
  );
};