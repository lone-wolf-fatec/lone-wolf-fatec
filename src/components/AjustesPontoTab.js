import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext'; // Importando o hook do contexto
import { useNavigate } from 'react-router-dom';

// Constante para a chave do localStorage
const FUNCIONARIOS_KEY = 'funcionarios';

const AjustesPontoTab = () => {
  // Usando o contexto para obter a lista de funcionários e dados do usuário
  const { userData, funcionarios, refreshFuncionarios, updateCounter } = useUser();
  const navigate = useNavigate();
  
  // Estado local para funcionários (backup caso o Context falhe)
  const [localFuncionarios, setLocalFuncionarios] = useState([]);
  
  // Estado para as solicitações de ajuste
  const [solicitacoes, setSolicitacoes] = useState(() => {
    const storedSolicitacoes = localStorage.getItem('ajustePontoSolicitacoes');
    return storedSolicitacoes ? JSON.parse(storedSolicitacoes) : [
      { 
        id: 1, 
        funcionarioId: 102, 
        funcionarioNome: 'Maria Oliveira', 
        data: '19/03/2025', 
        tipoRegistro: 'entrada',
        horaOriginal: '08:15',
        horaCorreta: '08:00',
        motivo: 'Problema no sistema de ponto',
        status: 'pendente',
        dataSolicitacao: '19/03/2025'
      },
      { 
        id: 2, 
        funcionarioId: 103, 
        funcionarioNome: 'Carlos Pereira', 
        data: '18/03/2025', 
        tipoRegistro: 'saída',
        horaOriginal: '17:45',
        horaCorreta: '18:30',
        motivo: 'Reunião que se estendeu além do horário',
        status: 'pendente',
        dataSolicitacao: '18/03/2025'
      },
      { 
        id: 3, 
        funcionarioId: 104, 
        funcionarioNome: 'Ana Souza', 
        data: '17/03/2025', 
        tipoRegistro: 'entrada',
        horaOriginal: '--:--',
        horaCorreta: '08:05',
        motivo: 'Esqueci de registrar o ponto na entrada',
        status: 'aprovado',
        dataSolicitacao: '17/03/2025',
        dataDecisao: '18/03/2025'
      },
      { 
        id: 4, 
        funcionarioId: 101, 
        funcionarioNome: 'João Silva', 
        data: '15/03/2025', 
        tipoRegistro: 'saída',
        horaOriginal: '16:30',
        horaCorreta: '17:00',
        motivo: 'Ajuste incorreto de ponto',
        status: 'rejeitado',
        dataSolicitacao: '15/03/2025',
        dataDecisao: '16/03/2025',
        observacao: 'Sem evidências que comprovem o horário correto'
      }
    ];
  });
  
  // Estado para novas solicitações de ajuste manual
  const [novaSolicitacao, setNovaSolicitacao] = useState({
    funcionarioId: '',
    funcionarioNome: '',
    data: '',
    tipoRegistro: 'entrada',
    horaOriginal: '',
    horaCorreta: '',
    motivo: ''
  });
  
  // Estado para o modal de observações ao rejeitar
  const [modalRejeitarAberto, setModalRejeitarAberto] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [observacaoRejeicao, setObservacaoRejeicao] = useState('');
  
  // Estado para filtros
  const [filtros, setFiltros] = useState({
    status: '',
    funcionario: '',
    periodo: ''
  });

  // INÍCIO DAS NOVAS CORREÇÕES =========================================
  
  // Função para obter todos os funcionários possíveis de todas as fontes
  const getAllPossibleFuncionarios = () => {
    try {
      // 1. Obter do registeredUsers
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const funcionariosFromUsers = registeredUsers.map(user => ({
        id: user.id,
        nome: user.name || user.nome
      }));
      
      // 2. Obter do localStorage "funcionarios"
      const storedFuncionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
      
      // 3. Obter do Context
      const contextFuncionarios = funcionarios || [];
      
      // 4. Obter do localFuncionarios
      const localFuncs = localFuncionarios || [];
      
      // 5. Criar um mapa para eliminar duplicatas por ID
      const funcionariosMap = new Map();
      
      // Adicionar de todas as fontes
      [
        ...funcionariosFromUsers, 
        ...storedFuncionarios, 
        ...contextFuncionarios, 
        ...localFuncs
      ].forEach(func => {
        if (func && func.id) {
          funcionariosMap.set(func.id, func);
        }
      });
      
      // Converter de volta para array
      return Array.from(funcionariosMap.values());
    } catch (error) {
      console.error('Erro ao obter funcionários de todas as fontes:', error);
      return [];
    }
  };

  // Estado para armazenar essa lista consolidada
  const [allFuncionarios, setAllFuncionarios] = useState([]);

  // useEffect para manter a lista atualizada
  useEffect(() => {
    const updateAllFuncionarios = () => {
      const allPossible = getAllPossibleFuncionarios();
      setAllFuncionarios(allPossible);
      console.log('Lista completa de funcionários atualizada:', allPossible);
    };
    
    // Atualizar logo no início
    updateAllFuncionarios();
    
    // E a cada 2 segundos
    const interval = setInterval(updateAllFuncionarios, 2000);
    
    return () => clearInterval(interval);
  }, [funcionarios, localFuncionarios]);
  
  // Função atualizada para selecionar funcionário
  const handleSelecionarFuncionario = (e) => {
    const funcionarioId = parseInt(e.target.value);
    if (funcionarioId) {
      // Procurar em allFuncionarios em vez de mergedFuncionarios
      const funcionarioSelecionado = allFuncionarios.find(f => f.id === funcionarioId);
      if (funcionarioSelecionado) {
        console.log("Funcionário selecionado:", funcionarioSelecionado);
        setNovaSolicitacao({
          ...novaSolicitacao,
          funcionarioId: funcionarioId,
          funcionarioNome: funcionarioSelecionado.nome
        });
      } else {
        console.warn("Funcionário não encontrado para ID:", funcionarioId);
      }
    } else {
      setNovaSolicitacao({
        ...novaSolicitacao,
        funcionarioId: '',
        funcionarioNome: ''
      });
    }
  };
  
  // FIM DAS NOVAS CORREÇÕES ===========================================
  
  // Verificação de autenticação e permissão
  useEffect(() => {
    // Se não estiver autenticado, redireciona para login
    if (!userData || !userData.authenticated) {
      navigate('/login');
      return;
    }
    
    // Se não for admin, redireciona para dashboard
    if (!userData.roles || !userData.roles.includes('ADMIN')) {
      navigate('/dashboard');
      return;
    }
    
    // Atualiza a lista de funcionários
    refreshFuncionarios();
    
    // Debug: verificar funcionários no Context
    console.log("AjustesPontoTab - Lista de funcionários do Context:", funcionarios);
  }, [userData, navigate, refreshFuncionarios]);
  
  // SOLUÇÃO 3: Obter dados diretamente do localStorage e sincronizar com o estado
  useEffect(() => {
    const getFuncionariosFromLocalStorage = () => {
      try {
        const stored = localStorage.getItem(FUNCIONARIOS_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (error) {
        console.error("Erro ao ler funcionários do localStorage:", error);
        return [];
      }
    };
    
    setLocalFuncionarios(getFuncionariosFromLocalStorage());
    
    // Atualizar a cada 5 segundos
    const interval = setInterval(() => {
      setLocalFuncionarios(getFuncionariosFromLocalStorage());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // SOLUÇÃO 4: Adicionar evento de armazenamento para sincronização entre abas
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === FUNCIONARIOS_KEY) {
        setLocalFuncionarios(JSON.parse(e.newValue || '[]'));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  // SOLUÇÃO 5: Obter e mesclar todos os registros de funcionários de diferentes fontes
  const getLatestFuncionarios = () => {
    try {
      // Verificar todos os registros possíveis
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const funcionariosStorage = JSON.parse(localStorage.getItem(FUNCIONARIOS_KEY) || '[]');
      const userStorage = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Extrair funcionários dos registros de usuário
      const funcionariosFromUsers = registeredUsers.map(user => ({
        id: user.id,
        nome: user.name || user.nome
      }));
      
      // Mesclar todas as listas, eliminando duplicatas por ID
      const allFuncionarios = [...funcionariosStorage];
      
      funcionariosFromUsers.forEach(func => {
        if (!allFuncionarios.some(f => f.id === func.id)) {
          allFuncionarios.push(func);
        }
      });
      
      // Adicionar o usuário atual se não estiver na lista
      if (userStorage && userStorage.id && userStorage.name) {
        if (!allFuncionarios.some(f => f.id === userStorage.id)) {
          allFuncionarios.push({
            id: userStorage.id,
            nome: userStorage.name
          });
        }
      }
      
      // Atualizar localStorage e estado
      localStorage.setItem(FUNCIONARIOS_KEY, JSON.stringify(allFuncionarios));
      setLocalFuncionarios(allFuncionarios);
      
      return allFuncionarios;
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      return [];
    }
  };
  
  // Executar a solução 5 ao montar o componente e a cada 3 segundos
  useEffect(() => {
    getLatestFuncionarios();
    const interval = setInterval(getLatestFuncionarios, 3000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Usar a combinação de funcionários do Context e do localStorage
  const mergedFuncionarios = localFuncionarios.length > funcionarios.length ? 
    localFuncionarios : funcionarios;
  
  // Atualizar a lista de funcionários ao montar o componente e periodicamente
  useEffect(() => {
    // Buscar a lista atualizada ao montar o componente
    refreshFuncionarios();
    
    // Verificar por atualizações a cada 15 segundos
    const interval = setInterval(() => {
      refreshFuncionarios();
    }, 15000);
    
    // Limpar o intervalo ao desmontar
    return () => clearInterval(interval);
  }, [refreshFuncionarios]);
  
  // Verificar notificações de admin
  useEffect(() => {
    const checkAdminNotifications = () => {
      const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
      const unreadNotifications = adminNotifications.filter(n => !n.read && n.type === 'novoFuncionario');
      
      if (unreadNotifications.length > 0) {
        console.log("AjustesPontoTab - Notificações não lidas de novos funcionários:", unreadNotifications);
        // Marcar como lidas
        const updatedNotifications = adminNotifications.map(n => {
          if (n.type === 'novoFuncionario' && !n.read) {
            return { ...n, read: true };
          }
          return n;
        });
        
        localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
        
        // Atualizar a lista de funcionários
        refreshFuncionarios();
        getLatestFuncionarios(); // Adicionando chamada ao método de atualização completa
      }
    };
    
    // Verificar notificações ao montar e a cada 10 segundos
    checkAdminNotifications();
    const notifInterval = setInterval(checkAdminNotifications, 10000);
    
    return () => clearInterval(notifInterval);
  }, [refreshFuncionarios]);
  
  // Guardar solicitações no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('ajustePontoSolicitacoes', JSON.stringify(solicitacoes));
  }, [solicitacoes]);
  
  // Filtrar solicitações
  const solicitacoesFiltradas = solicitacoes.filter(solicitacao => {
    const matchStatus = filtros.status === '' || solicitacao.status === filtros.status;
    const matchFuncionario = filtros.funcionario === '' || solicitacao.funcionarioNome === filtros.funcionario;
    
    // Implementação básica do filtro de período
    let matchPeriodo = true;
    if (filtros.periodo === 'hoje') {
      matchPeriodo = solicitacao.data === new Date().toLocaleDateString('pt-BR');
    } else if (filtros.periodo === 'semana') {
      // Simplificação: apenas verificamos se a data da solicitação está nos últimos 7 dias
      const hoje = new Date();
      const dataLimite = new Date();
      dataLimite.setDate(hoje.getDate() - 7);
      
      const partesData = solicitacao.data.split('/');
      const dataSolicitacao = new Date(
        parseInt(partesData[2]), 
        parseInt(partesData[1]) - 1, 
        parseInt(partesData[0])
      );
      
      matchPeriodo = dataSolicitacao >= dataLimite;
    }
    
    return matchStatus && matchFuncionario && matchPeriodo;
  });
  
  // Ordenar solicitações por data (mais recentes primeiro)
  const solicitacoesOrdenadas = [...solicitacoesFiltradas].sort((a, b) => {
    // Converter datas do formato DD/MM/YYYY para objetos Date para comparação
    const [diaA, mesA, anoA] = a.dataSolicitacao.split('/').map(Number);
    const [diaB, mesB, anoB] = b.dataSolicitacao.split('/').map(Number);
    
    const dateA = new Date(anoA, mesA - 1, diaA);
    const dateB = new Date(anoB, mesB - 1, diaB);
    
    return dateB - dateA; // Ordem decrescente (mais recente primeiro)
  });
  
  // Submeter nova solicitação de ajuste - FUNÇÃO CORRIGIDA
  const handleSubmitNovaSolicitacao = (e) => {
    e.preventDefault();
    
    if (!novaSolicitacao.funcionarioId || !novaSolicitacao.data || !novaSolicitacao.horaCorreta || !novaSolicitacao.motivo) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    const novaSolic = {
      ...novaSolicitacao,
      id: Date.now(),
      status: 'pendente', // Alterado de 'aprovado' para 'pendente'
      dataSolicitacao: new Date().toLocaleDateString('pt-BR')
      // Removida a dataDecisao, pois ainda não foi decidido
    };
    
    setSolicitacoes([novaSolic, ...solicitacoes]);
    
    // Resetar formulário
    setNovaSolicitacao({
      funcionarioId: '',
      funcionarioNome: '',
      data: '',
      tipoRegistro: 'entrada',
      horaOriginal: '',
      horaCorreta: '',
      motivo: ''
    });
    
    // Notificar funcionário sobre a solicitação
    const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    notificacoes.push({
      id: Date.now(),
      userId: novaSolic.funcionarioId,
      message: `Uma solicitação de ajuste de ponto para o dia ${novaSolic.data} foi registrada e está aguardando aprovação.`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    });
    localStorage.setItem('userNotifications', JSON.stringify(notificacoes));
    
    alert('Solicitação de ajuste de ponto criada com sucesso! Aguardando aprovação.');
  };
  
  // Aprovar solicitação
  const aprovarSolicitacao = (id) => {
    const solicitacao = solicitacoes.find(s => s.id === id);
    
    if (!solicitacao || solicitacao.status !== 'pendente') return;
    
    const solicitacoesAtualizadas = solicitacoes.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: 'aprovado',
          dataDecisao: new Date().toLocaleDateString('pt-BR')
        };
      }
      return s;
    });
    
    setSolicitacoes(solicitacoesAtualizadas);
    
    // Notificar funcionário sobre aprovação
    const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    notificacoes.push({
      id: Date.now(),
      userId: solicitacao.funcionarioId,
      message: `Sua solicitação de ajuste de ponto para ${solicitacao.data} foi aprovada.`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    });
    localStorage.setItem('userNotifications', JSON.stringify(notificacoes));
    
    // Atualizar registro de ponto correspondente
    const pontoRegistros = JSON.parse(localStorage.getItem('pontoRegistros') || '[]');
    const registroCorrespondente = pontoRegistros.find(
      registro => registro.funcionarioId === solicitacao.funcionarioId && registro.data === solicitacao.data
    );
    
    if (registroCorrespondente) {
      // Lógica similar à inserção de nova solicitação
      let indiceRegistro = -1;
      if (solicitacao.tipoRegistro === 'entrada') {
        if (solicitacao.horaCorreta.split(':')[0] < '12') {
          indiceRegistro = 0;
        } else {
          indiceRegistro = 2;
        }
      } else {
        if (solicitacao.horaCorreta.split(':')[0] < '14') {
          indiceRegistro = 1;
        } else {
          indiceRegistro = 3;
        }
      }
      
      if (indiceRegistro >= 0 && indiceRegistro < registroCorrespondente.registros.length) {
        registroCorrespondente.registros[indiceRegistro].hora = solicitacao.horaCorreta;
        registroCorrespondente.registros[indiceRegistro].status = 'ajustado';
        
        localStorage.setItem('pontoRegistros', JSON.stringify(pontoRegistros));
      }
    }
    
    alert('Solicitação aprovada com sucesso!');
  };
  
  // Abrir modal para rejeitar solicitação
  const abrirModalRejeitar = (solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setObservacaoRejeicao('');
    setModalRejeitarAberto(true);
  };
  
  // Rejeitar solicitação
  const rejeitarSolicitacao = () => {
    if (!solicitacaoSelecionada) return;
    
    const solicitacoesAtualizadas = solicitacoes.map(s => {
      if (s.id === solicitacaoSelecionada.id) {
        return {
          ...s,
          status: 'rejeitado',
          dataDecisao: new Date().toLocaleDateString('pt-BR'),
          observacao: observacaoRejeicao
        };
      }
      return s;
    });
    
    setSolicitacoes(solicitacoesAtualizadas);
    
    // Notificar funcionário sobre rejeição
    const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    notificacoes.push({
      id: Date.now(),
      userId: solicitacaoSelecionada.funcionarioId,
      message: `Sua solicitação de ajuste de ponto para ${solicitacaoSelecionada.data} foi rejeitada.`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    });
    localStorage.setItem('userNotifications', JSON.stringify(notificacoes));
    
    // Fechar modal
    setModalRejeitarAberto(false);
    setSolicitacaoSelecionada(null);
    setObservacaoRejeicao('');
    
    alert('Solicitação rejeitada.');
  };
  
  // Renderizar cor do status
  const renderizarStatus = (status) => {
    let corClasse = '';
    
    switch(status) {
      case 'pendente':
        corClasse = 'bg-yellow-600';
        break;
      case 'aprovado':
        corClasse = 'bg-green-600';
        break;
      case 'rejeitado':
        corClasse = 'bg-red-600';
        break;
      default:
        corClasse = 'bg-gray-600';
    }
    
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs ${corClasse}`}>
        {status.toUpperCase()}
      </span>
    );
  };
  
  // Se o usuário não estiver autenticado ou não for admin, não renderiza nada
  if (!userData || !userData.authenticated || !userData.roles || !userData.roles.includes('ADMIN')) {
    return null;
  }
  
  return (
    <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Ajustes de Ponto</h1>
      
      {/* Botão para forçar atualização da lista */}
      <div className="mb-4">
        <button 
          onClick={() => {
            const latestFuncionarios = getLatestFuncionarios();
            alert(`Lista atualizada! ${latestFuncionarios.length} funcionários encontrados.`);
          }}
          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md text-sm"
        >
          Atualizar Lista de Funcionários ({allFuncionarios.length})
        </button>
        <div className="text-xs text-purple-300 mt-1">
          Lista atualizada em: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-purple-900 bg-opacity-40 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-purple-300 mb-1">Status</label>
            <select 
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              value={filtros.status}
              onChange={(e) => setFiltros({...filtros, status: e.target.value})}
            >
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
            </select>
          </div>
          
          {/* PRIMEIRA CAIXA DE SELEÇÃO (CORRIGIDA) */}
          <div>
            <label className="block text-sm text-purple-300 mb-1">Funcionário</label>
            <select 
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              value={filtros.funcionario}
              onChange={(e) => setFiltros({...filtros, funcionario: e.target.value})}
            >
              <option value="">Todos os funcionários</option>
              {/* Usar todos os nomes de funcionários possíveis */}
              {[...new Set([
                ...allFuncionarios.map(f => f.nome),
                ...solicitacoes.map(s => s.funcionarioNome)
              ])].filter(Boolean).sort().map((nome, index) => (
                <option key={index} value={nome}>{nome}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm text-purple-300 mb-1">Período</label>
            <select 
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              value={filtros.periodo}
              onChange={(e) => setFiltros({...filtros, periodo: e.target.value})}
            >
              <option value="">Todos os períodos</option>
              <option value="hoje">Hoje</option>
              <option value="semana">Últimos 7 dias</option>
              <option value="mes">Este mês</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Nova Solicitação de Ajuste */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Registrar Ajuste de Ponto</h2>
        <form onSubmit={handleSubmitNovaSolicitacao} className="bg-purple-900 bg-opacity-40 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* SEGUNDA CAIXA DE SELEÇÃO (CORRIGIDA) */}
            <div>
              <label className="block text-sm text-purple-300 mb-1">
                Funcionário * ({allFuncionarios.length} disponíveis)
              </label>
              <select 
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                value={novaSolicitacao.funcionarioId}
                onChange={handleSelecionarFuncionario}
                required
              >
                <option value="">Selecione</option>
                {allFuncionarios.map(funcionario => (
                  <option key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome} {funcionario.id ? `(ID: ${funcionario.id})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-purple-300 mb-1">Data *</label>
              <input 
                type="date" 
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                value={novaSolicitacao.data}
                onChange={(e) => setNovaSolicitacao({...novaSolicitacao, data: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-purple-300 mb-1">Tipo de Registro *</label>
              <select 
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                value={novaSolicitacao.tipoRegistro}
                onChange={(e) => setNovaSolicitacao({...novaSolicitacao, tipoRegistro: e.target.value})}
                required
              >
                <option value="entrada">Entrada</option>
                <option value="saída">Saída</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-purple-300 mb-1">Hora Original</label>
              <input 
                type="time" 
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                value={novaSolicitacao.horaOriginal}
                onChange={(e) => setNovaSolicitacao({...novaSolicitacao, horaOriginal: e.target.value})}
              />
              <small className="text-purple-300">Deixe em branco se não houver registro</small>
            </div>
            <div>
              <label className="block text-sm text-purple-300 mb-1">Hora Correta *</label>
              <input 
                type="time" 
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                value={novaSolicitacao.horaCorreta}
                onChange={(e) => setNovaSolicitacao({...novaSolicitacao, horaCorreta: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-purple-300 mb-1">Motivo *</label>
              <input 
                type="text" 
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                value={novaSolicitacao.motivo}
                onChange={(e) => setNovaSolicitacao({...novaSolicitacao, motivo: e.target.value})}
                required
                placeholder="Motivo do ajuste"
              />
            </div>
          </div>
          <button 
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            Registrar Ajuste
          </button>
        </form>
      </div>
      
      {/* Tabela de Solicitações */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Solicitações de Ajuste</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-purple-300 text-sm border-b border-purple-700">
                <th className="px-4 py-2 text-left">Funcionário</th>
                <th className="px-4 py-2 text-left">Data</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Original</th>
                <th className="px-4 py-2 text-left">Solicitado</th>
                <th className="px-4 py-2 text-left">Motivo</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {solicitacoesOrdenadas.map((solicitacao) => (
                <tr key={solicitacao.id} className="border-b border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                  <td className="px-4 py-3">{solicitacao.funcionarioNome}</td>
                  <td className="px-4 py-3">{solicitacao.data}</td>
                  <td className="px-4 py-3 capitalize">{solicitacao.tipoRegistro}</td>
                  <td className="px-4 py-3">{solicitacao.horaOriginal}</td>
                  <td className="px-4 py-3">{solicitacao.horaCorreta}</td>
                  <td className="px-4 py-3">
                    <div className="truncate max-w-xs" title={solicitacao.motivo}>
                      {solicitacao.motivo}
                    </div>
                  </td>
                  <td className="px-4 py-3">{renderizarStatus(solicitacao.status)}</td>
                  <td className="px-4 py-3">
                    {solicitacao.status === 'pendente' ? (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => aprovarSolicitacao(solicitacao.id)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                        >
                          Aprovar
                        </button>
                        <button 
                          onClick={() => abrirModalRejeitar(solicitacao)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                        >
                          Rejeitar
                        </button>
                      </div>
                    ) : (
                      <div>
                        {solicitacao.observacao && (
                          <div className="text-xs text-purple-300 mt-1" title={solicitacao.observacao}>
                            {solicitacao.observacao.length > 20 
                              ? solicitacao.observacao.substring(0, 20) + '...' 
                              : solicitacao.observacao
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              
              {solicitacoesOrdenadas.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-4 py-6 text-center text-purple-300">
                    Nenhuma solicitação encontrada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Botões de ação */}
      <div className="mt-6 flex flex-wrap gap-4">
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Exportar Relatório
        </button>
        
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Processar Todas as Pendentes
        </button>
      </div>
      
      {/* Modal de Rejeição */}
      {modalRejeitarAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Rejeitar Solicitação</h3>
            <p className="mb-4">
              Você está rejeitando a solicitação de ajuste de ponto de <strong>{solicitacaoSelecionada?.funcionarioNome}</strong> para o dia <strong>{solicitacaoSelecionada?.data}</strong>.
            </p>
            <div className="mb-4">
              <label className="block text-sm text-purple-300 mb-1">Motivo da rejeição</label>
              <textarea 
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                value={observacaoRejeicao}
                onChange={(e) => setObservacaoRejeicao(e.target.value)}
                rows={3}
                placeholder="Informe o motivo da rejeição"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setModalRejeitarAberto(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button 
                onClick={rejeitarSolicitacao}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
              >
                Rejeitar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug: Visualizar dados de funcionários */}
      <div className="mt-6 bg-purple-900 bg-opacity-40 p-4 rounded-lg">
        <details>
          <summary className="cursor-pointer text-purple-300 hover:text-white">Dados de Funcionários para Debug</summary>
          <div className="mt-2 overflow-auto max-h-64 text-xs">
            <h4 className="font-bold text-purple-300">Funcionários do allFuncionarios ({allFuncionarios.length}):</h4>
            <pre className="bg-purple-950 p-2 rounded">
              {JSON.stringify(allFuncionarios, null, 2)}
            </pre>
            
            <h4 className="font-bold text-purple-300 mt-2">Funcionários do Context ({funcionarios.length}):</h4>
            <pre className="bg-purple-950 p-2 rounded">
              {JSON.stringify(funcionarios, null, 2)}
            </pre>
            
            <h4 className="font-bold text-purple-300 mt-2">Funcionários do localStorage ({localFuncionarios.length}):</h4>
            <pre className="bg-purple-950 p-2 rounded">
              {JSON.stringify(localFuncionarios, null, 2)}
            </pre>
            
            <h4 className="font-bold text-purple-300 mt-2">Registros de Usuários:</h4>
            <pre className="bg-purple-950 p-2 rounded">
              {JSON.stringify(JSON.parse(localStorage.getItem('registeredUsers') || '[]'), null, 2)}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
};

export default AjustesPontoTab;