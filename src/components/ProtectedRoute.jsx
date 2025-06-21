import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider'; // Ajuste o caminho

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useContext(AuthContext);

    if (loading) {
        // Pode mostrar um spinner ou uma tela de carregamento enquanto verifica a autenticação
        return <div>Verificando autenticação...</div>;
    }

    if (!isAuthenticated) {
        // Se não estiver autenticado e o carregamento terminou, redireciona para o login
        return <Navigate to="/login" replace />;
    }

    // Se estiver autenticado, renderiza o componente filho da rota (a página protegida)
    return <Outlet />;
};

export default ProtectedRoute;