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

  const { token, loading: authLoading, isAuthenticated } = useContext(AuthContext);

  const API_BASE_URL = '/api';

  const fetchClasses = useCallback(async () => {
    if (authLoading) {
      console.log('[ClassesProvider] Autenticação (AuthProvider) ainda carregando. Aguardando para buscar classes.');
      setIsLoading(true);
      return;
    }

    // Adicione estes logs para diagnóstico:
    const currentTokenFromLocalStorage = localStorage.getItem('authToken');
    const currentTokenFromAuthContext = token;
    const currentAxiosAuthHeader = axios.defaults.headers.common['Authorization'];

    console.log('-----------------------------------------------------');
    console.log('[ClassesProvider] Iniciando fetchClasses...');
    console.log('[ClassesProvider] authLoading:', authLoading);
    console.log('[ClassesProvider] isAuthenticated (do AuthContext):', isAuthenticated);
    console.log('[ClassesProvider] Token do localStorage:', currentTokenFromLocalStorage);
    console.log('[ClassesProvider] Token do AuthContext:', currentTokenFromAuthContext);
    console.log('[ClassesProvider] Axios default Authorization header ATUAL:', currentAxiosAuthHeader);
    console.log('-----------------------------------------------------');

    // Se a rota /api/classes é protegida, você idealmente só faria o fetch se isAuthenticated for true
    // if (!isAuthenticated) {
    //   console.log('[ClassesProvider] Usuário não autenticado, não buscará classes.');
    //   setIsLoading(false);
    //   setClasses([]);
    //   setError("Usuário não autenticado para buscar classes."); // Define um erro local
    //   return;
    // }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/classes`);

      let classesArray = [];
      if (response.data && Array.isArray(response.data.data)) {
        classesArray = response.data.data;
      } else if (Array.isArray(response.data)) {
        classesArray = response.data;
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
  }, [authLoading, isAuthenticated, token]); // Adicionei 'token' e 'isAuthenticated' como dependências

  useEffect(() => {
    if (!authLoading) { // Só chama fetchClasses quando authLoading for false
      fetchClasses();
    }
  }, [authLoading, fetchClasses]);

  return (
    <ClassesContext.Provider value={{ classes, isLoading, error, refetchClasses: fetchClasses }}>
      {children}
    </ClassesContext.Provider>
  );
};