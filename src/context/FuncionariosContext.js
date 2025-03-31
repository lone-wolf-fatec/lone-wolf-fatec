import React, { createContext, useState, useEffect, useContext } from 'react';

// Criar o Context
const FuncionariosContext = createContext();

// Hook personalizado para acessar o Context
export const useFuncionarios = () => useContext(FuncionariosContext);

export const FuncionariosProvider = ({ children }) => {
  // Estado para armazenar a lista de funcionários
  const [funcionarios, setFuncionarios] = useState([]);
  
  // Carregar funcionários ao iniciar
  useEffect(() => {
    carregarFuncionarios();
    
    // Adicionar listener para mudanças no localStorage de registeredUsers
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Função para lidar com mudanças no localStorage
  const handleStorageChange = (e) => {
    if (e.key === 'registeredUsers') {
      carregarFuncionarios();
    }
  };
  
  // Função para carregar funcionários do localStorage
  const carregarFuncionarios = () => {
    try {
      // Primeiro verifica se já existe uma lista de funcionários no localStorage
      const storedFuncionarios = localStorage.getItem('funcionarios');
      let listaFuncionarios = [];
      
      if (storedFuncionarios) {
        listaFuncionarios = JSON.parse(storedFuncionarios);
      }
      
      // Depois busca os usuários registrados
      const registeredUsers = localStorage.getItem('registeredUsers');
      
      if (registeredUsers) {
        const users = JSON.parse(registeredUsers);
        
        // Para cada usuário registrado, verifica se já existe na lista de funcionários
        users.forEach(user => {
          const funcionarioExiste = listaFuncionarios.some(func => func.id === user.id);
          
          if (!funcionarioExiste) {
            // Adiciona o novo usuário à lista de funcionários
            listaFuncionarios.push({
              id: user.id,
              nome: user.name
            });
          }
        });
      }
      
      // Se não houver dados, usa uma lista padrão
      if (listaFuncionarios.length === 0) {
        listaFuncionarios = [
          { id: 101, nome: 'João Silva' },
          { id: 102, nome: 'Maria Oliveira' },
          { id: 103, nome: 'Carlos Pereira' },
          { id: 104, nome: 'Ana Souza' },
          { id: 105, nome: 'Pedro Santos' }
        ];
      }
      
      // Atualiza o estado e salva no localStorage
      setFuncionarios(listaFuncionarios);
      localStorage.setItem('funcionarios', JSON.stringify(listaFuncionarios));
    } catch (error) {
      console.error('Erro ao carregar funcionários:', error);
      // Em caso de erro, carrega a lista padrão
      const listaDefault = [
        { id: 101, nome: 'João Silva' },
        { id: 102, nome: 'Maria Oliveira' },
        { id: 103, nome: 'Carlos Pereira' },
        { id: 104, nome: 'Ana Souza' },
        { id: 105, nome: 'Pedro Santos' }
      ];
      setFuncionarios(listaDefault);
    }
  };
  
  // Função para adicionar um novo funcionário
  const adicionarFuncionario = (novoFuncionario) => {
    // Verifica se o funcionário já existe
    const funcionarioExiste = funcionarios.some(func => func.id === novoFuncionario.id);
    
    if (!funcionarioExiste) {
      const novaLista = [...funcionarios, novoFuncionario];
      setFuncionarios(novaLista);
      localStorage.setItem('funcionarios', JSON.stringify(novaLista));
    }
  };
  
  // Função para adicionar um funcionário a partir do registro de usuário
  const adicionarFuncionarioFromUser = (user) => {
    if (!user || !user.id || !user.name) return;
    
    adicionarFuncionario({
      id: user.id,
      nome: user.name
    });
  };
  
  // Função para atualizar um funcionário
  const atualizarFuncionario = (id, dadosAtualizados) => {
    const funcionarioIndex = funcionarios.findIndex(func => func.id === id);
    
    if (funcionarioIndex !== -1) {
      const novaLista = [...funcionarios];
      novaLista[funcionarioIndex] = { ...novaLista[funcionarioIndex], ...dadosAtualizados };
      
      setFuncionarios(novaLista);
      localStorage.setItem('funcionarios', JSON.stringify(novaLista));
    }
  };
  
  // Função para sincronizar com usuários registrados
  const sincronizarUsuariosRegistrados = () => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      let atualizou = false;
      
      registeredUsers.forEach(user => {
        const funcionarioExiste = funcionarios.some(func => func.id === user.id);
        
        if (!funcionarioExiste) {
          adicionarFuncionarioFromUser(user);
          atualizou = true;
        }
      });
      
      if (atualizou) {
        console.log('Funcionários sincronizados com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao sincronizar funcionários:', error);
    }
  };
  
  // Objeto de valor para o Provider
  const contextValue = {
    funcionarios,
    adicionarFuncionario,
    adicionarFuncionarioFromUser,
    atualizarFuncionario,
    sincronizarUsuariosRegistrados,
    carregarFuncionarios
  };
  
  return (
    <FuncionariosContext.Provider value={contextValue}>
      {children}
    </FuncionariosContext.Provider>
  );
};