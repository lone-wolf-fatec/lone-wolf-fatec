import React, { createContext, useState, useContext, useEffect } from 'react';
import FuncionariosService from './FuncionariosService';
import JornadasService from './JornadasService';
import PontoService from './PontoService';

// Criar o contexto da aplicação
const AppContext = createContext();

// Hook personalizado para usar o contexto
export const useAppContext = () => useContext(AppContext);

// Provedor do contexto
export const AppProvider = ({ children }) => {
  // Estados
  const [jornadas, setJornadas] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionariosPorJornada, setFuncionariosPorJornada] = useState({});
  const [registrosPonto, setRegistrosPonto] = useState([]);
  const [carregando, setCarregando] = useState(true);
  
  // Carregar dados ao iniciar
  useEffect(() => {
    const carregarDados = () => {
      try {
        const jornadasData = JornadasService.getTodasJornadas();
        const funcionariosData = FuncionariosService.getTodosFuncionarios();
        const funcionariosPorJornadaData = FuncionariosService.getFuncionariosPorJornada();
        const registrosPontoData = PontoService.getTodosRegistros();
        
        setJornadas(jornadasData);
        setFuncionarios(funcionariosData);
        setFuncionariosPorJornada(funcionariosPorJornadaData);
        setRegistrosPonto(registrosPontoData);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setCarregando(false);
      }
    };
    
    carregarDados();
  }, []);
  
  // Função para atualizar jornadas
  const atualizarJornadas = () => {
    const jornadasData = JornadasService.getTodasJornadas();
    setJornadas(jornadasData);
  };
  
  // Função para atualizar funcionários
  const atualizarFuncionarios = () => {
    const funcionariosData = FuncionariosService.getTodosFuncionarios();
    setFuncionarios(funcionariosData);
  };
  
  // Função para atualizar funcionários por jornada
  const atualizarFuncionariosPorJornada = () => {
    const funcionariosPorJornadaData = FuncionariosService.getFuncionariosPorJornada();
    setFuncionariosPorJornada(funcionariosPorJornadaData);
  };
  
  // Função para atualizar registros de ponto
  const atualizarRegistrosPonto = () => {
    const registrosPontoData = PontoService.getTodosRegistros();
    setRegistrosPonto(registrosPontoData);
  };
  
  // Criar nova jornada
  const criarJornada = (jornada) => {
    JornadasService.criarJornada(jornada);
    atualizarJornadas();
  };
  
  // Atualizar jornada existente
  const atualizarJornada = (jornada) => {
    JornadasService.atualizarJornada(jornada);
    atualizarJornadas();
  };
  
  // Excluir jornada
  const excluirJornada = (jornadaId) => {
    JornadasService.excluirJornada(jornadaId);
    atualizarJornadas();
  };
  
  // Alternar status da jornada
  const alternarStatusJornada = (jornadaId) => {
    JornadasService.alternarStatusJornada(jornadaId);
    atualizarJornadas();
  };
  
  // Adicionar funcionário à jornada
  const adicionarFuncionarioJornada = (jornadaId, funcionarioNome) => {
    FuncionariosService.adicionarFuncionarioJornada(jornadaId, funcionarioNome);
    atualizarFuncionariosPorJornada();
  };
  
  // Remover funcionário da jornada
  const removerFuncionarioJornada = (jornadaId, funcionarioNome) => {
    FuncionariosService.removerFuncionarioJornada(jornadaId, funcionarioNome);
    atualizarFuncionariosPorJornada();
  };
  
  // Registrar ponto
  const registrarPonto = (funcionarioId, tipo) => {
    const novoPonto = PontoService.registrarPonto(funcionarioId, tipo);
    atualizarRegistrosPonto();
    return novoPonto;
  };
  
  // Valor do contexto
  const contextValue = {
    // Estados
    jornadas,
    funcionarios,
    funcionariosPorJornada,
    registrosPonto,
    carregando,
    
    // Funções
    atualizarJornadas,
    atualizarFuncionarios,
    atualizarFuncionariosPorJornada,
    atualizarRegistrosPonto,
    
    criarJornada,
    atualizarJornada,
    excluirJornada,
    alternarStatusJornada,
    
    adicionarFuncionarioJornada,
    removerFuncionarioJornada,
    
    registrarPonto
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;