import React, { useState, useEffect } from 'react';

const SimplifiedApprovedDataComponent = () => {
  // Estado para modais
  const [showAdminDataModal, setShowAdminDataModal] = useState(false);
  const [showApprovedDataModal, setShowApprovedDataModal] = useState(false);
  const [activeTab, setActiveTab] = useState('horasExtras');
  const [activeApprovedTab, setActiveApprovedTab] = useState('ferias');
  
  // Obter dados do usuário logado
  const [userData] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      id: storedUser.id || 1,
      name: storedUser.name || 'Usuário',
      email: storedUser.email || ''
    };
  });

  // Estado para contestações
  const [contestacoesEnviadas, setContestacoesEnviadas] = useState(() => {
    const stored = localStorage.getItem('contestacoes');
    return stored ? JSON.parse(stored) : [];
  });
  
  // Estados para armazenar os dados
  const [horasExtrasApproved, setHorasExtrasApproved] = useState([]);
  const [feriasApproved, setFeriasApproved] = useState([]);
  const [folgasApproved, setFolgasApproved] = useState([]);
  const [bancoHoras, setBancoHoras] = useState(null);
  const [ausenciasApproved, setAusenciasApproved] = useState([]);
  const [jornada, setJornada] = useState(null);
  
  // Estados para solicitações
  const [feriasEntries, setFeriasEntries] = useState([]);
  const [folgasEntries, setFolgasEntries] = useState([]);
  
  // Estado para o modal de contestação
  const [showContestarModal, setShowContestarModal] = useState(false);
  const [contestacaoItem, setContestacaoItem] = useState(null);
  const [contestacaoTipo, setContestacaoTipo] = useState('');
  const [contestacaoMotivo, setContestacaoMotivo] = useState('');
  const [contestacaoResposta, setContestacaoResposta] = useState('concordar');
  const [novaDataInicio, setNovaDataInicio] = useState('');
  const [novaDataFim, setNovaDataFim] = useState('');
  const [novasHoras, setNovasHoras] = useState('');
  
  // Estados para formulários
  const [dataInicioFerias, setDataInicioFerias] = useState('');
  const [dataFimFerias, setDataFimFerias] = useState('');
  const [justificativaFerias, setJustificativaFerias] = useState('');
  const [dataFolga, setDataFolga] = useState('');
  const [justificativaFolga, setJustificativaFolga] = useState('');
  const [tipoFolga, setTipoFolga] = useState('abono');
  const [periodoFolga, setPeriodoFolga] = useState('dia');

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
        // Dados padrão
        setBancoHoras({
          saldo: 12.5,
          ultimaAtualizacao: new Date().toLocaleDateString('pt-BR')
        });
      }
    } else {
      // Dados padrão
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

  // Função para formatar data para o formato de input date
  function formatDateToInputDate(date) {
    if (!date) return '';
    if (date.includes('-')) return date;
    
    const [dia, mes, ano] = date.split('/');
    return `${ano}-${mes}-${dia}`;
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
      case 'ausencias':
        return 'ausência';
      case 'bancoHoras':
        return 'banco de horas';
      case 'jornada':
        return 'jornada de trabalho';
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
          <span className="text-xs text-green-400 font-medium bg-green-900 px-2 py-1 rounded">
            Contestação Aprovada
          </span>
        );
      } else if (status === 'rejeitado') {
        return (
          <span className="text-xs text-red-400 font-medium bg-red-900 px-2 py-1 rounded">
            Contestação Rejeitada
          </span>
        );
      } else {
        return (
          <span className="text-xs text-yellow-400 font-medium bg-yellow-900 px-2 py-1 rounded">
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

  // Renderizar card de contestações para cada tab 
  const renderContestacoes = (tipo) => {
    const contestacoesFiltradas = contestacoesEnviadas
      .filter(c => c.tipo === tipo && c.funcionarioId === userData.id);
      
    if (contestacoesFiltradas.length === 0) {
      return (
        <p className="text-center text-purple-300 py-2">
          Você ainda não enviou contestações para {getTipoLabel(tipo)}.
        </p>
      );
    }
    
    return (
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
            {contestacoesFiltradas
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
                      (tipo === 'ferias' ? 
                        `${item.novaDataInicio} a ${item.novaDataFim}` : 
                        tipo === 'horasExtras' ?
                          `${item.novaDataInicio} (${item.novasHoras}h)` :
                          item.novaDataInicio
                      ) : '-'}
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
    );
  };

  // Calcular dias entre duas datas
  const calcularDiasTotais = (inicio, fim) => {
    if (!inicio || !fim) return 0;
    const dataInicio = new Date(inicio);
    const dataFim = new Date(fim);
    const diferenca = Math.abs(dataFim - dataInicio);
    return Math.ceil(diferenca / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir o dia final
  };
  
  // Dias totais de férias
  const diasTotaisFerias = calcularDiasTotais(dataInicioFerias, dataFimFerias);
  
  // Formatar data do formato YYYY-MM-DD para DD/MM/YYYY
  const formatarData = (data) => {
    if (!data) return '';
    if (data.includes('/')) return data;
    
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  };
  
  // Enviar solicitação de férias para aprovação do admin
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

  // Enviar solicitação de folga
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
    setTipoFolga('abono');
    setPeriodoFolga('dia');
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
      {/* Botão Dados do Administrador */}
      <button
        onClick={() => setShowAdminDataModal(true)}
        className="w-full sm:w-64 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold py-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Dados do Administrador
      </button>
      
      {/* Botão Meus Dados Aprovados */}
      <button
        onClick={() => setShowApprovedDataModal(true)}
        className="w-full sm:w-64 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold py-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Meus Dados Aprovados
      </button>
      
      {/* Os modais e sua lógica são incluídos quando necessário */}
      
      {/* Renderizar Modais apenas quando estão abertos */}
      {showAdminDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          {/* Componente completo do modal de Dados do Administrador */}
          {/* Conteúdo omitido por brevidade, seria carregado quando necessário */}
        </div>
      )}
      
      {showApprovedDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          {/* Componente completo do modal de Meus Dados Aprovados */}
          {/* Conteúdo omitido por brevidade, seria carregado quando necessário */}
        </div>
      )}
      
      {showContestarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          {/* Componente completo do modal de Contestação */}
          {/* Conteúdo omitido por brevidade, seria carregado quando necessário */}
        </div>
      )}
    </div>
  );
};

export default SimplifiedApprovedDataComponent;