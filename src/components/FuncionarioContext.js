import React, { createContext, useState, useEffect, useCallback } from 'react';

// Criar o contexto
export const FuncionariosContext = createContext();

export const FuncionariosProvider = ({ children }) => {
  // Estados principais
  const [funcionarios, setFuncionarios] = useState([]);
  const [horasExtras, setHorasExtras] = useState([]);
  const [ferias, setFerias] = useState([]);
  const [folgas, setFolgas] = useState([]);
  const [ausencias, setAusencias] = useState([]);
  const [jornadas, setJornadas] = useState([]);
  
  // Estado do usuário logado
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  
  // Carregar dados iniciais do localStorage
  useEffect(() => {
    // Carregar funcionários
    const storedFuncionarios = localStorage.getItem('funcionarios');
    if (storedFuncionarios) {
      try {
        setFuncionarios(JSON.parse(storedFuncionarios));
      } catch (error) {
        console.error('Erro ao carregar funcionários:', error);
        setFuncionarios([]);
      }
    }
    
    // Carregar horas extras
    const storedHorasExtras = localStorage.getItem('overtimeEntries');
    if (storedHorasExtras) {
      try {
        setHorasExtras(JSON.parse(storedHorasExtras));
      } catch (error) {
        console.error('Erro ao carregar horas extras:', error);
        setHorasExtras([]);
      }
    }
    
    // Carregar férias
    const storedFerias = localStorage.getItem('feriasEntries');
    if (storedFerias) {
      try {
        setFerias(JSON.parse(storedFerias));
      } catch (error) {
        console.error('Erro ao carregar férias:', error);
        setFerias([]);
      }
    }
    
    // Carregar folgas
    const storedFolgas = localStorage.getItem('folgaEntries');
    if (storedFolgas) {
      try {
        setFolgas(JSON.parse(storedFolgas));
      } catch (error) {
        console.error('Erro ao carregar folgas:', error);
        setFolgas([]);
      }
    }
    
    // Carregar ausências
    const storedAusencias = localStorage.getItem('ausencias');
    if (storedAusencias) {
      try {
        setAusencias(JSON.parse(storedAusencias));
      } catch (error) {
        console.error('Erro ao carregar ausências:', error);
        setAusencias([]);
      }
    }
    
    // Carregar jornadas
    const storedJornadas = localStorage.getItem('jornadas');
    if (storedJornadas) {
      try {
        setJornadas(JSON.parse(storedJornadas));
      } catch (error) {
        console.error('Erro ao carregar jornadas:', error);
        setJornadas([]);
      }
    }
    
    // Carregar usuário logado
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUsuarioLogado(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao carregar usuário logado:', error);
        setUsuarioLogado(null);
      }
    }
  }, []);
  
  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
  }, [funcionarios]);
  
  useEffect(() => {
    localStorage.setItem('overtimeEntries', JSON.stringify(horasExtras));
  }, [horasExtras]);
  
  useEffect(() => {
    localStorage.setItem('feriasEntries', JSON.stringify(ferias));
  }, [ferias]);
  
  useEffect(() => {
    localStorage.setItem('folgaEntries', JSON.stringify(folgas));
  }, [folgas]);
  
  useEffect(() => {
    localStorage.setItem('ausencias', JSON.stringify(ausencias));
  }, [ausencias]);
  
  useEffect(() => {
    localStorage.setItem('jornadas', JSON.stringify(jornadas));
  }, [jornadas]);
  
  // Funções para gerenciar funcionários
  const adicionarFuncionario = (funcionario) => {
    // Verificar se já existe um funcionário com esse ID
    const funcionarioExistente = funcionarios.find(f => parseInt(f.id) === parseInt(funcionario.id));
    
    if (funcionarioExistente) {
      // Atualizar funcionário existente
      const newFuncionarios = funcionarios.map(f => 
        parseInt(f.id) === parseInt(funcionario.id) ? { ...f, ...funcionario } : f
      );
      setFuncionarios(newFuncionarios);
    } else {
      // Adicionar novo funcionário
      setFuncionarios([...funcionarios, funcionario]);
    }
  };
  
  const obterFuncionarioPorId = useCallback((id) => {
    if (!id) return null;
    return funcionarios.find(f => parseInt(f.id) === parseInt(id)) || null;
  }, [funcionarios]);
  
  // Funções para gerenciar horas extras
  const adicionarHoraExtra = (horaExtra) => {
    // Garantir que o ID do funcionário seja número
    const novaHoraExtra = {
      ...horaExtra,
      id: horaExtra.id || Date.now(),
      funcionarioId: parseInt(horaExtra.funcionarioId)
    };
    
    setHorasExtras([novaHoraExtra, ...horasExtras]);
  };
  
  const atualizarStatusHoraExtra = (id, novoStatus, observacao = '') => {
    const newHorasExtras = horasExtras.map(item => 
      item.id === id 
        ? { ...item, status: novoStatus, observacao: observacao || item.observacao } 
        : item
    );
    setHorasExtras(newHorasExtras);
    
    // Adicionar notificação para o funcionário
    const horaExtra = horasExtras.find(he => he.id === id);
    if (horaExtra) {
      const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
      notificacoes.push({
        id: Date.now(),
        userId: horaExtra.funcionarioId,
        message: `Sua solicitação de hora extra para ${horaExtra.date} foi ${novoStatus === 'aprovado' ? 'aprovada' : 'rejeitada'}.`,
        date: new Date().toLocaleDateString('pt-BR'),
        read: false
      });
      localStorage.setItem('userNotifications', JSON.stringify(notificacoes));
    }
  };
  
  const detectarHorasExtras = () => {
    const pontoRegistros = JSON.parse(localStorage.getItem('pontoRegistros') || '[]');
    let horasExtrasDetectadas = [];
    
    pontoRegistros.forEach(registro => {
      // Verificar se já existe uma hora extra para este funcionário e dia
      const horaExtraExistente = horasExtras.find(
        he => parseInt(he.funcionarioId) === parseInt(registro.funcionarioId) && he.date === registro.data
      );
      
      if (!horaExtraExistente) {
        // Verificar se há registro de hora extra
        // Simplificação: se saiu depois das 18h, considera hora extra
        const ultimoRegistro = registro.registros[registro.registros.length - 1];
        
        if (ultimoRegistro && ultimoRegistro.hora && ultimoRegistro.hora !== '--:--') {
          const horaSaida = ultimoRegistro.hora.split(':').map(Number);
          
          // Se saiu depois das 18h
          if (horaSaida[0] >= 18) {
            const horasExtras = horaSaida[0] - 18 + (horaSaida[1] / 60);
            
            if (horasExtras > 0) {
              // Buscar nome do funcionário
              const funcionario = obterFuncionarioPorId(registro.funcionarioId);
              const funcionarioNome = funcionario ? funcionario.nome : registro.funcionarioNome || 'Funcionário';
              
              horasExtrasDetectadas.push({
                id: Date.now() + Math.random(),
                funcionarioId: parseInt(registro.funcionarioId),
                funcionarioNome: funcionarioNome,
                date: registro.data,
                hours: parseFloat(horasExtras.toFixed(1)),
                status: 'detectado',
                reason: 'Detectado automaticamente',
                auto: true
              });
            }
          }
        }
      }
    });
    
    if (horasExtrasDetectadas.length > 0) {
      setHorasExtras([...horasExtrasDetectadas, ...horasExtras]);
      return horasExtrasDetectadas.length;
    }
    
    return 0;
  };
  
  // Funções para obter dados do usuário atual
  const getHorasExtrasUsuarioAtual = useCallback(() => {
    if (!usuarioLogado || !usuarioLogado.id) return [];
    
    return horasExtras.filter(item => 
      parseInt(item.funcionarioId) === parseInt(usuarioLogado.id) && 
      (item.status === 'aprovado' || item.status === 'detectado')
    ).sort((a, b) => {
      // Ordenar por data (mais recentes primeiro)
      try {
        const [diaA, mesA, anoA] = a.date.split('/').map(Number);
        const [diaB, mesB, anoB] = b.date.split('/').map(Number);
        
        const dateA = new Date(anoA, mesA - 1, diaA);
        const dateB = new Date(anoB, mesB - 1, diaB);
        
        return dateB - dateA; // Ordem decrescente
      } catch (error) {
        return 0;
      }
    });
  }, [usuarioLogado, horasExtras]);
  
  const getFeriasUsuarioAtual = useCallback(() => {
    if (!usuarioLogado || !usuarioLogado.id) return [];
    
    return ferias.filter(item => 
      parseInt(item.funcionarioId) === parseInt(usuarioLogado.id) && 
      item.status === 'aprovado'
    );
  }, [usuarioLogado, ferias]);
  
  const getFolgasUsuarioAtual = useCallback(() => {
    if (!usuarioLogado || !usuarioLogado.id) return [];
    
    return folgas.filter(item => 
      parseInt(item.funcionarioId) === parseInt(usuarioLogado.id) && 
      item.status === 'aprovado'
    );
  }, [usuarioLogado, folgas]);
  
  const getAusenciasUsuarioAtual = useCallback(() => {
    if (!usuarioLogado || !usuarioLogado.id) return [];
    
    return ausencias.filter(item => 
      parseInt(item.employeeId) === parseInt(usuarioLogado.id) && 
      item.status === 'aprovado'
    );
  }, [usuarioLogado, ausencias]);
  
  const getJornadaUsuarioAtual = useCallback(() => {
    if (!usuarioLogado || !usuarioLogado.id) return null;
    
    return jornadas.find(item => 
      parseInt(item.employeeId) === parseInt(usuarioLogado.id)
    ) || null;
  }, [usuarioLogado, jornadas]);
  
  const getBancoHorasUsuarioAtual = useCallback(() => {
    if (!usuarioLogado || !usuarioLogado.id) return null;
    
    const funcionario = obterFuncionarioPorId(usuarioLogado.id);
    
    if (funcionario && funcionario.bancoHoras !== undefined) {
      return { 
        saldo: funcionario.bancoHoras,
        ultimaAtualizacao: new Date().toLocaleDateString('pt-BR')
      };
    }
    
    // Se não encontrar, calcular baseado nas horas extras e folgas
    const horasExtrasAprovadas = getHorasExtrasUsuarioAtual();
    const folgasAprovadas = getFolgasUsuarioAtual();
    
    const horasExtrasTotal = horasExtrasAprovadas.reduce((total, item) => total + item.hours, 0);
    const folgasHoras = folgasAprovadas
      .filter(item => item.tipo === 'banco de horas')
      .reduce((total, item) => total + (item.periodo === 'dia' ? 8 : 4), 0);
    
    const saldoEstimado = horasExtrasTotal - folgasHoras;
    
    return {
      saldo: saldoEstimado,
      ultimaAtualizacao: new Date().toLocaleDateString('pt-BR'),
      estimado: true
    };
  }, [usuarioLogado, funcionarios, getHorasExtrasUsuarioAtual, getFolgasUsuarioAtual, obterFuncionarioPorId]);
  
  // Função para login e logout
  const realizarLogin = (dados) => {
    setUsuarioLogado(dados);
    localStorage.setItem('user', JSON.stringify(dados));
  };
  
  const realizarLogout = () => {
    setUsuarioLogado(null);
    localStorage.removeItem('user');
  };
  
  // Função para obter todos os funcionários possíveis
  const getAllPossibleFuncionarios = useCallback(() => {
    try {
      // 1. Obter do registeredUsers
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const funcionariosFromUsers = registeredUsers.map(user => ({
        id: user.id,
        nome: user.name || user.nome
      }));
      
      // 2. Obter outros funcionários dos registros de horas extras
      const funcionariosFromOvertime = horasExtras.map(entry => ({
        id: entry.funcionarioId,
        nome: entry.funcionarioNome
      }));
      
      // 3. Criar um mapa para eliminar duplicatas por ID
      const funcionariosMap = new Map();
      
      // Adicionar de todas as fontes
      [
        ...funcionariosFromUsers, 
        ...funcionariosFromOvertime,
        ...funcionarios
      ].forEach(func => {
        if (func && func.id) {
          funcionariosMap.set(parseInt(func.id), func);
        }
      });
      
      // Converter de volta para array
      return Array.from(funcionariosMap.values());
    } catch (error) {
      console.error('Erro ao obter funcionários de todas as fontes:', error);
      return [];
    }
  }, [funcionarios, horasExtras]);
  
  // Formatação de data para padronização (YYYY-MM-DD para DD/MM/YYYY)
  const formatarData = (dataStr) => {
    if (!dataStr) return '';
    
    try {
      if (dataStr.includes('/')) return dataStr; // Já está formatado
      
      const data = new Date(dataStr);
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = String(data.getMonth() + 1).padStart(2, '0');
      const ano = data.getFullYear();
      
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dataStr;
    }
  };
  
  // Valores expostos pelo contexto
  const value = {
    // Dados
    funcionarios,
    horasExtras,
    ferias,
    folgas,
    ausencias,
    jornadas,
    usuarioLogado,
    
    // Funções de gerenciamento de funcionários
    adicionarFuncionario,
    obterFuncionarioPorId,
    getAllPossibleFuncionarios,
    
    // Funções de gerenciamento de horas extras
    adicionarHoraExtra,
    atualizarStatusHoraExtra,
    detectarHorasExtras,
    
    // Funções para obter dados do usuário atual
    getHorasExtrasUsuarioAtual,
    getFeriasUsuarioAtual,
    getFolgasUsuarioAtual,
    getAusenciasUsuarioAtual,
    getJornadaUsuarioAtual,
    getBancoHorasUsuarioAtual,
    
    // Funções de autenticação
    realizarLogin,
    realizarLogout,
    
    // Funções utilitárias
    formatarData
  };
  
  return (
    <FuncionariosContext.Provider value={value}>
      {children}
    </FuncionariosContext.Provider>
  );
};

export default FuncionarioContext;