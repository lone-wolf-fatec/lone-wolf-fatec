import React, { useState, useEffect } from 'react';


const ApprovedDataComponent = () => {
  // -------------- DADOS DO COLABORADOR --------------
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('horasExtras');
  // Estados para armazenar dados aprovados pelo administrador
  const [horasExtrasApproved, setHorasExtrasApproved] = useState([]);
  const [feriasApproved, setFeriasApproved] = useState([]);
  const [folgasApproved, setFolgasApproved] = useState([]);
  const [bancoHoras, setBancoHoras] = useState(null);
  const [ausenciasApproved, setAusenciasApproved] = useState([]);
  const [jornada, setJornada] = useState(null);
  
  // Estado para o modal de contestação
  const [showContestarModal, setShowContestarModal] = useState(false);
  const [contestacaoItem, setContestacaoItem] = useState(null);
  const [contestacaoTipo, setContestacaoTipo] = useState('');
  const [contestacaoMotivo, setContestacaoMotivo] = useState('');
  const [contestacaoResposta, setContestacaoResposta] = useState('concordar');
  const [novaDataInicio, setNovaDataInicio] = useState('');
  const [novaDataFim, setNovaDataFim] = useState('');
  const [novasHoras, setNovasHoras] = useState('');
  
  // Estado para acompanhar contestações enviadas
  const [contestacoesEnviadas, setContestacoesEnviadas] = useState(() => {
    const stored = localStorage.getItem('contestacoes');
    return stored ? JSON.parse(stored) : [];
  });

  // -------------- MEUS DADOS APROVADOS --------------
  const [showApprovedModal, setShowApprovedModal] = useState(false);
  const [activeApprovedTab, setActiveApprovedTab] = useState('ferias');
  
  // Estados para formulário de férias
  const [dataInicioFerias, setDataInicioFerias] = useState('');
  const [dataFimFerias, setDataFimFerias] = useState('');
  const [justificativaFerias, setJustificativaFerias] = useState('');

  // Estados para formulário de folga
  const [dataFolga, setDataFolga] = useState('');
  const [justificativaFolga, setJustificativaFolga] = useState('');
  const [tipoFolga, setTipoFolga] = useState('Abono');
  const [periodoFolga, setPeriodoFolga] = useState('Dia Inteiro');

  // Estados para solicitações
  const [feriasEntries, setFeriasEntries] = useState([]);
  const [folgasEntries, setFolgasEntries] = useState([]);
  
  // Obter dados do usuário logado
  const [userData, setUserData] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      id: storedUser.id || 1, // Valor padrão para teste
      name: storedUser.name || 'Usuário',
      email: storedUser.email || ''
    };
  });
  // Carregar dados aprovados ao iniciar
  useEffect(() => {
    // Horas Extras aprovadas
    const storedHorasExtras = localStorage.getItem('overtimeEntries');
    if (storedHorasExtras) {
      const horasExtras = JSON.parse(storedHorasExtras);
      const approved = horasExtras.filter(item =>
        item.funcionarioId === userData.id && (item.status === 'aprovado' || item.status === 'detectado')
      );
      setHorasExtrasApproved(approved);
    }
    // Férias aprovadas
    const storedFerias = localStorage.getItem('feriasEntries');
    if (storedFerias) {
      const ferias = JSON.parse(storedFerias);
      const approved = ferias.filter(item =>
        item.funcionarioId === userData.id && item.status === 'aprovado'
      );
      setFeriasApproved(approved);
      
      // Para o segundo modal (Meus Dados Aprovados)
      const userFerias = ferias.filter(item => item.funcionarioId === userData.id);
      setFeriasEntries(userFerias);
    }
    // Folgas aprovadas
    const storedFolgas = localStorage.getItem('folgaEntries');
    if (storedFolgas) {
      const folgas = JSON.parse(storedFolgas);
      const approved = folgas.filter(item =>
        item.funcionarioId === userData.id && item.status === 'aprovado'
      );
      setFolgasApproved(approved);
      
      // Para o segundo modal (Meus Dados Aprovados)
      const userFolgas = folgas.filter(item => item.funcionarioId === userData.id);
      setFolgasEntries(userFolgas);
    }
    // Banco de Horas
    const storedFuncionarios = localStorage.getItem('funcionarios');
    if (storedFuncionarios) {
      const funcionarios = JSON.parse(storedFuncionarios);
      const userInfo = funcionarios.find(item => item.id === userData.id);
      if (userInfo && userInfo.bancoHoras !== undefined) {
        setBancoHoras({
          saldo: userInfo.bancoHoras,
          ultimaAtualizacao: new Date().toLocaleDateString('pt-BR')
        });
      } else {
        // Dados padrão se não encontrar (para o segundo modal)
        setBancoHoras({
          saldo: 12.5,
          ultimaAtualizacao: new Date().toLocaleDateString('pt-BR')
        });
      }
    } else {
      // Dados padrão se não houver funcionários cadastrados (para o segundo modal)
      setBancoHoras({
        saldo: 12.5,
        ultimaAtualizacao: new Date().toLocaleDateString('pt-BR')
      });
    }
    // Ausências aprovadas
    const storedAusencias = localStorage.getItem('ausencias');
    if (storedAusencias) {
      const ausencias = JSON.parse(storedAusencias);
      const approved = ausencias.filter(item =>
        item.employeeId === userData.id && item.status === 'aprovado'
      );
      setAusenciasApproved(approved);
    }
    // Jornada de trabalho
    const storedJornadas = localStorage.getItem('jornadas');
    if (storedJornadas) {
      const jornadas = JSON.parse(storedJornadas);
      const userJornada = jornadas.find(item => item.employeeId === userData.id);
      if (userJornada) {
        setJornada(userJornada);
      }
    }
  }, [userData.id]);
  
  // Função para formatar período
  const formatPeriod = (start, end) => {
    return start === end ? start : `${start} - ${end}`;
  };
  
  // Função para formatar data para o formato de input date
  function formatDateToInputDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }
  
  // Renderizar status com cor
  const renderStatus = (status) => {
    let className = '';
    let text = status.toUpperCase();
    switch(status) {
      case 'aprovado':
        className = 'bg-green-600';
        break;
      case 'pendente':
        className = 'bg-yellow-600';
        break;
      case 'rejeitado':
        className = 'bg-red-600';
        break;
      case 'detectado':
        className = 'bg-blue-600';
        break;
      default:
        className = 'bg-gray-600';
    }
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs ${className}`}>
        {text}
      </span>
    );
  };
  // Verificar se item já foi contestado
  const itemContestado = (tipo, id) => {
    return contestacoesEnviadas.some(c =>
      c.tipo === tipo && c.itemId === id && c.funcionarioId === userData.id
    );
  };
  
  // Obter status de contestação
  const getContestacaoStatus = (tipo, id) => {
    const contestacao = contestacoesEnviadas.find(c =>
      c.tipo === tipo && c.itemId === id && c.funcionarioId === userData.id
    );
    
    if (!contestacao) return null;
    
    return contestacao.status;
  };
  
  // Abrir modal de contestação
  const abrirContestacao = (tipo, item) => {
    setContestacaoTipo(tipo);
    setContestacaoItem(item);
    setContestacaoMotivo('');
    setContestacaoResposta('concordar');
    // Inicializar valores padrão baseados no tipo
    if (tipo === 'horasExtras') {
      setNovasHoras(item.hours.toString());
      setNovaDataInicio(formatDateToInputDate(item.date));
      setNovaDataFim('');
    } else if (tipo === 'ferias' || tipo === 'folgas') {
      setNovaDataInicio(tipo === 'ferias' ? formatDateToInputDate(item.dataInicio) : formatDateToInputDate(item.data));
      setNovaDataFim(tipo === 'ferias' ? formatDateToInputDate(item.dataFim) : '');
      setNovasHoras('');
    }
    setShowContestarModal(true);
  };
  
  // Função auxiliar para formatar data de input para formato brasileiro
  const formatDateBR = (inputDate) => {
    if (!inputDate) return '';
    const [ano, mes, dia] = inputDate.split('-');
    return `${dia}/${mes}/${ano}`;
  };
  
  // Função auxiliar para obter label do tipo de contestação
  const getTipoLabel = (tipo) => {
    switch(tipo) {
      case 'horasExtras':
        return 'horas extras';
      case 'ferias':
        return 'férias';
      case 'folgas':
        return 'folga';
      default:
        return tipo;
    }
  };
  
  // Enviar contestação
  const enviarContestacao = () => {
    const contestacao = {
      id: Date.now(),
      funcionarioId: userData.id,
      funcionarioNome: userData.name,
      tipo: contestacaoTipo,
      itemId: contestacaoItem.id,
      dataOriginal: contestacaoTipo === 'horasExtras'
        ? contestacaoItem.date
        : contestacaoTipo === 'ferias'
          ? `${contestacaoItem.dataInicio} a ${contestacaoItem.dataFim}`
          : contestacaoItem.data,
      resposta: contestacaoResposta,
      novaDataInicio: novaDataInicio ? formatDateBR(novaDataInicio) : '',
      novaDataFim: novaDataFim ? formatDateBR(novaDataFim) : '',
      novasHoras: novasHoras,
      motivo: contestacaoMotivo,
      status: 'pendente',
      dataCriacao: new Date().toLocaleDateString('pt-BR'),
    };
    // Atualizar estado local
    const novasContestacoes = [...contestacoesEnviadas, contestacao];
    setContestacoesEnviadas(novasContestacoes);
    // Salvar no localStorage
    localStorage.setItem('contestacoes', JSON.stringify(novasContestacoes));
    // Notificar administrador
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    adminNotifications.push({
      id: Date.now(),
      type: 'contestacao',
      message: `${userData.name} contestou ${getTipoLabel(contestacaoTipo)} de ${contestacao.dataOriginal}`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false,
      contestacaoId: contestacao.id
    });
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
    setShowContestarModal(false);
    alert('Contestação enviada com sucesso!');
  };

  // Renderizar botão de contestação com status
  const renderBotaoContestacao = (tipo, item) => {
    if (itemContestado(tipo, item.id)) {
      const status = getContestacaoStatus(tipo, item.id);
      
      if (status === 'aprovado') {
        return (
          <span className="text-xs text-green-400 font-medium">
            Contestação Aprovada
          </span>
        );
      } else if (status === 'rejeitado') {
        return (
          <span className="text-xs text-red-400 font-medium">
            Contestação Rejeitada
          </span>
        );
      } else {
        return (
          <span className="text-xs text-yellow-400 font-medium">
            Contestação Pendente
          </span>
        );
      }
    }
    
    return (
      <button
        onClick={() => abrirContestacao(tipo, item)}
        className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded"
      >
        Contestar
      </button>
    );
  };
  
  // Obter feedback de contestação para exibir nos detalhes do item
  const getContestacaoFeedback = (tipo, id) => {
    const contestacao = contestacoesEnviadas.find(c =>
      c.tipo === tipo && c.itemId === id && c.funcionarioId === userData.id
    );
    
    if (!contestacao || !contestacao.feedback_admin) return null;
    
    return contestacao.feedback_admin;
  };

  // FUNÇÕES PARA "MEUS DADOS APROVADOS"
  // Função para calcular dias entre duas datas
  const calcularDiasTotais = (inicio, fim) => {
    if (!inicio || !fim) return 0;
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    const diferenca = Math.abs(dataFim - dataInicio);
    return Math.ceil(diferenca / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir o dia final
  };
  
  // Dias totais de férias
  const diasTotaisFerias = calcularDiasTotais(dataInicioFerias, dataFimFerias);
  
  // Função para formatar data do formato YYYY-MM-DD para DD/MM/YYYY
  const formatarData = (data) => {
    if (!data) return '';
    if (data.includes('/')) return data;
    
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };
  
  // Função para enviar solicitação de férias para aprovação do admin
  const enviarSolicitacaoFerias = (e) => {
    e.preventDefault();
    
    if (!dataInicioFerias || !dataFimFerias || !justificativaFerias) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    if (diasTotaisFerias > 31) {
      alert('O período de férias não pode exceder 31 dias.');
      return;
    }

    // Criar solicitação
    const novaSolicitacao = {
      id: Date.now(),
      funcionarioId: userData.id,
      funcionarioNome: userData.name,
      dataInicio: formatarData(dataInicioFerias),
      dataFim: formatarData(dataFimFerias),
      diasTotais: diasTotaisFerias,
      justificativa: justificativaFerias,
      status: 'pendente',
      dataSolicitacao: new Date().toLocaleDateString('pt-BR')
    };

    // Salvar no localStorage para o admin aprovar
    const feriasEntries = JSON.parse(localStorage.getItem('feriasEntries') || '[]');
    const updatedFeriasEntries = [...feriasEntries, novaSolicitacao];
    localStorage.setItem('feriasEntries', JSON.stringify(updatedFeriasEntries));
    setFeriasEntries(prevEntries => [...prevEntries, novaSolicitacao]);

    // Criar notificação para o admin
    const adminNotification = {
      id: Date.now() + Math.random(),
      message: `${userData.name} solicitou férias: ${formatarData(dataInicioFerias)} até ${formatarData(dataFimFerias)}`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    };
    
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    localStorage.setItem('adminNotifications', JSON.stringify([adminNotification, ...adminNotifications]));

    // Limpar formulário e mostrar confirmação
    setDataInicioFerias('');
    setDataFimFerias('');
    setJustificativaFerias('');
    alert('Solicitação de férias enviada para aprovação do administrador.');
  };

  // Função para enviar solicitação de folga
  const enviarSolicitacaoFolga = (e) => {
    e.preventDefault();
    
    if (!dataFolga || !justificativaFolga) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    // Criar solicitação
    const novaSolicitacao = {
      id: Date.now(),
      funcionarioId: userData.id,
      funcionarioNome: userData.name,
      data: formatarData(dataFolga),
      tipo: tipoFolga,
      periodo: periodoFolga,
      motivo: justificativaFolga,
      status: 'pendente',
      dataSolicitacao: new Date().toLocaleDateString('pt-BR')
    };

    // Salvar no localStorage para o admin aprovar
    const folgaEntries = JSON.parse(localStorage.getItem('folgaEntries') || '[]');
    const updatedFolgaEntries = [...folgaEntries, novaSolicitacao];
    localStorage.setItem('folgaEntries', JSON.stringify(updatedFolgaEntries));
    setFolgasEntries(prevEntries => [...prevEntries, novaSolicitacao]);

    // Criar notificação para o admin
    const adminNotification = {
      id: Date.now() + Math.random(),
      message: `${userData.name} solicitou folga para o dia ${formatarData(dataFolga)}`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    };
    
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    localStorage.setItem('adminNotifications', JSON.stringify([adminNotification, ...adminNotifications]));

    // Limpar formulário e mostrar confirmação
    setDataFolga('');
    setJustificativaFolga('');
    setTipoFolga('Abono');
    setPeriodoFolga('Dia Inteiro');
    alert('Solicitação de folga enviada para aprovação do administrador.');
  };

  // Função para renderizar status
  const renderizarStatus = (status) => {
    switch(status) {
      case 'aprovado':
        return <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs">APROVADO</span>;
      case 'pendente':
        return <span className="px-2 py-1 bg-yellow-600 text-white rounded-full text-xs">PENDENTE</span>;
      case 'rejeitado':
        return <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs">REJEITADO</span>;
      default:
        return status;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
      {/* Botão Dados do Colaborador */}
      <button
        onClick={() => setShowModal(true)}
        className="w-full sm:w-64 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold py-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
      >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
</svg>
        Dados do Colaborador
      </button>
      
      {/* Botão Meus Dados Aprovados */}
      <button
        onClick={() => setShowApprovedModal(true)}
        className="w-full sm:w-64 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold py-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Meus Dados Aprovados
      </button>
      
      {/* Modal com os dados aprovados */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Dados do Administrador</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-purple-300 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Tabs de navegação */}
            <div className="mb-6">
              <div className="flex overflow-x-auto space-x-2 bg-purple-800 bg-opacity-30 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('horasExtras')}
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'horasExtras' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
                >
                  Horas Extras
                </button>
                <button
                  onClick={() => setActiveTab('ferias')}
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'ferias' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
                >
                  Férias
                </button>
                <button
                  onClick={() => setActiveTab('folgas')}
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'folgas' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
                >
                  Folgas
                </button>
                <button
                  onClick={() => setActiveTab('bancoHoras')}
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'bancoHoras' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
                >
                  Banco de Horas
                </button>
                <button
                  onClick={() => setActiveTab('ausencias')}
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'ausencias' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
                >
                  Ausências
                </button>
                <button
                  onClick={() => setActiveTab('jornada')}
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'jornada' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
                >
                  Jornada de Trabalho
                </button>
              </div>
            </div>
            
            {/* Conteúdo das abas */}
            <div className="bg-purple-800 bg-opacity-30 rounded-lg p-4">
              
              {/* Aba de Horas Extras */}
              {activeTab === 'horasExtras' && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Horas Extras Aprovadas</h4>
                  {horasExtrasApproved.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-purple-300 text-sm border-b border-purple-700">
                            <th className="px-4 py-2 text-left">Data</th>
                            <th className="px-4 py-2 text-left">Horas</th>
                            <th className="px-4 py-2 text-left">Motivo</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Detalhes</th>
                            <th className="px-4 py-2 text-left">Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {horasExtrasApproved.map((item) => (
                            <tr key={item.id} className="border-b border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                              <td className="px-4 py-3">{item.date}</td>
                              <td className="px-4 py-3">{item.hours}h</td>
                              <td className="px-4 py-3">
                                <div className="truncate max-w-xs" title={item.reason}>
                                  {item.reason}
                                </div>
                              </td>
                              <td className="px-4 py-3">{renderStatus(item.status)}</td>
                              <td className="px-4 py-3">
                                {item.observacao && (
                                  <div className="text-sm text-purple-300">
                                    <strong>Observação:</strong> {item.observacao}
                                  </div>
                                )}
                                {getContestacaoFeedback('horasExtras', item.id) && (
                                  <div className="text-sm text-purple-300">
                                    <strong>Observação:</strong> Alterado via contestação: {getContestacaoFeedback('horasExtras', item.id)}
                                  </div>
                                )}
                                {item.auto && (
                                  <span className="text-xs bg-blue-800 text-blue-200 px-2 py-1 rounded">
                                    Detectado automaticamente
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {renderBotaoContestacao('horasExtras', item)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-purple-300 py-4">Nenhuma hora extra aprovada encontrada.</p>
                  )}
                  
                  {/* Dashboard de resumo */}
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-purple-700 bg-opacity-40 rounded-lg p-4">
                      <h5 className="font-semibold mb-2">Total de Horas</h5>
                      <p className="text-2xl">
                        {horasExtrasApproved.reduce((total, item) => total + item.hours, 0).toFixed(1)}h
                      </p>
                    </div>
                    <div className="bg-purple-700 bg-opacity-40 rounded-lg p-4">
                      <h5 className="font-semibold mb-2">Total de Registros</h5>
                      <p className="text-2xl">{horasExtrasApproved.length}</p>
                    </div>
                    <div className="bg-purple-700 bg-opacity-40 rounded-lg p-4">
                      <h5 className="font-semibold mb-2">Último Registro</h5>
                      <p className="text-xl">
                        {horasExtrasApproved.length > 0
                          ? horasExtrasApproved[0].date
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  {/* Seção de contestações recentes */}
                  <div className="mt-6 bg-purple-900 bg-opacity-40 rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-2">Contestações Recentes</h4>
                    {contestacoesEnviadas
                      .filter(c => c.tipo === 'horasExtras' && c.funcionarioId === userData.id)
                      .length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-purple-300 text-sm border-b border-purple-700">
                              <th className="px-4 py-2 text-left">Data Original</th>
                              <th className="px-4 py-2 text-left">Resposta</th>
                              <th className="px-4 py-2 text-left">Nova Data/Horas</th>
                              <th className="px-4 py-2 text-left">Motivo</th>
                              <th className="px-4 py-2 text-left">Status</th>
                              <th className="px-4 py-2 text-left">Feedback</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contestacoesEnviadas
                              .filter(c => c.tipo === 'horasExtras' && c.funcionarioId === userData.id)
                              .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
                              .slice(0, 5)
                              .map(item => (
                                <tr key={item.id} className="border-b border-purple-700">
                                  <td className="px-4 py-3">{item.dataOriginal}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      item.resposta === 'concordar' ? 'bg-green-600' :
                                      item.resposta === 'discordar' ? 'bg-red-600' :
                                      'bg-blue-600'
                                    }`}>
                                      {item.resposta === 'concordar' ? 'CONCORDO' :
                                       item.resposta === 'discordar' ? 'DISCORDO' :
                                       'REAGENDAR'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.resposta === 'reagendar' ? 
                                      `${item.novaDataInicio} (${item.novasHoras}h)` : '-'}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="truncate max-w-xs" title={item.motivo}>
                                      {item.motivo || '-'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      item.status === 'aprovado' ? 'bg-green-600' :
                                      item.status === 'rejeitado' ? 'bg-red-600' :
                                      'bg-yellow-600'
                                    }`}>
                                      {item.status.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.feedback_admin ? item.feedback_admin : 'Aguardando resposta'}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-purple-300 py-2">
                        Você ainda não enviou contestações para horas extras.
                      </p>
                    )}
                  </div>
                </div>
              )}
              
             {/* Aba de Férias */}
             {activeTab === 'ferias' && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Férias Aprovadas</h4>
                  {feriasApproved.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-purple-300 text-sm border-b border-purple-700">
                            <th className="px-4 py-2 text-left">Período</th>
                            <th className="px-4 py-2 text-left">Dias</th>
                            <th className="px-4 py-2 text-left">Observação</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Detalhes</th>
                            <th className="px-4 py-2 text-left">Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feriasApproved.map((item) => (
                            <tr key={item.id} className="border-b border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                              <td className="px-4 py-3">{item.dataInicio} a {item.dataFim}</td>
                              <td className="px-4 py-3">{item.diasTotais} dias</td>
                              <td className="px-4 py-3">
                                <div className="truncate max-w-xs" title={item.observacao}>
                                  {item.observacao || '-'}
                                </div>
                              </td>
                              <td className="px-4 py-3">{renderStatus(item.status)}</td>
                              <td className="px-4 py-3">
                                {item.motivo_aprovacao && (
                                  <div className="text-sm text-green-300">
                                    <strong>Nota:</strong> {item.motivo_aprovacao}
                                  </div>
                                )}
                                {getContestacaoFeedback('ferias', item.id) && (
                                  <div className="text-sm text-purple-300">
                                    <strong>Observação:</strong> Alterado via contestação: {getContestacaoFeedback('ferias', item.id)}
                                  </div>
                                )}
                                {item.compensacao && (
                                  <div className="text-sm text-blue-300">
                                    <strong>Compensação:</strong> {item.compensacao}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {renderBotaoContestacao('ferias', item)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-purple-300 py-4">Nenhuma férias aprovada encontrada.</p>
                  )}
                  
                  {/* Seção de contestações recentes */}
                  <div className="mt-6 bg-purple-900 bg-opacity-40 rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-2">Contestações Recentes</h4>
                    {contestacoesEnviadas
                      .filter(c => c.tipo === 'ferias' && c.funcionarioId === userData.id)
                      .length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-purple-300 text-sm border-b border-purple-700">
                              <th className="px-4 py-2 text-left">Data Original</th>
                              <th className="px-4 py-2 text-left">Resposta</th>
                              <th className="px-4 py-2 text-left">Nova Data/Horas</th>
                              <th className="px-4 py-2 text-left">Motivo</th>
                              <th className="px-4 py-2 text-left">Status</th>
                              <th className="px-4 py-2 text-left">Feedback</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contestacoesEnviadas
                              .filter(c => c.tipo === 'ferias' && c.funcionarioId === userData.id)
                              .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
                              .slice(0, 5)
                              .map(item => (
                                <tr key={item.id} className="border-b border-purple-700">
                                  <td className="px-4 py-3">{item.dataOriginal}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      item.resposta === 'concordar' ? 'bg-green-600' :
                                      item.resposta === 'discordar' ? 'bg-red-600' :
                                      'bg-blue-600'
                                    }`}>
                                      {item.resposta === 'concordar' ? 'CONCORDO' :
                                       item.resposta === 'discordar' ? 'DISCORDO' :
                                       'REAGENDAR'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.resposta === 'reagendar' ? 
                                      `${item.novaDataInicio} a ${item.novaDataFim}` : '-'}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="truncate max-w-xs" title={item.motivo}>
                                      {item.motivo || '-'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      item.status === 'aprovado' ? 'bg-green-600' :
                                      item.status === 'rejeitado' ? 'bg-red-600' :
                                      'bg-yellow-600'
                                    }`}>
                                      {item.status.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.feedback_admin ? item.feedback_admin : 'Aguardando resposta'}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-purple-300 py-2">
                        Você ainda não enviou contestações para férias.
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Aba de Folgas */}
              {activeTab === 'folgas' && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Folgas Aprovadas</h4>
                  {folgasApproved.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-purple-300 text-sm border-b border-purple-700">
                            <th className="px-4 py-2 text-left">Data</th>
                            <th className="px-4 py-2 text-left">Tipo</th>
                            <th className="px-4 py-2 text-left">Período</th>
                            <th className="px-4 py-2 text-left">Motivo</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Detalhes</th>
                            <th className="px-4 py-2 text-left">Ação</th>
                          </tr>
                        </thead>
                        <tbody>
                          {folgasApproved.map((item) => (
                            <tr key={item.id} className="border-b border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                              <td className="px-4 py-3">{item.data}</td>
                              <td className="px-4 py-3">{item.tipo}</td>
                              <td className="px-4 py-3">
                                {item.periodo === 'dia' ? 'Dia inteiro' :
                                 item.periodo === 'manhã' ? 'Manhã' : 'Tarde'}
                              </td>
                              <td className="px-4 py-3">
                                <div className="truncate max-w-xs" title={item.motivo}>
                                  {item.motivo || '-'}
                                </div>
                              </td>
                              <td className="px-4 py-3">{renderStatus(item.status)}</td>
                              <td className="px-4 py-3">
                                {getContestacaoFeedback('folgas', item.id) && (
                                  <div className="text-sm text-purple-300">
                                    <strong>Observação:</strong> Alterado via contestação: {getContestacaoFeedback('folgas', item.id)}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {renderBotaoContestacao('folgas', item)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-purple-300 py-4">Nenhuma folga aprovada encontrada.</p>
                  )}
                  
                  {/* Seção de contestações recentes */}
                  <div className="mt-6 bg-purple-900 bg-opacity-40 rounded-lg p-4">
                    <h4 className="text-lg font-semibold mb-2">Contestações Recentes</h4>
                    {contestacoesEnviadas
                      .filter(c => c.tipo === 'folgas' && c.funcionarioId === userData.id)
                      .length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="text-purple-300 text-sm border-b border-purple-700">
                              <th className="px-4 py-2 text-left">Data Original</th>
                              <th className="px-4 py-2 text-left">Resposta</th>
                              <th className="px-4 py-2 text-left">Nova Data/Horas</th>
                              <th className="px-4 py-2 text-left">Motivo</th>
                              <th className="px-4 py-2 text-left">Status</th>
                              <th className="px-4 py-2 text-left">Feedback</th>
                            </tr>
                          </thead>
                          <tbody>
                            {contestacoesEnviadas
                              .filter(c => c.tipo === 'folgas' && c.funcionarioId === userData.id)
                              .sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao))
                              .slice(0, 5)
                              .map(item => (
                                <tr key={item.id} className="border-b border-purple-700">
                                  <td className="px-4 py-3">{item.dataOriginal}</td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      item.resposta === 'concordar' ? 'bg-green-600' :
                                      item.resposta === 'discordar' ? 'bg-red-600' :
                                      'bg-blue-600'
                                    }`}>
                                      {item.resposta === 'concordar' ? 'CONCORDO' :
                                       item.resposta === 'discordar' ? 'DISCORDO' :
                                       'REAGENDAR'}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.resposta === 'reagendar' ? item.novaDataInicio : '-'}
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="truncate max-w-xs" title={item.motivo}>
                                      {item.motivo || '-'}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                      item.status === 'aprovado' ? 'bg-green-600' :
                                      item.status === 'rejeitado' ? 'bg-red-600' :
                                      'bg-yellow-600'
                                    }`}>
                                      {item.status.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    {item.feedback_admin ? item.feedback_admin : 'Aguardando resposta'}
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-purple-300 py-2">
                        Você ainda não enviou contestações para folgas.
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Aba de Banco de Horas */}
              {activeTab === 'bancoHoras' && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Banco de Horas</h4>
                  {bancoHoras ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-purple-700 bg-opacity-40 rounded-lg p-4">
                        <p className="text-sm text-purple-300 mb-1">Saldo Atual</p>
                        <p className={`text-4xl font-bold ${bancoHoras.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {bancoHoras.saldo.toFixed(1)}h
                        </p>
                        <p className="text-xs text-purple-300 mt-2">
                          Atualizado em: {bancoHoras.ultimaAtualizacao}
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4">
                          <h5 className="font-semibold mb-2">Horas Extras Totais</h5>
                          <p className="text-2xl">
                            {horasExtrasApproved.reduce((total, item) => total + item.hours, 0).toFixed(1)}h
                          </p>
                        </div>
                        <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4">
                          <h5 className="font-semibold mb-2">Horas Utilizadas</h5>
                          <p className="text-2xl">
                            {folgasApproved
                              .filter(item => item.tipo === 'banco de horas')
                              .reduce((total, item) => total + (item.periodo === 'dia' ? 8 : 4), 0)}h
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-purple-300 py-4">Informações de banco de horas não disponíveis.</p>
                  )}
                </div>
              )}

              {/* Aba de Ausências */}
              {activeTab === 'ausencias' && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Ausências Registradas</h4>
                  {ausenciasApproved.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-purple-300 text-sm border-b border-purple-700">
                            <th className="px-4 py-2 text-left">Data</th>
                            <th className="px-4 py-2 text-left">Tipo</th>
                            <th className="px-4 py-2 text-left">Justificativa</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Detalhes</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ausenciasApproved.map((item) => (
                            <tr key={item.id} className="border-b border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                              <td className="px-4 py-3">{item.date}</td>
                              <td className="px-4 py-3">{item.type}</td>
                              <td className="px-4 py-3">
                                <div className="truncate max-w-xs" title={item.justification}>
                                  {item.justification || '-'}
                                </div>
                              </td>
                              <td className="px-4 py-3">{renderStatus(item.status)}</td>
                              <td className="px-4 py-3">
                                {item.admin_comment && (
                                  <div className="text-sm text-purple-300">
                                    <strong>Observação:</strong> {item.admin_comment}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-purple-300 py-4">Nenhuma ausência registrada encontrada.</p>
                  )}
                </div>
              )}

              {/* Aba de Jornada */}
              {activeTab === 'jornada' && (
                <div>
                  <h4 className="text-lg font-semibold mb-4">Jornada de Trabalho</h4>
                  {jornada ? (
                    <div className="bg-purple-700 bg-opacity-40 rounded-lg p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h5 className="font-semibold mb-3">Horário Regular</h5>
                          <table className="w-full">
                            <thead>
                              <tr className="text-purple-300 text-sm border-b border-purple-700">
                                <th className="px-4 py-2 text-left">Dia</th>
                                <th className="px-4 py-2 text-left">Entrada</th>
                                <th className="px-4 py-2 text-left">Saída</th>
                              </tr>
                            </thead>
                            <tbody>
                              {jornada.horarios.map((horario, index) => (
                                <tr key={index} className="border-b border-purple-700">
                                  <td className="px-4 py-3">{horario.dia}</td>
                                  <td className="px-4 py-3">{horario.entrada}</td>
                                  <td className="px-4 py-3">{horario.saida}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div>
                          <h5 className="font-semibold mb-3">Informações Adicionais</h5>
                          <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4 mb-4">
                            <p className="text-sm text-purple-300 mb-1">Carga Horária Semanal</p>
                            <p className="text-2xl">{jornada.cargaHorariaSemanal}h</p>
                          </div>
                          <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4">
                            <p className="text-sm text-purple-300 mb-1">Intervalo</p>
                            <p className="text-xl">{jornada.intervalo} minutos</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-purple-300 py-4">Informações de jornada não disponíveis.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Modal de contestação */}
      {showContestarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Contestar {
                contestacaoTipo === 'horasExtras' ? 'Hora Extra' :
                contestacaoTipo === 'ferias' ? 'Férias' : 'Folga'
              }</h3>
              <button
                onClick={() => setShowContestarModal(false)}
                className="text-purple-300 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <div className="text-sm text-purple-300 mb-1">Data Original</div>
              <div className="font-semibold">
                {contestacaoTipo === 'horasExtras'
                  ? contestacaoItem?.date
                  : contestacaoTipo === 'ferias'
                    ? `${contestacaoItem?.dataInicio} a ${contestacaoItem?.dataFim}`
                    : contestacaoItem?.data}
              </div>
            </div>

            {contestacaoTipo === 'horasExtras' && (
              <div className="mb-4">
                <div className="text-sm text-purple-300 mb-1">Horas Registradas</div>
                <div className="font-semibold">{contestacaoItem?.hours}h</div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-purple-200 mb-2">Como deseja responder?</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setContestacaoResposta('concordar')}
                  className={`px-3 py-2 text-sm rounded-md ${contestacaoResposta === 'concordar' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-purple-800 text-purple-300'}`}
                >
                  Concordar
                </button>
                <button
                  onClick={() => setContestacaoResposta('discordar')}
                  className={`px-3 py-2 text-sm rounded-md ${contestacaoResposta === 'discordar' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-purple-800 text-purple-300'}`}
                >
                  Discordar
                </button>
                <button
                  onClick={() => setContestacaoResposta('reagendar')}
                  className={`px-3 py-2 text-sm rounded-md ${contestacaoResposta === 'reagendar' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-purple-800 text-purple-300'}`}
                >
                  Reagendar
                </button>
              </div>
            </div>

            {contestacaoResposta === 'reagendar' && (
              <div className="mb-4">
                <label className="block text-sm text-purple-200 mb-2">Nova Data</label>
                {contestacaoTipo === 'horasExtras' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-purple-300 mb-1">Data</label>
                      <input
                        type="date"
                        value={novaDataInicio}
                        onChange={(e) => setNovaDataInicio(e.target.value)}
                        className="w-full bg-purple-800 border border-purple-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-purple-300 mb-1">Horas</label>
                      <input
                        type="number"
                        value={novasHoras}
                        onChange={(e) => setNovasHoras(e.target.value)}
                        className="w-full bg-purple-800 border border-purple-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}
                {contestacaoTipo === 'ferias' && (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-purple-300 mb-1">Data Início</label>
                      <input
                        type="date"
                        value={novaDataInicio}
                        onChange={(e) => setNovaDataInicio(e.target.value)}
                        className="w-full bg-purple-800 border border-purple-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-purple-300 mb-1">Data Fim</label>
                      <input
                        type="date"
                        value={novaDataFim}
                        onChange={(e) => setNovaDataFim(e.target.value)}
                        className="w-full bg-purple-800 border border-purple-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                )}
                {contestacaoTipo === 'folgas' && (
                  <div>
                    <input
                      type="date"
                      value={novaDataInicio}
                      onChange={(e) => setNovaDataInicio(e.target.value)}
                      className="w-full bg-purple-800 border border-purple-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-purple-200 mb-2">Motivo da Contestação</label>
              <textarea
                value={contestacaoMotivo}
                onChange={(e) => setContestacaoMotivo(e.target.value)}
                placeholder="Descreva o motivo da contestação..."
                className="w-full bg-purple-800 border border-purple-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
              ></textarea>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowContestarModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={enviarContestacao}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md"
                disabled={
                  !contestacaoMotivo ||
                  (contestacaoResposta === 'reagendar' &&
                    (
                      (contestacaoTipo === 'horasExtras' && (!novaDataInicio || !novasHoras)) ||
                      (contestacaoTipo === 'ferias' && (!novaDataInicio || !novaDataFim)) ||
                      (contestacaoTipo === 'folgas' && !novaDataInicio)
                    ))
                }
              >
                Enviar Contestação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Meus Dados Aprovados */}
      {showApprovedModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Meus Dados Aprovados</h2>
              <button
                onClick={() => setShowApprovedModal(false)}
                className="text-purple-300 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            

            {/* Banco de Horas */}
            {bancoHoras && (
              <div className="bg-purple-900 bg-opacity-40 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-purple-200 mb-2">Banco de Horas</h4>
                    <p className={`text-3xl font-bold ${bancoHoras.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {bancoHoras.saldo.toFixed(1)}h
                    </p>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-purple-300 mt-2">
                  Última atualização: {bancoHoras.ultimaAtualizacao}
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="mb-6">
              <div className="flex border-b border-purple-700">
                <button
                  onClick={() => setActiveApprovedTab('ferias')}
                  className={`w-1/2 py-3 text-center font-semibold ${
                    activeApprovedTab === 'ferias' 
                      ? 'bg-purple-700 text-white' 
                      : 'text-purple-300 hover:bg-purple-800'
                  }`}
                >
                  Férias
                </button>
                <button
                  onClick={() => setActiveApprovedTab('folgas')}
                  className={`w-1/2 py-3 text-center font-semibold ${
                    activeApprovedTab === 'folgas' 
                      ? 'bg-purple-700 text-white' 
                      : 'text-purple-300 hover:bg-purple-800'
                  }`}
                >
                  Folgas
                </button>
              </div>
            </div>

            {/* Conteúdo com base na tab ativa */}
            {activeApprovedTab === 'ferias' ? (
              <div className="space-y-6">
                {/* Formulário de solicitação de férias */}
                <div className="bg-purple-800 bg-opacity-30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Solicitar Férias</h3>
                  <form onSubmit={enviarSolicitacaoFerias}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Data de Início *</label>
                        <input
                          type="date"
                          value={dataInicioFerias}
                          onChange={(e) => setDataInicioFerias(e.target.value)}
                          className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Data de Fim *</label>
                        <input
                          type="date"
                          value={dataFimFerias}
                          onChange={(e) => setDataFimFerias(e.target.value)}
                          className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    </div>

                    {dataInicioFerias && dataFimFerias && (
                      <div className="mb-4">
                        <div className={`bg-purple-900 p-3 rounded-md ${diasTotaisFerias > 31 ? 'bg-red-900' : ''}`}>
                          <p className="text-sm">Período total: <span className="font-bold">{diasTotaisFerias} dias</span></p>
                          {diasTotaisFerias > 31 && (
                            <p className="text-red-300 text-sm mt-1">O período máximo permitido é de 31 dias.</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Justificativa *</label>
                      <textarea
                        value={justificativaFerias}
                        onChange={(e) => setJustificativaFerias(e.target.value)}
                        className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-20"
                        placeholder="Descreva o motivo da solicitação de férias..."
                        required
                      ></textarea>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md"
                        disabled={diasTotaisFerias > 31}
                      >
                        Enviar Solicitação
                      </button>
                    </div>
                  </form>
                </div>

                {/* Lista de solicitações de férias */}
                <div className="bg-purple-800 bg-opacity-30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Minhas Solicitações de Férias</h3>
                  
                  {feriasEntries.length === 0 ? (
                    <p className="text-center text-purple-300 py-4">Nenhuma solicitação de férias encontrada.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-purple-300 border-b border-purple-700">
                            <th className="py-2 px-4">Período</th>
                            <th className="py-2 px-4">Dias</th>
                            <th className="py-2 px-4">Justificativa</th>
                            <th className="py-2 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feriasEntries.map(ferias => (
                            <tr key={ferias.id} className="border-b border-purple-800 hover:bg-purple-800 hover:bg-opacity-30">
                              <td className="py-3 px-4">{ferias.dataInicio} a {ferias.dataFim}</td>
                              <td className="py-3 px-4">{ferias.diasTotais} dias</td>
                              <td className="py-3 px-4">
                                <div className="truncate max-w-xs" title={ferias.justificativa}>
                                  {ferias.justificativa}
                                </div>
                              </td>
                              <td className="py-3 px-4">{renderizarStatus(ferias.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Formulário de solicitação de folga */}
                <div className="bg-purple-800 bg-opacity-30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Solicitar Folga</h3>
                  <form onSubmit={enviarSolicitacaoFolga}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Data da Folga *</label>
                        <input
                          type="date"
                          value={dataFolga}
                          onChange={(e) => setDataFolga(e.target.value)}
                          className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Tipo de Folga *</label>
                        <select
                          value={tipoFolga}
                          onChange={(e) => setTipoFolga(e.target.value)}
                          className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        >
                          <option value="abono">Abono</option>
                          <option value="banco de horas">Banco de Horas</option>
                          <option value="compensação">Compensação</option>
                        </select>
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Período *</label>
                      <select
                        value={periodoFolga}
                        onChange={(e) => setPeriodoFolga(e.target.value)}
                        className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        <option value="dia">Dia inteiro</option>
                        <option value="manhã">Manhã</option>
                        <option value="tarde">Tarde</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium mb-2">Justificativa *</label>
                      <textarea
                        value={justificativaFolga}
                        onChange={(e) => setJustificativaFolga(e.target.value)}
                        className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-20"
                        placeholder="Descreva o motivo da solicitação de folga..."
                        required
                      ></textarea>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md"
                      >
                        Enviar Solicitação
                      </button>
                    </div>
                  </form>
                </div>

                {/* Lista de solicitações de folgas */}
                <div className="bg-purple-800 bg-opacity-30 rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Minhas Solicitações de Folgas</h3>
                  
                  {folgasEntries.length === 0 ? (
                    <p className="text-center text-purple-300 py-4">Nenhuma solicitação de folga encontrada.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-sm text-purple-300 border-b border-purple-700">
                            <th className="py-2 px-4">Data</th>
                            <th className="py-2 px-4">Tipo</th>
                            <th className="py-2 px-4">Período</th>
                            <th className="py-2 px-4">Motivo</th>
                            <th className="py-2 px-4">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {folgasEntries.map(folga => (
                            <tr key={folga.id} className="border-b border-purple-800 hover:bg-purple-800 hover:bg-opacity-30">
                              <td className="py-3 px-4">{folga.data}</td>
                              <td className="py-3 px-4">{folga.tipo}</td>
                              <td className="py-3 px-4">{folga.periodo}</td>
                              <td className="py-3 px-4">
                                <div className="truncate max-w-xs" title={folga.motivo}>
                                  {folga.motivo}
                                </div>
                              </td>
                              <td className="py-3 px-4">{renderizarStatus(folga.status)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovedDataComponent;
