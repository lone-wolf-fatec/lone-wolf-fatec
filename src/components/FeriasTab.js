import React, { useState, useEffect } from 'react';

const FeriasTab = () => {
  // Estado para os registros de férias

  const [folgaEntries, setFolgaEntries] = useState(() => {
    const stored = localStorage.getItem('folgaEntries');
    return stored ? JSON.parse(stored) : [];
  });
  
  const [feriasEntries, setFeriasEntries] = useState(() => {
    const storedFerias = localStorage.getItem('feriasEntries');
    return storedFerias ? JSON.parse(storedFerias) : [
      { 
        id: 1,
        funcionarioId: 101,
        funcionarioNome: 'João Silva',
        dataInicio: '15/04/2025', 
        dataFim: '30/04/2025',
        diasTotais: 15, 
        status: 'aprovado', 
        observacao: 'Férias anuais programadas'
      },
      { 
        id: 2,
        funcionarioId: 102,
        funcionarioNome: 'Maria Oliveira',
        dataInicio: '01/05/2025', 
        dataFim: '15/05/2025',
        diasTotais: 15, 
        status: 'pendente',
        observacao: 'Solicitação de férias após conclusão do projeto XYZ'
      },
      {
        id: 3,
        funcionarioId: 103,
        funcionarioNome: 'Carlos Pereira',
        dataInicio: '10/06/2025',
        dataFim: '25/06/2025',
        diasTotais: 15,
        status: 'rejeitado',
        observacao: 'Férias conflitam com implementação do novo sistema',
        motivo_rejeicao: 'Período crítico de implementação, necessária presença do funcionário'
      }
    ];
  });
  
  // Estados para novas férias
  const [newFerias, setNewFerias] = useState({
    funcionarioId: '',
    funcionarioNome: '',
    dataInicio: '',
    dataFim: '',
    observacao: ''
  });
  
  // Lista de funcionários 
  const [funcionarios, setFuncionarios] = useState(() => {
    const storedFuncionarios = localStorage.getItem('funcionarios');
    return storedFuncionarios ? JSON.parse(storedFuncionarios) : [
      { id: 101, nome: 'João Silva', diasFeriasDisponiveis: 30 },
      { id: 102, nome: 'Maria Oliveira', diasFeriasDisponiveis: 30 },
      { id: 103, nome: 'Carlos Pereira', diasFeriasDisponiveis: 15 },
      { id: 104, nome: 'Ana Souza', diasFeriasDisponiveis: 30 },
      { id: 105, nome: 'Pedro Santos', diasFeriasDisponiveis: 20 }
    ];
  });
  
  // Estado para contestações
  const [contestacoes, setContestacoes] = useState([]);
  
  // Estado para modal de contestação
  const [modalContestacaoAberto, setModalContestacaoAberto] = useState(false);
  const [contestacaoSelecionada, setContestacaoSelecionada] = useState(null);
  const [feedbackContestacao, setFeedbackContestacao] = useState('');
  const [statusContestacao, setStatusContestacao] = useState('aprovado');
  
  // Estado para armazenar todos os funcionários possíveis
  const [allFuncionarios, setAllFuncionarios] = useState([]);

  // Estado para modal de rejeição
  const [modalRejeitarAberto, setModalRejeitarAberto] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [observacaoRejeicao, setObservacaoRejeicao] = useState('');
  
  // Estado para filtros
  const [filtros, setFiltros] = useState({
    status: '',
    funcionario: '',
    periodo: '',
    contestacao: ''
  });
  
  // Estado para exibir modal de confirmação
  const [confirmacaoModal, setConfirmacaoModal] = useState({
    aberto: false,
    mensagem: '',
    callback: null
  });
  
  // Dias de férias calculados
  const [diasFerias, setDiasFerias] = useState(0);
  // Função para obter todos os funcionários possíveis
  const getAllPossibleFuncionarios = () => {
    try {
      // 1. Obter do registeredUsers
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const funcionariosFromUsers = registeredUsers.map(user => ({
        id: user.id,
        nome: user.name || user.nome,
        diasFeriasDisponiveis: user.diasFeriasDisponiveis || 30 // Valor padrão se não tiver
      }));
      
      // 2. Obter do localStorage "funcionarios"
      const storedFuncionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
      
      // 3. Obter outros funcionários dos registros de férias
      const funcionariosFromFerias = feriasEntries.map(entry => ({
        id: entry.funcionarioId,
        nome: entry.funcionarioNome
      }));
      
      // 4. Criar um mapa para eliminar duplicatas por ID
      const funcionariosMap = new Map();
      
      // Adicionar de todas as fontes
      [
        ...funcionariosFromUsers, 
        ...storedFuncionarios, 
        ...funcionariosFromFerias,
        ...funcionarios
      ].forEach(func => {
        if (func && func.id) {
          // Se o funcionário já existe no mapa, mantenha os diasFeriasDisponiveis
          if (funcionariosMap.has(func.id)) {
            const existingFunc = funcionariosMap.get(func.id);
            funcionariosMap.set(func.id, {
              ...func,
              diasFeriasDisponiveis: func.diasFeriasDisponiveis || existingFunc.diasFeriasDisponiveis || 30
            });
          } else {
            funcionariosMap.set(func.id, func);
          }
        }
      });
      
      // Converter de volta para array
      return Array.from(funcionariosMap.values());
    } catch (error) {
      console.error('Erro ao obter funcionários de todas as fontes:', error);
      return [];
    }
  };

  // useEffect para manter a lista de funcionários atualizada
  useEffect(() => {
    const updateAllFuncionarios = () => {
      const allPossible = getAllPossibleFuncionarios();
      setAllFuncionarios(allPossible);
    };
    
    // Atualizar logo no início
    updateAllFuncionarios();
    
    // E a cada 2 segundos para manter atualizado
    const interval = setInterval(updateAllFuncionarios, 2000);
    
    return () => clearInterval(interval);
  }, [funcionarios, feriasEntries]);
  
  // Carregar contestações do localStorage
  useEffect(() => {
    const storedContestacoes = localStorage.getItem('contestacoes');
    if (storedContestacoes) {
      const allContestacoes = JSON.parse(storedContestacoes);
      const feriasContestacoes = allContestacoes.filter(c => c.tipo === 'ferias');
      setContestacoes(feriasContestacoes);
    }
  }, []);

  // Salvar férias no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('feriasEntries', JSON.stringify(feriasEntries));
  }, [feriasEntries]);
  
  // Calcular dias de férias quando as datas mudarem
  useEffect(() => {
    if (newFerias.dataInicio && newFerias.dataFim) {
      const inicio = new Date(newFerias.dataInicio.split('/').reverse().join('-'));
      const fim = new Date(newFerias.dataFim.split('/').reverse().join('-'));
      
      // Adicionar 1 para incluir o último dia
      const diffTime = Math.abs(fim - inicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      setDiasFerias(diffDays);
    } else {
      setDiasFerias(0);
    }
  }, [newFerias.dataInicio, newFerias.dataFim]);
  // Filtrar férias
  const feriasFiltradas = feriasEntries.filter(ferias => {
    const matchStatus = filtros.status === '' || ferias.status === filtros.status;
    const matchFuncionario = filtros.funcionario === '' || ferias.funcionarioNome === filtros.funcionario;
    
    // Implementação básica do filtro de período
    let matchPeriodo = true;
    if (filtros.periodo === 'proximo-mes') {
      const hoje = new Date();
      const proximoMes = new Date();
      proximoMes.setMonth(hoje.getMonth() + 1);
      
      const [dia, mes, ano] = ferias.dataInicio.split('/').map(Number);
      const dataInicio = new Date(ano, mes - 1, dia);
      
      matchPeriodo = dataInicio.getMonth() === proximoMes.getMonth() && 
                    dataInicio.getFullYear() === proximoMes.getFullYear();
    }
    
    // Novo filtro para contestações
    let matchContestacao = true;
    if (filtros.contestacao === 'com-contestacao') {
      matchContestacao = contestacoes.some(c => c.itemId === ferias.id);
    } else if (filtros.contestacao === 'sem-contestacao') {
      matchContestacao = !contestacoes.some(c => c.itemId === ferias.id);
    }
    
    return matchStatus && matchFuncionario && matchPeriodo && matchContestacao;
  });
  
  // Ordenar por data de início (mais próximas primeiro)
  const feriasOrdenadas = [...feriasFiltradas].sort((a, b) => {
    const [diaA, mesA, anoA] = a.dataInicio.split('/').map(Number);
    const [diaB, mesB, anoB] = b.dataInicio.split('/').map(Number);
    
    const dateA = new Date(anoA, mesA - 1, diaA);
    const dateB = new Date(anoB, mesB - 1, diaB);
    
    return dateA - dateB; // Ordem crescente (próximas primeiro)
  });
  
  // Selecionar funcionário para novas férias
  const handleSelecionarFuncionario = (e) => {
    const funcionarioId = parseInt(e.target.value);
    if (funcionarioId) {
      const funcionarioSelecionado = allFuncionarios.find(f => f.id === funcionarioId);
      setNewFerias({
        ...newFerias,
        funcionarioId,
        funcionarioNome: funcionarioSelecionado.nome
      });
    } else {
      setNewFerias({
        ...newFerias,
        funcionarioId: '',
        funcionarioNome: ''
      });
    }
  };
  
  // Formatar data para DD/MM/YYYY
  const formatarData = (data) => {
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };
  
  // Adicionar novas férias
  const handleAddFerias = (e) => {
    e.preventDefault();
    
    if (!newFerias.funcionarioId || !newFerias.dataInicio || !newFerias.dataFim) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    // Verificar se há sobreposição com férias existentes
    const funcionarioFerias = feriasEntries.filter(
      f => f.funcionarioId === newFerias.funcionarioId && 
      (f.status === 'aprovado' || f.status === 'pendente')
    );
    
    const dataInicioNova = new Date(newFerias.dataInicio.split('/').reverse().join('-'));
    const dataFimNova = new Date(newFerias.dataFim.split('/').reverse().join('-'));
    
    const sobreposicao = funcionarioFerias.some(ferias => {
      const dataInicio = new Date(ferias.dataInicio.split('/').reverse().join('-'));
      const dataFim = new Date(ferias.dataFim.split('/').reverse().join('-'));
      
      return (dataInicioNova <= dataFim && dataFimNova >= dataInicio);
    });
    
    if (sobreposicao) {
      alert('Há sobreposição com férias já agendadas para este funcionário');
      return;
    }
    
    // Verificar dias disponíveis
    const funcionario = funcionarios.find(f => f.id === newFerias.funcionarioId);
    if (diasFerias > funcionario.diasFeriasDisponiveis) {
      alert(`O funcionário só possui ${funcionario.diasFeriasDisponiveis} dias de férias disponíveis`);
      return;
    }
    
    const ferias = {
      id: Date.now(),
      funcionarioId: newFerias.funcionarioId,
      funcionarioNome: newFerias.funcionarioNome,
      dataInicio: newFerias.dataInicio.includes('-') ? formatarData(newFerias.dataInicio) : newFerias.dataInicio,
      dataFim: newFerias.dataFim.includes('-') ? formatarData(newFerias.dataFim) : newFerias.dataFim,
      diasTotais: diasFerias,
      observacao: newFerias.observacao,
      status: 'pendente' // Por padrão, as férias ficam pendentes de aprovação
    };
    
    setFeriasEntries([...feriasEntries, ferias]);
    
    // Atualizar dias disponíveis do funcionário
    const updatedFuncionarios = funcionarios.map(f => {
      if (f.id === newFerias.funcionarioId) {
        return {
          ...f,
          diasFeriasDisponiveis: f.diasFeriasDisponiveis - diasFerias
        };
      }
      return f;
    });
    
    setFuncionarios(updatedFuncionarios);
    localStorage.setItem('funcionarios', JSON.stringify(updatedFuncionarios));
    
    // Notificar funcionário sobre a solicitação
    const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    notificacoes.push({
      id: Date.now(),
      userId: ferias.funcionarioId,
      message: `Sua solicitação de férias de ${ferias.dataInicio} a ${ferias.dataFim} foi registrada e está aguardando aprovação.`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    });
    localStorage.setItem('userNotifications', JSON.stringify(notificacoes));
    
    // Resetar formulário
    setNewFerias({
      funcionarioId: '',
      funcionarioNome: '',
      dataInicio: '',
      dataFim: '',
      observacao: ''
    });
    
    alert('Solicitação de férias registrada com sucesso!');
  };
  // Função para alterar status (aprovação/rejeição)
  const changeStatus = (id, newStatus) => {
    const entryIndex = feriasEntries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return;
    
    const updatedEntries = [...feriasEntries];
    updatedEntries[entryIndex] = {
      ...updatedEntries[entryIndex], 
      status: newStatus
    };
    
    if (newStatus === 'rejeitado' && observacaoRejeicao) {
      updatedEntries[entryIndex].motivo_rejeicao = observacaoRejeicao;
      
      // Se rejeitou, devolver os dias de férias ao funcionário
      if (updatedEntries[entryIndex].status !== 'rejeitado') {
        const funcionarioId = updatedEntries[entryIndex].funcionarioId;
        const diasFerias = updatedEntries[entryIndex].diasTotais;
        
        const updatedFuncionarios = funcionarios.map(f => {
          if (f.id === funcionarioId) {
            return {
              ...f,
              diasFeriasDisponiveis: f.diasFeriasDisponiveis + diasFerias
            };
          }
          return f;
        });
        
        setFuncionarios(updatedFuncionarios);
        localStorage.setItem('funcionarios', JSON.stringify(updatedFuncionarios));
      }
    }
    
    setFeriasEntries(updatedEntries);
    
    // Notificar funcionário sobre mudança de status
    const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    notificacoes.push({
      id: Date.now(),
      userId: updatedEntries[entryIndex].funcionarioId,
      message: `Sua solicitação de férias de ${updatedEntries[entryIndex].dataInicio} a ${updatedEntries[entryIndex].dataFim} foi ${newStatus === 'aprovado' ? 'aprovada' : 'rejeitada'}.${newStatus === 'rejeitado' ? ' Motivo: ' + observacaoRejeicao : ''}`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    });
    localStorage.setItem('userNotifications', JSON.stringify(notificacoes));
    
    if (newStatus === 'rejeitado') {
      setModalRejeitarAberto(false);
      setSolicitacaoSelecionada(null);
      setObservacaoRejeicao('');
    }
  };
  
  // Função para abrir modal de rejeição
  const abrirModalRejeitar = (ferias) => {
    setSolicitacaoSelecionada(ferias);
    setObservacaoRejeicao('');
    setModalRejeitarAberto(true);
  };
  
  // Função para responder a contestação
  const responderContestacao = (contestacao) => {
    setContestacaoSelecionada(contestacao);
    setFeedbackContestacao('');
    setStatusContestacao('aprovado');
    setModalContestacaoAberto(true);
  };
  
  // Função para salvar resposta da contestação
  const salvarRespostaContestacao = () => {
    if (!feedbackContestacao) {
      alert('Por favor, forneça um feedback para a contestação');
      return;
    }
    
    // Atualizar contestação
    const storedContestacoes = JSON.parse(localStorage.getItem('contestacoes') || '[]');
    const updatedContestacoes = storedContestacoes.map(c => {
      if (c.id === contestacaoSelecionada.id) {
        return {
          ...c,
          status: statusContestacao,
          feedback_admin: feedbackContestacao,
          dataResposta: new Date().toLocaleDateString('pt-BR')
        };
      }
      return c;
    });
    
    localStorage.setItem('contestacoes', JSON.stringify(updatedContestacoes));
    setContestacoes(updatedContestacoes.filter(c => c.tipo === 'ferias'));
    
    // Se a contestação foi aprovada e o funcionário queria reagendar
    if (statusContestacao === 'aprovado' && contestacaoSelecionada.resposta === 'reagendar') {
      // Buscar a férias original
      const feriaIndex = feriasEntries.findIndex(f => f.id === contestacaoSelecionada.itemId);
      if (feriaIndex !== -1) {
        // Criar nova férias com as datas reagendadas
        const updatedFeriasEntries = [...feriasEntries];
        updatedFeriasEntries[feriaIndex] = {
          ...updatedFeriasEntries[feriaIndex],
          dataInicio: contestacaoSelecionada.novaDataInicio,
          dataFim: contestacaoSelecionada.novaDataFim,
          status: 'aprovado',
          observacao: `${updatedFeriasEntries[feriaIndex].observacao || ''} [Reagendado após contestação]`.trim()
        };
        setFeriasEntries(updatedFeriasEntries);
      }
    }
    
    // Notificar funcionário
    const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    notificacoes.push({
      id: Date.now(),
      userId: contestacaoSelecionada.funcionarioId,
      message: `Sua contestação de férias foi ${
        statusContestacao === 'aprovado' ? 'aprovada' : 'rejeitada'
      }. Feedback: ${feedbackContestacao}`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    });
    localStorage.setItem('userNotifications', JSON.stringify(notificacoes));
    
    setModalContestacaoAberto(false);
    alert(`Contestação ${statusContestacao === 'aprovado' ? 'aprovada' : 'rejeitada'} com sucesso!`);
  };
  
  // Renderizar cor do status
  const renderizarStatus = (status) => {
    let corClasse = '';
    let texto = status.toUpperCase();
    
    switch(status) {
      case 'aprovado':
        corClasse = 'bg-green-600';
        break;
      case 'pendente':
        corClasse = 'bg-yellow-600';
        break;
      case 'rejeitado':
        corClasse = 'bg-red-600';
        break;
      default:
        corClasse = 'bg-gray-600';
    }
    
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs ${corClasse}`}>
        {texto}
      </span>
    );
  };
  
  // Verificar se há contestação para uma férias
  const temContestacao = (feriasId) => {
    return contestacoes.some(c => c.itemId === feriasId);
  };
  
  // Obter contestação para uma férias
  const getContestacao = (feriasId) => {
    return contestacoes.find(c => c.itemId === feriasId);
  };
  
  // Renderizar status da contestação
  const renderizarStatusContestacao = (status) => {
    let corClasse = '';
    let texto = status.toUpperCase();
    
    switch(status) {
      case 'aprovado':
        corClasse = 'bg-green-600';
        texto = 'APROVADA';
        break;
      case 'rejeitado':
        corClasse = 'bg-red-600';
        texto = 'REJEITADA';
        break;
      case 'pendente':
        corClasse = 'bg-yellow-600';
        texto = 'PENDENTE';
        break;
      default:
        corClasse = 'bg-gray-600';
    }
    
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs ${corClasse}`}>
        {texto}
      </span>
    );
  };
  
  // Calcular status do banco de horas de férias
  const calcularBancoFerias = () => {
    // Calcular dias totais, dias usados, e dias planejados
    const stats = funcionarios.reduce((acc, funcionario) => {
      const feriasAprovadas = feriasEntries.filter(
        f => f.funcionarioId === funcionario.id && f.status === 'aprovado'
      );
      
      const feriasPendentes = feriasEntries.filter(
        f => f.funcionarioId === funcionario.id && f.status === 'pendente'
      );
      
      const diasAprovados = feriasAprovadas.reduce((sum, f) => sum + f.diasTotais, 0);
      const diasPendentes = feriasPendentes.reduce((sum, f) => sum + f.diasTotais, 0);
      
      return {
        diasDisponiveis: acc.diasDisponiveis + funcionario.diasFeriasDisponiveis,
        diasAprovados: acc.diasAprovados + diasAprovados,
        diasPendentes: acc.diasPendentes + diasPendentes
      };
    }, { diasDisponiveis: 0, diasAprovados: 0, diasPendentes: 0 });
    
    return stats;
  };
  
  const bancoFerias = calcularBancoFerias();
  return (
    <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold">Gerenciamento de Férias</h1>
      
      {/* Filtros */}
      <div className="bg-purple-900 bg-opacity-40 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          {/* Select de filtro de funcionário */}
          <div>
            <label className="block text-sm text-purple-300 mb-1">Funcionário</label>
            <select 
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              value={filtros.funcionario}
              onChange={(e) => setFiltros({...filtros, funcionario: e.target.value})}
            >
              <option value="">Todos os funcionários</option>
              {allFuncionarios.map(funcionario => (
                <option key={funcionario.id} value={funcionario.nome}>
                  {funcionario.nome}
                </option>
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
              <option value="proximo-mes">Próximo mês</option>
              <option value="tres-meses">Próximos 3 meses</option>
              <option value="seis-meses">Próximos 6 meses</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-purple-300 mb-1">Contestações</label>
            <select 
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              value={filtros.contestacao}
              onChange={(e) => setFiltros({...filtros, contestacao: e.target.value})}
            >
              <option value="">Todas as solicitações</option>
              <option value="com-contestacao">Com contestação</option>
              <option value="sem-contestacao">Sem contestação</option>
            </select>
          </div>
        </div>
      </div>

      {/* Nova solicitação de férias */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Registrar Nova Solicitação de Férias</h2>
        <form onSubmit={handleAddFerias} className="bg-purple-900 bg-opacity-40 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-purple-300 mb-1">Funcionário *</label>
              <select 
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                value={newFerias.funcionarioId}
                onChange={handleSelecionarFuncionario}
                required
              >
                <option value="">Selecione</option>
                {allFuncionarios.map(funcionario => (
                  <option key={funcionario.id} value={funcionario.id}>
                    {funcionario.nome} ({funcionario.diasFeriasDisponiveis || 30} dias disponíveis)
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-1 grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-purple-300 mb-1">Data de Início *</label>
                <input 
                  type="date" 
                  className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                  value={newFerias.dataInicio}
                  onChange={(e) => setNewFerias({...newFerias, dataInicio: e.target.value})}
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-purple-300 mb-1">Data de Fim *</label>
                <input 
                  type="date" 
                  className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                  value={newFerias.dataFim}
                  onChange={(e) => setNewFerias({...newFerias, dataFim: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-purple-300 mb-1">Observação</label>
              <textarea 
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                value={newFerias.observacao}
                onChange={(e) => setNewFerias({...newFerias, observacao: e.target.value})}
                rows={2}
                placeholder="Observações sobre as férias (opcional)"
              ></textarea>
            </div>
          </div>
          {diasFerias > 0 ? (
  <div className="bg-purple-700 bg-opacity-40 p-3 rounded mb-4">
    <p className="text-white">
      Total de dias de férias: <strong>{diasFerias} dias</strong>
    </p>
  </div>
) : (
  <div className="bg-purple-700 bg-opacity-40 p-3 rounded mb-4">
    <p className="text-white">
      Total de dias de férias: <strong>0 dias</strong>
    </p>
  </div>
)}

<button 
  type="submit"
  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
>
  Solicitar Férias
</button>

        </form>
      </div>
      {/* Dashboard de férias */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card - Dias Disponíveis */}
        <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <div className="flex items-center mb-4">
            <div className="bg-green-600 p-2 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Dias Disponíveis</h2>
          </div>
          <p className="text-2xl font-bold mb-2">
            31 dias
          </p>
          <p className="text-purple-300 text-sm">
            Total de dias disponíveis para todos os funcionários
          </p>
        </div>
        
        {/* Card - Dias Aprovados */}
        <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <div className="flex items-center mb-4">
            <div className="bg-blue-600 p-2 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Dias Aprovados</h2>
          </div>
          <p className="text-2xl font-bold mb-2">
            {bancoFerias.diasAprovados} dias
          </p>
          <p className="text-purple-300 text-sm">
            Total de dias de férias já aprovados
          </p>
        </div>
        
        {/* Card - Solicitações Pendentes */}
        <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <div className="flex items-center mb-4">
            <div className="bg-yellow-600 p-2 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Solicitações Pendentes</h2>
          </div>
          <p className="text-2xl font-bold mb-2">
            {feriasEntries.filter(entry => entry.status === 'pendente').length}
          </p>
          <p className="text-purple-300 text-sm">
            Total de {bancoFerias.diasPendentes} dias aguardando aprovação
          </p>
        </div>
      </div>
      
      {/* Solicitações de férias */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Solicitações de Férias</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-purple-300 text-sm border-b border-purple-700">
                <th className="px-4 py-2 text-left">Funcionário</th>
                <th className="px-4 py-2 text-left">Período</th>
                <th className="px-4 py-2 text-left">Dias</th>
                <th className="px-4 py-2 text-left">Observação</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Contestação</th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {feriasOrdenadas.map((entry) => (
                <tr key={entry.id} className="border-b border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                  <td className="px-4 py-3">{entry.funcionarioNome}</td>
                  <td className="px-4 py-3">
                    {entry.dataInicio} a {entry.dataFim}
                  </td>
                  <td className="px-4 py-3">{entry.diasTotais} dias</td>
                  <td className="px-4 py-3">
                    <div className="truncate max-w-xs" title={entry.observacao}>
                      {entry.observacao || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-3">{renderizarStatus(entry.status)}</td>
                  <td className="px-4 py-3">
                    {temContestacao(entry.id) ? (
                      <div>
                        {renderizarStatusContestacao(getContestacao(entry.id).status)}
                        <button
                          onClick={() => responderContestacao(getContestacao(entry.id))}
                          className="ml-2 bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded"
                          disabled={getContestacao(entry.id).status !== 'pendente'}
                        >
                          {getContestacao(entry.id).status === 'pendente' ? 'Responder' : 'Ver Detalhes'}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400">Sem contestação</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {entry.status === 'pendente' && (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => changeStatus(entry.id, 'aprovado')}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                        >
                          Aprovar
                        </button>
                        <button 
                          onClick={() => abrirModalRejeitar(entry)}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                        >
                          Rejeitar
                        </button>
                      </div>
                    )}
                    {entry.status === 'rejeitado' && entry.motivo_rejeicao && (
                      <div className="text-xs text-red-300" title={entry.motivo_rejeicao}>
                        Motivo: {entry.motivo_rejeicao.substring(0, 30)}
                        {entry.motivo_rejeicao.length > 30 ? '...' : ''}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              
              {feriasOrdenadas.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-4 py-6 text-center text-purple-300">
                    Nenhuma solicitação de férias encontrada com os filtros selecionados.
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
          Exportar Calendário de Férias
        </button>
        
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Gerar Relatório de Férias
        </button>
      </div>
      {/* Modal de Rejeição */}
      {modalRejeitarAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Rejeitar Férias</h3>
            <p className="mb-4">
              Você está rejeitando as férias de <strong>{solicitacaoSelecionada?.funcionarioNome}</strong> para o período de <strong>{solicitacaoSelecionada?.dataInicio}</strong> a <strong>{solicitacaoSelecionada?.dataFim}</strong>.
            </p>
            <div className="mb-4">
              <label className="block text-sm text-purple-300 mb-1">Motivo da rejeição</label>
              <textarea 
                className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
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
                onClick={() => changeStatus(solicitacaoSelecionada?.id, 'rejeitado')}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                disabled={!observacaoRejeicao}
              >
                Rejeitar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Resposta à Contestação */}
      {modalContestacaoAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-800 rounded-lg shadow-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Responder Contestação de Férias</h3>
            
            <div className="bg-purple-700 bg-opacity-40 p-4 rounded-lg mb-4">
              <h4 className="font-semibold mb-2">Detalhes da Contestação</h4>
              <p><strong>Funcionário:</strong> {contestacaoSelecionada?.funcionarioNome}</p>
              <p><strong>Data Original:</strong> {contestacaoSelecionada?.dataOriginal}</p>
              <p><strong>Tipo de Contestação:</strong> {
                contestacaoSelecionada?.resposta === 'concordar' ? 'Concordar com a decisão' :
                contestacaoSelecionada?.resposta === 'discordar' ? 'Discordar da decisão' :
                'Solicitar reagendamento'
              }</p>
              
              {contestacaoSelecionada?.resposta === 'reagendar' && (
                <div className="mt-2 p-2 bg-purple-600 bg-opacity-40 rounded">
                  <p><strong>Nova data solicitada:</strong> {
                    contestacaoSelecionada.novaDataInicio && contestacaoSelecionada.novaDataFim ? 
                    `${contestacaoSelecionada.novaDataInicio} a ${contestacaoSelecionada.novaDataFim}` :
                    contestacaoSelecionada.novaDataInicio
                  }</p>
                </div>
              )}
              
              <div className="mt-2">
                <p><strong>Motivo:</strong> {contestacaoSelecionada?.motivo}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-purple-300 mb-1">Decisão</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setStatusContestacao('aprovado')}
                  className={`px-4 py-2 rounded ${
                    statusContestacao === 'aprovado' ? 'bg-green-600 text-white' : 'bg-purple-700 text-purple-300'
                  }`}
                >
                  Aprovar
                </button>
                <button
                  onClick={() => setStatusContestacao('rejeitado')}
                  className={`px-4 py-2 rounded ${
                    statusContestacao === 'rejeitado' ? 'bg-red-600 text-white' : 'bg-purple-700 text-purple-300'
                  }`}
                >
                  Rejeitar
                </button>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-purple-300 mb-1">Feedback ao Funcionário</label>
              <textarea 
                className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                value={feedbackContestacao}
                onChange={(e) => setFeedbackContestacao(e.target.value)}
                rows={4}
                placeholder={`Descreva o motivo para ${
                  statusContestacao === 'aprovado' ? 'aprovar' : 'rejeitar'
                } a contestação...`}
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setModalContestacaoAberto(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button 
                onClick={salvarRespostaContestacao}
                className={`${
                  statusContestacao === 'aprovado' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                } text-white font-medium py-2 px-4 rounded`}
                disabled={!feedbackContestacao}
              >
                {statusContestacao === 'aprovado' ? 'Aprovar Contestação' : 'Rejeitar Contestação'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Confirmação */}
      {confirmacaoModal.aberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirmação</h3>
            <p className="mb-4">{confirmacaoModal.mensagem}</p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setConfirmacaoModal({...confirmacaoModal, aberto: false})}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  confirmacaoModal.callback();
                  setConfirmacaoModal({...confirmacaoModal, aberto: false});
                }}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeriasTab;