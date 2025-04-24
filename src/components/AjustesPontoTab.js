import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

// Constante para a chave do localStorage
const FUNCIONARIOS_KEY = 'funcionarios';

const AjustesPontoTab = () => {
  // Hooks e Context
  const { userData, funcionarios, refreshFuncionarios } = useUser();
  const navigate = useNavigate();
  
  // Estado local para funcionários
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
      }
    ];
  });

  // Estados para modais
  const [modalRejeitarAberto, setModalRejeitarAberto] = useState(false);
  const [modalAprovarAberto, setModalAprovarAberto] = useState(false);
  const [solicitacaoSelecionada, setSolicitacaoSelecionada] = useState(null);
  const [observacaoRejeicao, setObservacaoRejeicao] = useState('');
  const [observacaoAprovacao, setObservacaoAprovacao] = useState('');

  // Estados para filtros
  const [filtros, setFiltros] = useState({
    status: '',
    funcionario: '',
    periodo: ''
  });

  // Estado para lista consolidada de funcionários
  const [allFuncionarios, setAllFuncionarios] = useState([]);

  // Funções auxiliares
  const getAllPossibleFuncionarios = useCallback(() => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const funcionariosFromUsers = registeredUsers.map(user => ({
        id: user.id,
        nome: user.name || user.nome
      }));
      
      const storedFuncionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
      const contextFuncionarios = funcionarios || [];
      const localFuncs = localFuncionarios || [];
      
      const funcionariosMap = new Map();
      
      [...funcionariosFromUsers, ...storedFuncionarios, ...contextFuncionarios, ...localFuncs]
        .forEach(func => {
          if (func && func.id) {
            funcionariosMap.set(func.id, func);
          }
        });
      
      return Array.from(funcionariosMap.values());
    } catch (error) {
      console.error('Erro ao obter funcionários de todas as fontes:', error);
      return [];
    }
  }, [funcionarios, localFuncionarios]);

  // Effects
  useEffect(() => {
    const updateAllFuncionarios = () => {
      const allPossible = getAllPossibleFuncionarios();
      setAllFuncionarios(allPossible);
    };
    
    updateAllFuncionarios();
    const interval = setInterval(updateAllFuncionarios, 2000);
    return () => clearInterval(interval);
  }, [getAllPossibleFuncionarios]);

  useEffect(() => {
    if (!userData || !userData.authenticated) {
      navigate('/login');
      return;
    }
    
    if (!userData.roles || !userData.roles.includes('ADMIN')) {
      navigate('/dashboard');
      return;
    }
    
    refreshFuncionarios();
  }, [userData, navigate, refreshFuncionarios]);

  // Funções de aprovação e rejeição
  const abrirModalAprovar = (solicitacao) => {
    setSolicitacaoSelecionada(solicitacao);
    setModalAprovarAberto(true);
  };

  const aprovarSolicitacao = () => {
    if (!solicitacaoSelecionada) return;

    const solicitacoesAtualizadas = solicitacoes.map(s => {
      if (s.id === solicitacaoSelecionada.id) {
        return {
          ...s,
          status: 'aprovado',
          dataDecisao: new Date().toLocaleDateString('pt-BR'),
          justificativaAdmin: observacaoAprovacao
        };
      }
      return s;
    });

    setSolicitacoes(solicitacoesAtualizadas);
    localStorage.setItem('ajustePontoSolicitacoes', JSON.stringify(solicitacoesAtualizadas));

    // Notificar funcionário
    const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    notificacoes.push({
      id: Date.now(),
      userId: solicitacaoSelecionada.funcionarioId,
      message: `Sua solicitação de ajuste de ponto para ${solicitacaoSelecionada.data} foi aprovada. ${
        observacaoAprovacao ? `Observação: ${observacaoAprovacao}` : ''
      }`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    });
    localStorage.setItem('userNotifications', JSON.stringify(notificacoes));

    // Atualizar registro de ponto
    const timeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    const updatedTimeEntries = timeEntries.map(entry => {
      if (entry.employeeId === solicitacaoSelecionada.funcionarioId && 
          entry.date === solicitacaoSelecionada.data && 
          entry.type === solicitacaoSelecionada.tipoRegistro) {
        return {
          ...entry,
          time: solicitacaoSelecionada.horaCorreta,
          status: 'aprovado',
          justificativaAdmin: observacaoAprovacao
        };
      }
      return entry;
    });
    localStorage.setItem('timeEntries', JSON.stringify(updatedTimeEntries));

    setModalAprovarAberto(false);
    setSolicitacaoSelecionada(null);
    setObservacaoAprovacao('');

    alert('Solicitação aprovada com sucesso!');
  };

  const rejeitarSolicitacao = () => {
    if (!solicitacaoSelecionada) return;

    const solicitacoesAtualizadas = solicitacoes.map(s => {
      if (s.id === solicitacaoSelecionada.id) {
        return {
          ...s,
          status: 'rejeitado',
          dataDecisao: new Date().toLocaleDateString('pt-BR'),
          observacao: observacaoRejeicao,
          justificativaAdmin: observacaoRejeicao
        };
      }
      return s;
    });

    setSolicitacoes(solicitacoesAtualizadas);
    localStorage.setItem('ajustePontoSolicitacoes', JSON.stringify(solicitacoesAtualizadas));

    // Notificar funcionário
    const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    notificacoes.push({
      id: Date.now(),
      userId: solicitacaoSelecionada.funcionarioId,
      message: `Sua solicitação de ajuste de ponto para ${solicitacaoSelecionada.data} foi rejeitada. 
                Motivo: ${observacaoRejeicao}`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    });
    localStorage.setItem('userNotifications', JSON.stringify(notificacoes));

    setModalRejeitarAberto(false);
    setSolicitacaoSelecionada(null);
    setObservacaoRejeicao('');

    alert('Solicitação rejeitada.');
  };

  // Funções de renderização
  const renderizarStatus = (status) => {
    const statusColors = {
      pendente: 'bg-yellow-600',
      aprovado: 'bg-green-600',
      rejeitado: 'bg-red-600',
      default: 'bg-gray-600'
    };
    
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs ${statusColors[status] || statusColors.default}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  // Filtrar e ordenar solicitações
  const solicitacoesFiltradas = solicitacoes.filter(solicitacao => {
    const matchStatus = filtros.status === '' || solicitacao.status === filtros.status;
    const matchFuncionario = filtros.funcionario === '' || solicitacao.funcionarioNome === filtros.funcionario;
    
    let matchPeriodo = true;
    if (filtros.periodo === 'hoje') {
      matchPeriodo = solicitacao.data === new Date().toLocaleDateString('pt-BR');
    } else if (filtros.periodo === 'semana') {
      const hoje = new Date();
      const dataLimite = new Date();
      dataLimite.setDate(hoje.getDate() - 7);
      
      const [dia, mes, ano] = solicitacao.data.split('/').map(Number);
      const dataSolicitacao = new Date(ano, mes - 1, dia);
      
      matchPeriodo = dataSolicitacao >= dataLimite;
    }
    
    return matchStatus && matchFuncionario && matchPeriodo;
  });

  const solicitacoesOrdenadas = [...solicitacoesFiltradas].sort((a, b) => {
    const [diaA, mesA, anoA] = a.dataSolicitacao.split('/').map(Number);
    const [diaB, mesB, anoB] = b.dataSolicitacao.split('/').map(Number);
    
    const dateA = new Date(anoA, mesA - 1, diaA);
    const dateB = new Date(anoB, mesB - 1, diaB);
    
    return dateB - dateA;
  });

  // Renderização do componente
  return (
    <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Ajustes de Ponto</h1>
      
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
                  <td className="px-4 py-3">
                    {renderizarStatus(solicitacao.status)}
                    {solicitacao.justificativaAdmin && (
                      <span 
                        className="ml-2 text-xs text-purple-300 cursor-help"
                        title={solicitacao.justificativaAdmin}
                      >
                        ℹ️
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {solicitacao.status === 'pendente' ? (
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => abrirModalAprovar(solicitacao)}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                        >
                          Aprovar
                        </button>
                        <button 
                          onClick={() => {
                            setSolicitacaoSelecionada(solicitacao);
                            setModalRejeitarAberto(true);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                        >
                          Rejeitar
                        </button>
                      </div>
                    ) : (
                      <div>
                        {solicitacao.justificativaAdmin && (
                          <div className="text-xs text-purple-300 mt-1" title={solicitacao.justificativaAdmin}>
                            {solicitacao.justificativaAdmin.length > 20 
                              ? solicitacao.justificativaAdmin.substring(0, 20) + '...' 
                              : solicitacao.justificativaAdmin
                            }
                          </div>
                        )}
                        {solicitacao.dataDecisao && (
                          <div className="text-xs text-purple-300">
                            Decidido em: {solicitacao.dataDecisao}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Aprovação */}
      {modalAprovarAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Aprovar Solicitação</h3>
            <div className="mb-4 bg-purple-800 bg-opacity-40 p-3 rounded">
              <p className="text-sm">
                <span className="text-purple-300">Funcionário:</span> {solicitacaoSelecionada?.funcionarioNome}
              </p>
              <p className="text-sm">
                <span className="text-purple-300">Data:</span> {solicitacaoSelecionada?.data}
              </p>
              <p className="text-sm">
                <span className="text-purple-300">Alteração:</span> {solicitacaoSelecionada?.horaOriginal} → {solicitacaoSelecionada?.horaCorreta}
              </p>
              <p className="text-sm">
                <span className="text-purple-300">Motivo:</span> {solicitacaoSelecionada?.motivo}
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-purple-300 mb-1">Observações da aprovação</label>
              <textarea 
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                value={observacaoAprovacao}
                onChange={(e) => setObservacaoAprovacao(e.target.value)}
                rows={3}
                placeholder="Adicione uma observação (opcional)"
              ></textarea>
            </div>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => {
                  setModalAprovarAberto(false);
                  setSolicitacaoSelecionada(null);
                  setObservacaoAprovacao('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button 
                onClick={aprovarSolicitacao}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded"
              >
                Confirmar Aprovação
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rejeição */}
      {modalRejeitarAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Rejeitar Solicitação</h3>
            <p className="mb-4">
              Você está rejeitando a solicitação de ajuste de ponto de{' '}
              <strong>{solicitacaoSelecionada?.funcionarioNome}</strong> para o dia{' '}
              <strong>{solicitacaoSelecionada?.data}</strong>.
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
                onClick={() => {
                  setModalRejeitarAberto(false);
                  setSolicitacaoSelecionada(null);
                  setObservacaoRejeicao('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button 
                onClick={rejeitarSolicitacao}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
              >
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AjustesPontoTab;