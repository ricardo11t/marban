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
    // Só tenta buscar se a autenticação não estiver mais no estado de 'loading' inicial
    // E, se a rota for protegida, só se estiver autenticado (ou se o token estiver presente)
    if (authLoading) {
      console.log('[RacesProvider] Autenticação ainda carregando, aguardando para buscar raças.');
      // Você pode optar por não fazer nada ou manter o estado de loading deste provider como true
      setIsLoading(true);
      return;
    }

    // Para rotas que PRECISAM de autenticação, adicione:
    // if (!isAuthenticated) {
    //   console.log('[RacesProvider] Usuário não autenticado, não buscará raças protegidas.');
    //   setIsLoading(false);
    //   setRaces([]); // Limpa as raças se não estiver autenticado
    //   return;
    // }

    console.log('[RacesProvider] Tentando buscar raças. AuthHeader do Axios:', axios.defaults.headers.common['Authorization']);
    setIsLoading(true);
    setError(null);
    try {
      // O header de autorização já deve estar configurado globalmente pelo AuthProvider se o token existir
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
  }, [authLoading, isAuthenticated, token]); // Adicionado token e isAuthenticated como dependências para re-fetch se mudarem

  useEffect(() => {
    // A busca só é disparada quando authLoading se torna false
    if (!authLoading) {
      fetchRaces();
    }
  }, [authLoading, fetchRaces]); // fetchRaces é dependência do useCallback

  return (
    <RacesContext.Provider value={{ races, isLoading, error, refetchRaces: fetchRaces }}>
      {children}
    </RacesContext.Provider>
  );
};