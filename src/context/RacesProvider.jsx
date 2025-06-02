import React, { createContext, useState, useEffect, useCallback } from 'react'; // Adicionado useCallback

export const RacesContext = createContext({ // Melhor definir um valor padrão para o contexto
  races: [],
  isLoading: true, // Adicionar estado de loading
  error: null,     // Adicionar estado de erro
  refetchRaces: () => { }
});

export const RacesProvider = ({ children }) => {
  const [races, setRaces] = useState([]); // Inicializa como ARRAY VAZIO
  const [isLoading, setIsLoading] = useState(true); // Estado de carregamento
  const [error, setError] = useState(null);       // Estado de erro

  const fetchRaces = useCallback(async () => { // Envolvido em useCallback
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/races'); // Use Axios se estiver usando em outros lugares para consistência

      if (!response.ok) {
        // Tenta pegar a mensagem de erro do corpo da resposta, se houver
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: `HTTP error! status: ${response.status}` };
        }
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // A API retorna: { status: "success", message: 200, data: [ {...}, {...} ] }
      // Onde data.data é o ARRAY de raças
      if (data && Array.isArray(data.data)) {
        setRaces(data.data);
      } else {
        console.warn("API não retornou um array em data.data:", data);
        setRaces([]); // Garante que seja um array
      }
    } catch (err) {
      console.error("Falha ao buscar as raças no provider:", err);
      setError(err.message || "Erro desconhecido ao buscar raças.");
      setRaces([]); // Define como array vazio em caso de erro
    } finally {
      setIsLoading(false);
    }
  }, []); // useCallback para estabilizar a função fetchRaces

  useEffect(() => {
    fetchRaces();
  }, [fetchRaces]); // fetchRaces é agora uma dependência estável

  return (
    <RacesContext.Provider value={{ races, isLoading, error, refetchRaces: fetchRaces }}>
      {children}
    </RacesContext.Provider>
  );
};