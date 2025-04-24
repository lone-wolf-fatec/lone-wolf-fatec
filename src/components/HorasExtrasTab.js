import React, { useState, useEffect } from 'react';
import FeriasTab from './FeriasTab';
import FolgaTab from './FolgaTab';

const HorasExtrasTab = () => {
  // Estado para controlar as abas
  const [activeTab, setActiveTab] = useState('horasExtras');
  // Estados principais para horas extras
  const [overtimeEntries, setOvertimeEntries] = useState(() => {
    const storedOvertimes = localStorage.getItem('overtimeEntries');
    return storedOvertimes ? JSON.parse(storedOvertimes) : [
      {
        id: 1,
        funcionarioId: 101,
        funcionarioNome: 'João Silva',
        date: '10/03/2025',
        hours: 2,
        status: 'aprovado',
        reason: 'Finalização de projeto urgente'
      },
      {
        id: 2,
        funcionarioId: 102,
        funcionarioNome: 'Maria Oliveira',
        date: '05/03/2025',
        hours: 1.5,
        status: 'pendente',
        reason: 'Reunião com cliente internacional'
      },
      {
        id: 3,
        funcionarioId: 103,
        funcionarioNome: 'Carlos Pereira',
        date: '15/03/2025',
        hours: 3,
        status: 'pendente',
        reason: 'Implantação de novo sistema'
      },
      {
        id: 4,
        funcionarioId: 104,
        funcionarioNome: 'Ana Souza',
        date: '12/03/2025',
        hours: 1,
        status: 'rejeitado',
        reason: 'Treinamento de novos funcionários',
        observacao: 'Treinamento não autorizado previamente'
      },
      {
        id: 5,
        funcionarioId: 101,
        funcionarioNome: 'João Silva',
        date: '18/03/2025',
        hours: 2.5,
        status: 'detectado',
        reason: 'Detectado automaticamente',
        auto: true
      }
    ];
  });
  const [newOvertime, setNewOvertime] = useState({
    funcionarioId: '',
    funcionarioNome: '',
    date: '',
    hours: '',
    reason: ''
  });
  const [allFuncionarios, setAllFuncionarios] = useState([]);
  const [modalRejeitarAberto, setModalRejeitarAberto] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [observacaoRejeicao, setObservacaoRejeicao] = useState('');
  const [filtros, setFiltros] = useState({
    status: '',
    funcionario: '',
    periodo: ''
  });
  // Função para obter todos os funcionários possíveis
  const getAllPossibleFuncionarios = () => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const funcionariosFromUsers = registeredUsers.map(user => ({
        id: user.id,
        nome: user.name || user.nome
      }));
      const storedFuncionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
      const funcionariosFromOvertime = overtimeEntries.map(entry => ({
        id: entry.funcionarioId,
        nome: entry.funcionarioNome
      }));
      const funcionariosMap = new Map();
      [...funcionariosFromUsers, ...storedFuncionarios, ...funcionariosFromOvertime].forEach(func => {
        if (func && func.id) {
          funcionariosMap.set(func.id, func);
        }
      });
      return Array.from(funcionariosMap.values());
    } catch (error) {
      console.error('Erro ao obter funcionários:', error);
      return [];
    }
  };
  // useEffect para manter a lista de funcionários atualizada
  useEffect(() => {
    const updateAllFuncionarios = () => {
      const allPossible = getAllPossibleFuncionarios();
      setAllFuncionarios(allPossible);
    };
    updateAllFuncionarios();
    const interval = setInterval(updateAllFuncionarios, 2000);
    return () => clearInterval(interval);
  }, [overtimeEntries]);
  // Salvar horas extras no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('overtimeEntries', JSON.stringify(overtimeEntries));
  }, [overtimeEntries]);
  // Filtrar horas extras
  const horasExtrasFiltradas = overtimeEntries.filter(overtime => {
    const matchStatus = filtros.status === '' || overtime.status === filtros.status;
    const matchFuncionario = filtros.funcionario === '' || overtime.funcionarioNome === filtros.funcionario;
    let matchPeriodo = true;
    if (filtros.periodo === 'hoje') {
      matchPeriodo = overtime.date === new Date().toLocaleDateString('pt-BR');
    } else if (filtros.periodo === 'semana') {
      const hoje = new Date();
      const dataLimite = new Date();
      dataLimite.setDate(hoje.getDate() - 7);
      const partesData = overtime.date.split('/');
      const dataHoraExtra = new Date(
        parseInt(partesData[2]),
        parseInt(partesData[1]) - 1,
        parseInt(partesData[0])
      );
      matchPeriodo = dataHoraExtra >= dataLimite;
    }
    return matchStatus && matchFuncionario && matchPeriodo;
  });
  // Ordenar por data (mais recentes primeiro)
  const horasExtrasOrdenadas = [...horasExtrasFiltradas].sort((a, b) => {
    const [diaA, mesA, anoA] = a.date.split('/').map(Number);
    const [diaB, mesB, anoB] = b.date.split('/').map(Number);
    const dateA = new Date(anoA, mesA - 1, diaA);
    const dateB = new Date(anoB, mesB - 1, diaB);
    return dateB - dateA;
  });
  // Selecionar funcionário para nova hora extra
  const handleSelecionarFuncionario = (e) => {
    const funcionarioId = parseInt(e.target.value);
    if (funcionarioId) {
      const funcionarioSelecionado = allFuncionarios.find(f => f.id === funcionarioId);
      if (funcionarioSelecionado) {
        console.log("Funcionário selecionado:", funcionarioSelecionado);
        setNewOvertime({
          ...newOvertime,
          funcionarioId: funcionarioId,
          funcionarioNome: funcionarioSelecionado.nome
        });
      } else {
        console.warn("Funcionário não encontrado para ID:", funcionarioId);
      }
    } else {
      setNewOvertime({
        ...newOvertime,
        funcionarioId: '',
        funcionarioNome: ''
      });
    }
  };
  // Adicionar nova hora extra
  const handleAddOvertime = (e) => {
    e.preventDefault();
    if (!newOvertime.funcionarioId || !newOvertime.date || !newOvertime.hours || !newOvertime.reason) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    const overtime = {
      id: Date.now(),
      funcionarioId: newOvertime.funcionarioId,
      funcionarioNome: newOvertime.funcionarioNome,
      date: newOvertime.date,
      hours: parseFloat(newOvertime.hours),
      reason: newOvertime.reason,
      status: 'pendente'
    };
    setOvertimeEntries([overtime, ...overtimeEntries]);
    setNewOvertime({
      funcionarioId: '',
      funcionarioNome: '',
      date: '',
      hours: '',
      reason: ''
    });
    const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    notificacoes.push({
      id: Date.now(),
      userId: overtime.funcionarioId,
      message: `Hora extra registrada para ${overtime.date}: ${overtime.hours}h.`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    });
    localStorage.setItem('userNotifications', JSON.stringify(notificacoes));
    alert('Hora extra registrada com sucesso!');
  };
  // Função para alterar status (aprovação/rejeição)
  const changeStatus = (id, newStatus) => {
    const entryIndex = overtimeEntries.findIndex(entry => entry.id === id);
    if (entryIndex === -1) return;
    const updatedEntries = [...overtimeEntries];
    updatedEntries[entryIndex] = {
      ...updatedEntries[entryIndex],
      status: newStatus
    };
    if (newStatus === 'rejeitado' && observacaoRejeicao) {
      updatedEntries[entryIndex].observacao = observacaoRejeicao;
    }
    setOvertimeEntries(updatedEntries);
    const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    notificacoes.push({
      id: Date.now(),
      userId: updatedEntries[entryIndex].funcionarioId,
      message: `Sua solicitação de hora extra para ${updatedEntries[entryIndex].date} foi ${newStatus === 'aprovado' ? 'aprovada' : 'rejeitada'}.`,
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
  const abrirModalRejeitar = (overtime) => {
    setSolicitacaoSelecionada(overtime);
    setObservacaoRejeicao('');
    setModalRejeitarAberto(true);
  };
  // Função para detectar horas extras automaticamente
  const detectOvertime = () => {
    const pontoRegistros = JSON.parse(localStorage.getItem('pontoRegistros') || '[]');
    let horasExtrasDetectadas = [];
    pontoRegistros.forEach(registro => {
      const horaExtraExistente = overtimeEntries.find(
        he => he.funcionarioId === registro.funcionarioId && he.date === registro.data
      );
      if (!horaExtraExistente) {
        const ultimoRegistro = registro.registros[registro.registros.length - 1];
        if (ultimoRegistro && ultimoRegistro.hora && ultimoRegistro.hora !== '--:--') {
          const horaSaida = ultimoRegistro.hora.split(':').map(Number);
          if (horaSaida[0] >= 18) {
            const horasExtras = horaSaida[0] - 18 + (horaSaida[1] / 60);
            if (horasExtras > 0) {
              horasExtrasDetectadas.push({
                id: Date.now() + Math.random(),
                funcionarioId: registro.funcionarioId,
                funcionarioNome: registro.funcionarioNome,
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
      setOvertimeEntries([...horasExtrasDetectadas, ...overtimeEntries]);
      alert(`${horasExtrasDetectadas.length} novas horas extras detectadas automaticamente.`);
    } else {
      alert('Nenhuma nova hora extra detectada.');
    }
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
      case 'detectado':
        corClasse = 'bg-blue-600';
        texto = 'DETECTADO';
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
  return (
    <div className="bg-purple-900 min-h-screen p-4 text-white">
      <div className="max-w-7xl mx-auto">
        {/* Tabs Navigation */}
        <div className="flex border-b border-purple-700 mb-6">
          <button
            className={`py-2 px-4 font-medium rounded-t-lg mr-2 ${
              activeTab === 'horasExtras'
                ? 'bg-purple-800 border-t border-l border-r border-purple-700'
                : 'bg-purple-950 text-purple-300 hover:bg-purple-800 hover:text-white'
            }`}
            onClick={() => setActiveTab('horasExtras')}
          >
            Horas Extras
          </button>
          <button
            className={`py-2 px-4 font-medium rounded-t-lg mr-2 ${
              activeTab === 'ferias'
                ? 'bg-purple-800 border-t border-l border-r border-purple-700'
                : 'bg-purple-950 text-purple-300 hover:bg-purple-800 hover:text-white'
            }`}
            onClick={() => setActiveTab('ferias')}
          >
            Férias
          </button>
          <button
            className={`py-2 px-4 font-medium rounded-t-lg mr-2 ${
              activeTab === 'folgas'
                ? 'bg-purple-800 border-t border-l border-r border-purple-700'
                : 'bg-purple-950 text-purple-300 hover:bg-purple-800 hover:text-white'
            }`}
            onClick={() => setActiveTab('folgas')}
          >
            Folgas
          </button>
        </div>
        {/* Tab Content */}
        {activeTab === 'horasExtras' && (
          <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold mb-6">Gerenciamento de Horas Extras</h1>
            {/* Botão para forçar atualização da lista */}
            <div className="mb-4">
              <button
                onClick={() => {
                  const latestFuncionarios = getAllPossibleFuncionarios();
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
                    <option value="detectado">Detectado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Funcionário</label>
                  <select
                    className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                    value={filtros.funcionario}
                    onChange={(e) => setFiltros({...filtros, funcionario: e.target.value})}
                  >
                    <option value="">Todos os funcionários</option>
                    {[...new Set([
                      ...allFuncionarios.map(f => f.nome),
                      ...overtimeEntries.map(entry => entry.funcionarioNome)
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
            {/* Nova Hora Extra */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-4">Registrar Nova Hora Extra</h2>
              <form onSubmit={handleAddOvertime} className="bg-purple-900 bg-opacity-40 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-purple-300 mb-1">
                      Funcionário * ({allFuncionarios.length} disponíveis)
                    </label>
                    <select
                      className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                      value={newOvertime.funcionarioId}
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
                      value={newOvertime.date}
                      onChange={(e) => setNewOvertime({...newOvertime, date: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-purple-300 mb-1">Horas *</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                      value={newOvertime.hours}
                      onChange={(e) => setNewOvertime({...newOvertime, hours: e.target.value})}
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm text-purple-300 mb-1">Motivo *</label>
                    <input
                      type="text"
                      className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                      value={newOvertime.reason}
                      onChange={(e) => setNewOvertime({...newOvertime, reason: e.target.value})}
                      required
                      placeholder="Motivo da hora extra"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                >
                  Registrar Hora Extra
                </button>
              </form>
            </div>
            {/* Histórico de Horas Extras */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Histórico de Horas Extras</h2>
                <button
                  onClick={detectOvertime}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" />
                  </svg>
                  Detectar Horas Extras
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-purple-300 text-sm border-b border-purple-700">
                      <th className="px-4 py-2 text-left">Funcionário</th>
                      <th className="px-4 py-2 text-left">Data</th>
                      <th className="px-4 py-2 text-left">Horas</th>
                      <th className="px-4 py-2 text-left">Motivo</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {horasExtrasOrdenadas.map((entry) => (
                      <tr key={entry.id} className="border-b border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                        <td className="px-4 py-3">{entry.funcionarioNome}</td>
                        <td className="px-4 py-3">{entry.date}</td>
                        <td className="px-4 py-3">{entry.hours}h</td>
                        <td className="px-4 py-3">
                          <div className="truncate max-w-xs" title={entry.reason}>
                            {entry.reason}
                          </div>
                        </td>
                        <td className="px-4 py-3">{renderizarStatus(entry.status)}</td>
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
                          {entry.status === 'detectado' && (
                            <button
                              onClick={() => changeStatus(entry.id, 'aprovado')}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                            >
                              Confirmar
                            </button>
                          )}
                          {(entry.status === 'aprovado' || entry.status === 'rejeitado') && entry.observacao && (
                            <div className="text-xs text-purple-300" title={entry.observacao}>
                              Obs: {entry.observacao.substring(0, 30)}
                              {entry.observacao.length > 30 ? '...' : ''}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                    {horasExtrasOrdenadas.length === 0 && (
                      <tr>
                        <td colSpan="6" className="px-4 py-6 text-center text-purple-300">
                          Nenhuma hora extra encontrada com os filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Dashboard de horas extras */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card - Total de Horas Extras */}
              <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-4">
                <div className="flex items-center mb-4">
                  <div className="bg-purple-600 p-2 rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold">Total de Horas Extras</h2>
                </div>
                <p className="text-2xl font-bold mb-2">
                  {overtimeEntries
                    .filter(entry => entry.status === 'aprovado')
                    .reduce((total, entry) => total + entry.hours, 0)
                    .toFixed(1)}h
                </p>
                <p className="text-purple-300 text-sm">
                  De {overtimeEntries.filter(entry => entry.status === 'aprovado').length} registros aprovados
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
                  {overtimeEntries.filter(entry => entry.status === 'pendente' || entry.status === 'detectado').length}
                </p>
                <p className="text-purple-300 text-sm">
                  Total de {overtimeEntries
                    .filter(entry => entry.status === 'pendente' || entry.status === 'detectado')
                    .reduce((total, entry) => total + entry.hours, 0)
                    .toFixed(1)}h a processar
                </p>
              </div>
                                     {/* Card - Top Funcionários */}
              <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-4">
                <div className="flex items-center mb-4">
                  <div className="bg-blue-600 p-2 rounded-full mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h2 className="text-lg font-semibold">Top Funcionários</h2>
                </div>
                <ul className="space-y-2">
                  {(() => {
                    // Filtra e agrega as horas extras por funcionário
                    const funcionariosHoras = overtimeEntries
                      .filter(entry => entry.status === 'aprovado' && entry.funcionarioNome && entry.funcionarioNome !== 'undefined')
                      .reduce((acc, entry) => {
                        const nome = entry.funcionarioNome || 'Não identificado';
                        if (!acc[nome]) {
                          acc[nome] = 0;
                        }
                        acc[nome] += entry.hours;
                        return acc;
                      }, {});
                    
                    // Converte para array, ordena e pega os top 3
                    const topFuncionarios = Object.entries(funcionariosHoras)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 3);
                      
                    // Se não há funcionários com horas extras aprovadas
                    if (topFuncionarios.length === 0) {
                      return <li className="text-purple-300 text-sm">Nenhuma hora extra aprovada</li>;
                    }
                      
                    // Renderiza a lista de top funcionários
                    return topFuncionarios.map(([nome, horas], index) => (
                      <li key={index} className="flex justify-between items-center">
                        <span>{nome}</span>
                        <div className="flex items-center space-x-2">
                          <span className="bg-purple-700 px-2 py-1 rounded-full text-xs">
                            {horas.toFixed(1)}h
                          </span>
                          <button 
                            onClick={() => {
                              // Remove todas as horas extras aprovadas deste funcionário
                              const updatedEntries = overtimeEntries.map(entry => 
                                entry.funcionarioNome === nome && entry.status === 'aprovado'
                                  ? {...entry, status: 'rejeitado', observacao: 'Removido da lista de top funcionários'}
                                  : entry
                              );
                              setOvertimeEntries(updatedEntries);
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs p-1 rounded-full"
                            title="Remover funcionário da lista"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </li>
                    ));
                  })()}
                </ul>
              </div>
            </div>
            {/* Modal de Rejeição */}
            {modalRejeitarAberto && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-md">
                  <h3 className="text-xl font-bold mb-4">Rejeitar Hora Extra</h3>
                  <p className="mb-4">
                    Você está rejeitando a hora extra de <strong>{solicitacaoSelecionada?.funcionarioNome}</strong> para o dia <strong>{solicitacaoSelecionada?.date}</strong> de <strong>{solicitacaoSelecionada?.hours}h</strong>.
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
                    >
                      Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        {activeTab === 'ferias' && <FeriasTab />}
        {activeTab === 'folgas' && <FolgaTab />}
      </div>
    </div>
  );
};

export default HorasExtrasTab;
