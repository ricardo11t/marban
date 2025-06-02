import React, { createContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios'; // Usando axios para consistência, se você o usa em outros providers

// Define um valor padrão mais completo para o contexto, útil para autocompletar e testes
export const RacesContext = createContext({
  races: [],
  isLoading: true,
  error: null,
  refetchRaces: () => Promise.resolve(), // Função no-op que retorna uma promise resolvida
  // Você pode adicionar outras funções que o provider exporá aqui, como createRace, updateRace, deleteRace
  // se quiser centralizar todas as chamadas de API relacionadas a raças no provider.
  // Por enquanto, manteremos apenas o fetch e refetch.
});

export const RacesProvider = ({ children }) => {
  const [races, setRaces] = useState([]); // Inicializa como ARRAY VAZIO
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = '/api'; // Ou sua URL completa da Vercel se necessário

  const fetchRaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/races`);
      // A API retorna: { status: "success", message: 200, data: [ {...}, {...} ] }
      // ou diretamente o array, ou um objeto com uma chave 'data' contendo o array.
      // Ajuste conforme a resposta real da sua API de GET /api/races

      let racesArray = [];
      if (response.data && Array.isArray(response.data.data)) { // Se a resposta for { ..., data: [...] }
        racesArray = response.data.data;
      } else if (Array.isArray(response.data)) { // Se a resposta for diretamente o array [...]
        racesArray = response.data;
      } else {
        console.warn("API /api/races não retornou um array esperado:", response.data);
      }
      setRaces(racesArray);

    } catch (err) {
      console.error("Falha ao buscar as raças no provider:", err);
      const errorMessage = err.response?.data?.message || err.message || "Erro desconhecido ao buscar raças.";
      setError(errorMessage);
      setRaces([]); // Define como array vazio em caso de erro
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback para estabilizar a função fetchRaces

  useEffect(() => {
    fetchRaces();
  }, [fetchRaces]); // fetchRaces é agora uma dependência estável

  // Funções para CRUD podem ser adicionadas aqui e expostas no contexto
  // Ex: const createRaceOnServer = async (raceData) => { ... }

  return (
    <RacesContext.Provider value={{ races, isLoading, error, refetchRaces: fetchRaces }}>
      {children}
    </RacesContext.Provider>
  );
};