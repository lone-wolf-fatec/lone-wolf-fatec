import React, { createContext, useState, useContext, useEffect } from 'react';
// Padronize assim em todos os arquivos
const FUNCIONARIOS_KEY = 'sistema_funcionarios';

// Criando o contexto de usuário
export const UserContext = createContext();

// Criando o provider do contexto
export const UserProvider = ({ children }) => {
  // Estado para armazenar dados do usuário
  const [userData, setUserData] = useState(() => {
    // Inicializar com dados do localStorage, se disponíveis
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  // Estado para a lista de funcionários
  const [funcionarios, setFuncionarios] = useState(() => {
    const storedFuncionarios = localStorage.getItem('funcionarios');
    return storedFuncionarios ? JSON.parse(storedFuncionarios) : [
      { id: 101, nome: 'João Silva' },
      { id: 102, nome: 'Maria Oliveira' },
      { id: 103, nome: 'Carlos Pereira' },
      { id: 104, nome: 'Ana Souza' },
      { id: 105, nome: 'Pedro Santos' }
    ];
  });
  
  // Estado para forçar atualizações de componentes que dependem dos funcionários
  const [updateCounter, setUpdateCounter] = useState(0);

  // Atualizar o localStorage quando userData mudar
  useEffect(() => {
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    }
  }, [userData]);

  // Atualizar o localStorage quando a lista de funcionários mudar
  useEffect(() => {
    console.log("Funcionários atualizados no Context:", funcionarios);
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
  }, [funcionarios]);

  // Função para adicionar novo funcionário (corrigida para evitar duplicatas)
  const addFuncionario = (newFuncionario) => {
    console.log("Tentando adicionar funcionário:", newFuncionario);
    
    return new Promise((resolve) => {
      setFuncionarios(prevFuncionarios => {
        // Verificar se o funcionário já existe pelo ID
        const existsById = prevFuncionarios.some(f => f.id === newFuncionario.id);
        
        // Verificar se o nome já existe
        const existsByName = prevFuncionarios.some(f => 
          f.nome.toLowerCase() === newFuncionario.nome.toLowerCase() && f.id !== newFuncionario.id
        );
        
        // Se já existe, não modificar a lista
        if (existsById) {
          console.log("Funcionário já existe (ID):", newFuncionario.id);
          resolve(prevFuncionarios);
          return prevFuncionarios;
        }
        
        // Se o nome existir, adicionar um sufixo
        let finalNome = newFuncionario.nome;
        if (existsByName) {
          finalNome = `${newFuncionario.nome} (${prevFuncionarios.length + 1})`;
          console.log("Nome modificado para evitar duplicação:", finalNome);
        }
        
        // Criar objeto com nome potencialmente modificado
        const funcionarioToAdd = {
          ...newFuncionario,
          nome: finalNome
        };
        
        // Adicionar notificação para o admin
        const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        adminNotifications.push({
          id: Date.now(),
          type: 'novoFuncionario',
          message: `Novo funcionário registrado: ${funcionarioToAdd.nome}`,
          date: new Date().toLocaleDateString('pt-BR'),
          read: false
        });
        localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
        
        // Criar e retornar nova lista
        const updatedList = [...prevFuncionarios, funcionarioToAdd];
        
        // Atualizar localStorage imediatamente para garantir sincronização
        localStorage.setItem('funcionarios', JSON.stringify(updatedList));
        console.log("Lista atualizada de funcionários:", updatedList);
        
        // Incrementar contador para forçar atualização em componentes dependentes
        setUpdateCounter(prev => prev + 1);
        
        resolve(updatedList);
        return updatedList;
      });
    });
  };

  // Função para obter a lista atualizada de funcionários do localStorage
  const refreshFuncionarios = () => {
    console.log("Atualizando lista de funcionários...");
    const storedFuncionarios = localStorage.getItem('funcionarios');
    if (storedFuncionarios) {
      const parsedFuncionarios = JSON.parse(storedFuncionarios);
      console.log("Funcionários carregados do localStorage:", parsedFuncionarios);
      setFuncionarios(parsedFuncionarios);
      // Incrementar contador para forçar atualizações
      setUpdateCounter(prev => prev + 1);
    }
  };

  // Função para login
  const login = (user) => {
    setUserData(user);
    
    // Atualizar lista de funcionários ao fazer login
    refreshFuncionarios();
  };

  // Função para logout
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUserData(null);
  };

  // Valor do Provider com todas as funções e estados
  const contextValue = {
    userData, 
    login, 
    logout, 
    funcionarios, 
    setFuncionarios,
    addFuncionario,
    refreshFuncionarios,
    updateCounter
  };
  
  console.log("Context Provider renderizado com funcionários:", funcionarios);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado para facilitar o uso do contexto
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de um UserProvider");
  }
  return context;
};