import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
// import axios from 'axios'; // REMOVE this direct import of global axios
import { AuthContext } from './AuthProvider'; // Correct path assumed

export const RacesContext = createContext({
  races: [],
  isLoading: true,
  error: null,
  refetchRaces: () => Promise.resolve(),
});

export const RacesProvider = ({ children }) => {
  const [races, setRaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Loading específico deste provider
  const [error, setError] = useState(null);

  // Consome o AuthContext para saber sobre o estado de autenticação e obter axiosInstance
  const { token, loading: authLoading, isAuthenticated, axiosInstance } = useContext(AuthContext);

  // const API_BASE_URL = '/api'; // This variable is now redundant if axiosInstance.baseURL is '/api'

  const fetchRaces = useCallback(async () => {
    if (authLoading) {
      console.log('[RacesProvider] Autenticação ainda carregando, aguardando para buscar raças.');
      setIsLoading(true);
      return;
    }

    if (!isAuthenticated) {
      setError('Autenticação necessária para buscar raças.');
      setRaces([]);
      setIsLoading(false);
      return;
    }

    // IMPORTANT: Ensure axiosInstance is available before using it
    if (!axiosInstance) {
      console.warn('[RacesProvider] axiosInstance não disponível no AuthContext.');
      setError('Serviço de autenticação não inicializado corretamente.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      // Use axiosInstance instead of global axios
      const response = await axiosInstance.get('/races'); // Use relative path if axiosInstance has baseURL '/api'

      let racesArray = [];
      if (response.data && Array.isArray(response.data.data)) {
        racesArray = response.data.data;
      } else if (Array.isArray(response.data)) {
        racesArray = response.data;
      } else {
        console.warn("API /api/races não retornou um array esperado:", response.data);
      }
      setRaces(racesArray);

    } catch (err) {
      console.error("[RacesProvider] Falha ao buscar as raças:", err);
      const errorMessage = err.response?.data?.message || err.message || "Erro desconhecido ao buscar raças.";
      setError(errorMessage);
      setRaces([]);
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, axiosInstance]); // Add axiosInstance to dependencies

  useEffect(() => {
    // Only fetch if auth is not loading AND axiosInstance is ready
    if (!authLoading && axiosInstance) { // Check for axiosInstance here too
      fetchRaces();
    }
  }, [authLoading, fetchRaces, axiosInstance]); // Include axiosInstance as a dependency

  return (
    <RacesContext.Provider value={{ races, isLoading, error, refetchRaces: fetchRaces }}>
      {children}
    </RacesContext.Provider>
  );
};

export default RacesProvider;