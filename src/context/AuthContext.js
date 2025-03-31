import React, { createContext, useState, useEffect, useContext } from 'react';

// Criando o contexto de autenticação
const AuthContext = createContext();

// Hook personalizado para usar o contexto
export const useAuth = () => {
  return useContext(AuthContext);
};

// Provedor do contexto de autenticação
export const AuthProvider = ({ children }) => {
  // Estado para armazenar os dados do usuário
  const [user, setUser] = useState(null);
  // Estado para armazenar todos os funcionários registrados
  const [allUsers, setAllUsers] = useState([]);
  // Estado para verificar se está carregando
  const [loading, setLoading] = useState(true);

  // Efeito para carregar os dados do usuário do localStorage
  useEffect(() => {
    const loadUserData = () => {
      try {
        // Carrega o usuário atual
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Carrega todos os usuários registrados
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Formata os usuários para serem usados nos seletores
        const formattedUsers = registeredUsers.map(user => ({
          id: user.id,
          nome: user.name
        }));
        
        // Atualiza os estados
        setUser(userData);
        setAllUsers(formattedUsers);
      } catch (error) {
        console.error('Erro ao carregar dados de usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  // Função para fazer login
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Função para fazer registro
  const register = (userData) => {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Adiciona novo usuário
    const newUser = {
      ...userData,
      id: registeredUsers.length + 1,
      createdAt: new Date().toISOString()
    };
    
    // Atualiza lista de usuários
    const updatedUsers = [...registeredUsers, newUser];
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    // Atualiza a lista de todos os usuários no estado
    setAllUsers([...allUsers, { id: newUser.id, nome: newUser.name }]);
    
    return newUser;
  };

  // Função para fazer logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Valor a ser disponibilizado pelo contexto
  const value = {
    user,
    allUsers,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;