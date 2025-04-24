import React, { useState, useEffect } from 'react';

const ContestacaoAdmin = () => {
  // Estado para armazenar todas as contestações
  const [contestacoes, setContestacoes] = useState([]);
  
  // Estado para modal de resposta
  const [showRespostaModal, setShowRespostaModal] = useState(false);
  const [contestacaoSelecionada, setContestacaoSelecionada] = useState(null);
  const [respostaAdmin, setRespostaAdmin] = useState('');
  const [novoStatus, setNovoStatus] = useState('aprovado');
  
  // Estado para filtros
  const [filtros, setFiltros] = useState({
    status: '',
    tipo: '',
    funcionario: ''
  });

  // Carregar contestações do localStorage
  useEffect(() => {
    const loadContestacoes = () => {
      const storedContestacoes = localStorage.getItem('contestacoes');
      if (storedContestacoes) {
        setContestacoes(JSON.parse(storedContestacoes));
      }
    };

    loadContestacoes();
    
    // Atualizar a cada 5 segundos para manter sincronizado com outras abas
    const interval = setInterval(loadContestacoes, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar contestações
  const contestacoesFiltradas = contestacoes.filter(contestacao => {
    const matchStatus = filtros.status === '' || contestacao.status === filtros.status;
    const matchTipo = filtros.tipo === '' || contestacao.tipo === filtros.tipo;
    const matchFuncionario = filtros.funcionario === '' || 
      contestacao.funcionarioNome.toLowerCase().includes(filtros.funcionario.toLowerCase());
    
    return matchStatus && matchTipo && matchFuncionario;
  });

  // Ordenar contestações (mais recentes primeiro)
  const contestacoesOrdenadas = [...contestacoesFiltradas].sort((a, b) => {
    // Primeiro, priorizar pendentes
    if (a.status === 'pendente' && b.status !== 'pendente') return -1;
    if (a.status !== 'pendente' && b.status === 'pendente') return 1;
    
    // Depois por data de criação
    const dataA = new Date(a.dataCriacao.split('/').reverse().join('-'));
    const dataB = new Date(b.dataCriacao.split('/').reverse().join('-'));
    return dataB - dataA;
  });

  // Abrir modal de resposta
  const abrirRespostaModal = (contestacao) => {
    setContestacaoSelecionada(contestacao);
    setRespostaAdmin('');
    setNovoStatus(contestacao.resposta === 'reagendar' ? 'aprovado' : 'rejeitado');
    setShowRespostaModal(true);
    
    // Marcar notificação como lida se existir
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    const updatedNotifications = adminNotifications.map(notif => {
      if (notif.type === 'contestacao' && notif.contestacaoId === contestacao.id) {
        return { ...notif, read: true };
      }
      return notif;
    });
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
  };

  // Enviar resposta do administrador
  const enviarResposta = () => {
    if (!respostaAdmin) {
      alert('Por favor, forneça uma resposta para o funcionário');
      return;
    }

    // Atualizar contestação
    const updatedContestacoes = contestacoes.map(item => {
      if (item.id === contestacaoSelecionada.id) {
        return {
          ...item,
          status: novoStatus,
          feedback_admin: respostaAdmin,
          data_resposta: new Date().toLocaleDateString('pt-BR')
        };
      }
      return item;
    });
    
    setContestacoes(updatedContestacoes);
    localStorage.setItem('contestacoes', JSON.stringify(updatedContestacoes));

    // Notificar funcionário sobre a resposta
    const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    notificacoes.push({
      id: Date.now(),
      userId: contestacaoSelecionada.funcionarioId,
      message: `Sua contestação de ${getTipoTexto(contestacaoSelecionada.tipo)} foi ${novoStatus === 'aprovado' ? 'aprovada' : 'rejeitada'}.`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    });
    localStorage.setItem('userNotifications', JSON.stringify(notificacoes));

    // Se a contestação foi aprovada e propunha nova data/horas, atualizar o registro original
    if (novoStatus === 'aprovado' && contestacaoSelecionada.resposta === 'reagendar') {
      atualizarRegistroOriginal(contestacaoSelecionada);
    }

    // Fechar modal
    setShowRespostaModal(false);
    setContestacaoSelecionada(null);
    setRespostaAdmin('');
  };

  // Atualizar o registro original com a nova data/horas
  const atualizarRegistroOriginal = (contestacao) => {
    if (contestacao.tipo === 'horasExtras') {
      const overtimeEntries = JSON.parse(localStorage.getItem('overtimeEntries') || '[]');
      const updatedEntries = overtimeEntries.map(entry => {
        if (entry.id === contestacao.itemId) {
          return {
            ...entry,
            date: contestacao.novaDataInicio,
            hours: parseFloat(contestacao.novasHoras),
            contestado: true,
            motivo_contestacao: contestacao.motivo,
            observacao: `Alterado via contestação: ${contestacao.motivo}`
          };
        }
        return entry;
      });
      localStorage.setItem('overtimeEntries', JSON.stringify(updatedEntries));
    } 
    else if (contestacao.tipo === 'ferias') {
      const feriasEntries = JSON.parse(localStorage.getItem('feriasEntries') || '[]');
      const updatedEntries = feriasEntries.map(entry => {
        if (entry.id === contestacao.itemId) {
          // Calcular dias totais
          const inicio = new Date(contestacao.novaDataInicio.split('/').reverse().join('-'));
          const fim = new Date(contestacao.novaDataFim.split('/').reverse().join('-'));
          const diffTime = Math.abs(fim - inicio);
          const diasTotais = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          
          return {
            ...entry,
            dataInicio: contestacao.novaDataInicio,
            dataFim: contestacao.novaDataFim,
            diasTotais: diasTotais,
            contestado: true,
            motivo_contestacao: contestacao.motivo,
            observacao: `Alterado via contestação: ${contestacao.motivo}`
          };
        }
        return entry;
      });
      localStorage.setItem('feriasEntries', JSON.stringify(updatedEntries));
    }
    else if (contestacao.tipo === 'folgas') {
      const folgaEntries = JSON.parse(localStorage.getItem('folgaEntries') || '[]');
      const updatedEntries = folgaEntries.map(entry => {
        if (entry.id === contestacao.itemId) {
          return {
            ...entry,
            data: contestacao.novaDataInicio,
            contestado: true,
            motivo_contestacao: contestacao.motivo,
            observacao_aprovacao: `Alterado via contestação: ${contestacao.motivo}`
          };
        }
        return entry;
      });
      localStorage.setItem('folgaEntries', JSON.stringify(updatedEntries));
    }
  };

  // Obter texto descritivo do tipo de contestação
  const getTipoTexto = (tipo) => {
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

  // Renderizar tipo de resposta
  const renderTipoResposta = (resposta, novaData, novaDataFim, novasHoras) => {
    switch(resposta) {
      case 'concordar':
        return <span className="bg-green-600 text-white px-2 py-1 rounded text-xs">CONCORDO</span>;
      case 'discordar':
        return <span className="bg-red-600 text-white px-2 py-1 rounded text-xs">DISCORDO</span>;
      case 'reagendar':
        return (
          <div>
            <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">NOVA DATA/HORAS</span>
            <p className="text-sm mt-1">
              {novaDataFim ? `${novaData} a ${novaDataFim}` : 
               novasHoras ? `${novaData} (${novasHoras}h)` : 
               novaData}
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Gerenciamento de Contestações</h1>
      
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
            <label className="block text-sm text-purple-300 mb-1">Tipo</label>
            <select 
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              value={filtros.tipo}
              onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
            >
              <option value="">Todos os tipos</option>
              <option value="horasExtras">Horas Extras</option>
              <option value="ferias">Férias</option>
              <option value="folgas">Folgas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-purple-300 mb-1">Funcionário</label>
            <input 
              type="text"
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              value={filtros.funcionario}
              onChange={(e) => setFiltros({...filtros, funcionario: e.target.value})}
              placeholder="Nome do funcionário"
            />
          </div>
        </div>
      </div>
      
      {/* Dashboard de resumo */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <div className="flex items-center mb-2">
            <div className="bg-yellow-600 p-2 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Pendentes</h2>
          </div>
          <p className="text-2xl font-bold">
            {contestacoes.filter(c => c.status === 'pendente').length}
          </p>
        </div>
        
        <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <div className="flex items-center mb-2">
            <div className="bg-green-600 p-2 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Aprovadas</h2>
          </div>
          <p className="text-2xl font-bold">
            {contestacoes.filter(c => c.status === 'aprovado').length}
          </p>
        </div>
        
        <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <div className="flex items-center mb-2">
            <div className="bg-red-600 p-2 rounded-full mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold">Rejeitadas</h2>
          </div>
          <p className="text-2xl font-bold">
            {contestacoes.filter(c => c.status === 'rejeitado').length}
          </p>
        </div>
      </div>
      
      {/* Lista de Contestações */}
      <div className="overflow-hidden bg-purple-900 bg-opacity-40 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold p-4 border-b border-purple-700">Contestações</h2>
        
        {contestacoesOrdenadas.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-purple-800 bg-opacity-50 text-purple-300 text-sm">
                  <th className="px-4 py-3 text-left">Funcionário</th>
                  <th className="px-4 py-3 text-left">Tipo</th>
                  <th className="px-4 py-3 text-left">Data Original</th>
                  <th className="px-4 py-3 text-left">Resposta</th>
                  <th className="px-4 py-3 text-left">Motivo</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {contestacoesOrdenadas.map(contestacao => (
                  <tr key={contestacao.id} className="border-b border-purple-700 hover:bg-purple-800 hover:bg-opacity-30">
                    <td className="px-4 py-3">{contestacao.funcionarioNome}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        contestacao.tipo === 'horasExtras' ? 'bg-indigo-600' :
                        contestacao.tipo === 'ferias' ? 'bg-blue-600' :
                        'bg-purple-600'
                      }`}>
                        {contestacao.tipo === 'horasExtras' ? 'HORAS EXTRAS' :
                         contestacao.tipo === 'ferias' ? 'FÉRIAS' : 'FOLGA'}
                      </span>
                    </td>
                    <td className="px-4 py-3">{contestacao.dataOriginal}</td>
                    <td className="px-4 py-3">
                      {renderTipoResposta(
                        contestacao.resposta, 
                        contestacao.novaDataInicio, 
                        contestacao.novaDataFim, 
                        contestacao.novasHoras
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="truncate max-w-xs" title={contestacao.motivo}>
                        {contestacao.motivo}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        contestacao.status === 'aprovado' ? 'bg-green-600' :
                        contestacao.status === 'rejeitado' ? 'bg-red-600' :
                        'bg-yellow-600'
                      }`}>
                        {contestacao.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {contestacao.status === 'pendente' ? (
                        <button
                          onClick={() => abrirRespostaModal(contestacao)}
                          className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-3 py-1 rounded"
                        >
                          Responder
                        </button>
                      ) : (
                        <div className="text-xs text-purple-300">
                          {contestacao.data_resposta || ''}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-purple-300 py-8">
            Não há contestações para exibir.
          </p>
        )}
      </div>
      
      {/* Modal de Resposta */}
      {showRespostaModal && contestacaoSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Responder Contestação</h3>
              <button 
                onClick={() => setShowRespostaModal(false)}
                className="text-purple-300 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4 mb-4">
              <h4 className="font-semibold mb-3">Detalhes da Contestação</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-purple-300">Funcionário</p>
                  <p className="font-medium">{contestacaoSelecionada.funcionarioNome}</p>
                </div>
                <div>
                  <p className="text-sm text-purple-300">Tipo</p>
                  <p className="font-medium">
                    {contestacaoSelecionada.tipo === 'horasExtras' ? 'Horas Extras' :
                     contestacaoSelecionada.tipo === 'ferias' ? 'Férias' : 'Folga'}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-purple-300">Data Original</p>
                  <p className="font-medium">{contestacaoSelecionada.dataOriginal}</p>
                </div>
                <div>
                  <p className="text-sm text-purple-300">Resposta do Funcionário</p>
                  <p className="font-medium">
                    {contestacaoSelecionada.resposta === 'concordar' ? 'Concordo' :
                     contestacaoSelecionada.resposta === 'discordar' ? 'Discordo' : 'Proposta de Nova Data/Horas'}
                  </p>
                </div>
              </div>
              
              {contestacaoSelecionada.resposta === 'reagendar' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  {contestacaoSelecionada.novaDataInicio && (
                    <div>
                      <p className="text-sm text-purple-300">
                        {contestacaoSelecionada.tipo === 'ferias' ? 'Nova Data Início' : 'Nova Data'}
                      </p>
                      <p className="font-medium">{contestacaoSelecionada.novaDataInicio}</p>
                    </div>
                  )}
                  
                  {contestacaoSelecionada.novaDataFim && (
                    <div>
                      <p className="text-sm text-purple-300">Nova Data Fim</p>
                      <p className="font-medium">{contestacaoSelecionada.novaDataFim}</p>
                    </div>
                  )}
                  
                  {contestacaoSelecionada.novasHoras && (
                    <div>
                      <p className="text-sm text-purple-300">Novas Horas</p>
                      <p className="font-medium">{contestacaoSelecionada.novasHoras}h</p>
                    </div>
                  )}
                </div>
              )}
              
              <div>
                <p className="text-sm text-purple-300">Motivo</p>
                <p className="font-medium">{contestacaoSelecionada.motivo}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-purple-300 mb-1">Sua Decisão</label>
              <div className="flex space-x-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="decision"
                    value="aprovado"
                    checked={novoStatus === 'aprovado'}
                    onChange={() => setNovoStatus('aprovado')}
                    className="mr-1"
                  />
                  {contestacaoSelecionada.resposta === 'reagendar' ? 'Aceitar Proposta' : 'Aprovar Contestação'}
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="decision"
                    value="rejeitado"
                    checked={novoStatus === 'rejeitado'}
                    onChange={() => setNovoStatus('rejeitado')}
                    className="mr-1"
                  />
                  {contestacaoSelecionada.resposta === 'reagendar' ? 'Rejeitar Proposta' : 'Rejeitar Contestação'}
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-purple-300 mb-1">Resposta para o Funcionário*</label>
              <textarea
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                rows="4"
                value={respostaAdmin}
                onChange={(e) => setRespostaAdmin(e.target.value)}
                placeholder="Forneça um feedback detalhado sobre sua decisão..."
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRespostaModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={enviarResposta}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md"
                disabled={!respostaAdmin}
              >
                Enviar Resposta
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContestacaoAdmin;