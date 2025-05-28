import React, { createContext, useState, useEffect } from 'react';

export const ClassesContext = createContext();

export const ClassesProvider = ({ children }) => {
  const [classes, setClasses] = useState({});

  const fetchClasses = async () => {
    try {
      // ANTES: const response = await fetch('http://localhost:3000/classes');
      // DEPOIS:
      const response = await fetch('/api/classes'); // <<< CORREÇÃO APLICADA AQUI

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error("Falha ao buscar as classes no provider:", error);
      setClasses({});
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Renomeei para refetchClasses para consistência.
  // Lembre-se de usar { classes, refetchClasses } no seu componente Classes.js
  return (
    <ClassesContext.Provider value={{ classes, refetchClasses: fetchClasses }}>
      {children}
    </ClassesContext.Provider>
  );
};