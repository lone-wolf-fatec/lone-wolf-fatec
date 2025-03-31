import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const location = useLocation();
  const [isAuthorized, setIsAuthorized] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticação e autorização
    const checkAuth = () => {
      try {
        // Buscar dados do usuário do localStorage
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Verificar se o usuário está autenticado
        if (!userData.authenticated) {
          setIsAuthorized(false);
          return;
        }
        
        // Se não há papel específico requerido, apenas autenticação é suficiente
        if (!requiredRole) {
          setIsAuthorized(true);
          return;
        }
        
        // Verificar se o usuário tem o papel necessário
        const hasRequiredRole = userData.roles && 
          userData.roles.includes(requiredRole);
        
        setIsAuthorized(hasRequiredRole);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setIsAuthorized(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [requiredRole]);
  
  // Exibir loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-black">
        <div className="text-center text-white">
          <svg className="animate-spin h-10 w-10 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p>Verificando permissões...</p>
        </div>
      </div>
    );
  }
  
  // Redirecionar para login se não estiver autorizado
  if (!isAuthorized) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Renderizar componente filho se estiver autorizado
  return children;
};

export default ProtectedRoute;