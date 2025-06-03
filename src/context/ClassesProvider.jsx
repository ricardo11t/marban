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
      setIsLoading(true); // Mantém o loading do ClassesProvider ativo
      return;
    }

    // Mesmo que authLoading seja false, o token pode ainda não ter sido definido no Axios
    // se a atualização de estado do token no AuthProvider ainda não propagou completamente
    // ou se o usuário não estiver logado.

    // Se a rota /api/classes SEMPRE requer autenticação:
    if (!isAuthenticated) { // Verifica o isAuthenticated do AuthContext
      console.log('[ClassesProvider] Usuário não autenticado (de acordo com AuthContext). Não buscará classes.');
      setError('Autenticação necessária para buscar classes.');
      setClasses([]);
      setIsLoading(false);
      return;
    }

    // Neste ponto, authLoading é false E isAuthenticated é true.
    // O header do Axios DEVERIA estar configurado.
    console.log('[ClassesProvider] Axios default Authorization header ANTES da chamada:', axios.defaults.headers.common['Authorization']);

    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/classes`);
      // ... (resto da lógica de sucesso)
      let classesArray = response.data?.data || response.data || [];
      if (!Array.isArray(classesArray)) classesArray = []; // Garante que é um array
      setClasses(classesArray);

    } catch (err) {
      console.error("[ClassesProvider] Falha ao buscar as classes:", err);
      // O erro "Token de autenticação não fornecido..." viria aqui se o backend o retornasse
      const errorMessage = err.response?.data?.message || err.message || "Erro desconhecido ao buscar classes.";
      setError(errorMessage);
      setClasses([]);
    } finally {
      setIsLoading(false);
    }
  }, [authLoading, isAuthenticated, token]); // Adicionado token aqui também, para re-fetch se o token mudar

  useEffect(() => {
    // Só busca se authLoading for false.
    // Se a rota é protegida, a verificação de isAuthenticated dentro de fetchClasses cuidará disso.
    if (!authLoading) {
      fetchClasses();
    }
  }, [authLoading, fetchClasses]); // fetchClasses é dependência do useCallback

  return (
    <ClassesContext.Provider value={{ classes, isLoading, error, refetchClasses: fetchClasses }}>
      {children}
    </ClassesContext.Provider>
  );
};