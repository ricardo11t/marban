import React, { createContext, useState, useEffect, useCallback, useContext } from 'react'; // Adicionado useContext
import axios from 'axios';
import { AuthContext } from './AuthProvider'; // Importe o AuthContext

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

  // Consome o AuthContext para saber sobre o estado de autenticação
  const { token, loading: authLoading, isAuthenticated } = useContext(AuthContext);

  const API_BASE_URL = '/api';

  const fetchRaces = useCallback(async () => {
    if (authLoading) {
      console.log('[RacesProvider] Autenticação ainda carregando, aguardando para buscar raças.');
      setIsLoading(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/races`);

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
  }, [authLoading, isAuthenticated, token]);

  useEffect(() => {
    if (!authLoading) {
      fetchRaces();
    }
  }, [authLoading, fetchRaces]);

  return (
    <RacesContext.Provider value={{ races, isLoading, error, refetchRaces: fetchRaces }}>
      {children}
    </RacesContext.Provider>
  );
};