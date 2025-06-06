import React, { createContext, useState, useEffect } from 'react';

export const RacesContext = createContext();

export const RacesProvider = ({ children }) => {
  const [races, setRaces] = useState({});

  // Esta é a função que precisa ser corrigida
  const fetchRaces = async () => {
    try {
      // ANTES: const response = await fetch('http://localhost:3000/racas');
      // DEPOIS:
      const response = await fetch('/api/races'); // <<< CORREÇÃO APLICADA AQUI

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setRaces(data);
    } catch (error) {
      console.error("Falha ao buscar as raças no provider:", error);
      setRaces({}); // Define como objeto vazio em caso de erro
    }
  };

  useEffect(() => {
    fetchRaces();
  }, []);

  // A função de refetch (fetchRaces) já estará corrigida.
  return (
    <RacesContext.Provider value={{ races, refetchRaces: fetchRaces }}>
      {children}
    </RacesContext.Provider>
  );
};