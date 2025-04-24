import React, { useState, useEffect } from 'react';

const ContestacaoAdmin = () => {
  // Estado para armazenar todas as contestações
  const [contestacoes, setContestacoes] = useState([]);
  // Estado para filtrar contestações
  const [filtroStatus, setFiltroStatus] = useState('pendente');
  const [filtroTipo, setFiltroTipo] = useState('todos');
  // Estado para modal de resposta
  const [showRespostaModal, setShowRespostaModal] = useState(false);
  const [contestacaoAtual, setContestacaoAtual] = useState(null);
  const [respostaAdmin, setRespostaAdmin] = useState('');
  const [decisaoAdmin, setDecisaoAdmin] = useState('aprovar');

  // Carregar contestações do localStorage
  useEffect(() => {
    const loadContestacoes = () => {
      const storedContestacoes = localStorage.getItem('contestacoes');
      if (storedContestacoes) {
        setContestacoes(JSON.parse(storedContestacoes));
      }
    };
    
    loadContestacoes();
    
    // Atualizar a cada 5 segundos para pegar novas contestações
    const interval = setInterval(loadContestacoes, 5000);
    return () => clearInterval(interval);
  }, []);

  // Filtrar contestações com base nos filtros selecionados
  const contestacoesFiltradas = contestacoes.filter(contestacao => {
    // Filtro por status
    if (filtroStatus !== 'todos' && contestacao.status !== filtroStatus) {
      return false;
    }
    
    // Filtro por tipo
    if (filtroTipo !== 'todos' && contestacao.tipo !== filtroTipo) {
      return false;
    }
    
    return true;
  });

  // Abrir modal de resposta
  const abrirRespostaModal = (contestacao) => {
    setContestacaoAtual(contestacao);
    setRespostaAdmin('');
    setDecisaoAdmin('aprovar');
    setShowRespostaModal(true);
  };

  // Responder contestação
  const responderContestacao = () => {
    if (!contestacaoAtual) return;
    
    // Atualizar status da contestação
    const novasContestacoes = contestacoes.map(item => {
      if (item.id === contestacaoAtual.id) {
        return {
          ...item,
          status: decisaoAdmin === 'aprovar' ? 'aprovado' : 'rejeitado',
          feedback_admin: respostaAdmin,
          data_resposta: new Date().toLocaleDateString('pt-BR')
        };
      }
      return item;
    });
    
    // Atualizar localStorage
    localStorage.setItem('contestacoes', JSON.stringify(novasContestacoes));
    setContestacoes(novasContestacoes);
    
    // Atualizar também os dados originais com base na decisão
    if (decisaoAdmin === 'aprovar') {
      atualizarDadosOriginais(contestacaoAtual);
    }
    
    // Enviar notificação para o funcionário
    adicionarNotificacaoFuncionario(contestacaoAtual, decisaoAdmin, respostaAdmin);
    
    // Fechar modal
    setShowRespostaModal(false);
  };

  // Atualizar dados originais baseado na contestação aprovada
  const atualizarDadosOriginais = (contestacao) => {
    if (contestacao.tipo === 'horasExtras') {
      const horasExtras = JSON.parse(localStorage.getItem('overtimeEntries') || '[]');
      const updatedHorasExtras = horasExtras.map(item => {
        if (item.id === contestacao.itemId) {
          // Se a resposta foi "reagendar", atualizar data e horas
          if (contestacao.resposta === 'reagendar') {
            return {
              ...item,
              date: contestacao.novaDataInicio,
              hours: parseFloat(contestacao.novasHoras) || item.hours,
              observacao: `Atualizado via contestação em ${new Date().toLocaleDateString('pt-BR')}`
            };
          }
          // Se a resposta foi "discordar", apenas adicionar observação
          else if (contestacao.resposta === 'discordar') {
            return {
              ...item,
              observacao: `Contestação aceita em ${new Date().toLocaleDateString('pt-BR')}: ${contestacao.motivo}`
            };
          }
        }
        return item;
      });
      localStorage.setItem('overtimeEntries', JSON.stringify(updatedHorasExtras));
    } 
    else if (contestacao.tipo === 'ferias') {
      const ferias = JSON.parse(localStorage.getItem('feriasEntries') || '[]');
      const updatedFerias = ferias.map(item => {
        if (item.id === contestacao.itemId) {
          // Se a resposta foi "reagendar", atualizar datas
          if (contestacao.resposta === 'reagendar') {
            const dataInicio = contestacao.novaDataInicio;
            const dataFim = contestacao.novaDataFim;
            
            // Calcular dias totais
            const inicio = new Date(dataInicio.split('/').reverse().join('-'));
            const fim = new Date(dataFim.split('/').reverse().join('-'));
            const diasTotais = Math.floor((fim - inicio) / (1000 * 60 * 60 * 24)) + 1;
            
            return {
              ...item,
              dataInicio,
              dataFim,
              diasTotais,
              motivo_aprovacao: `Atualizado via contestação em ${new Date().toLocaleDateString('pt-BR')}`
            };
          }
          // Se a resposta foi "discordar", apenas adicionar observação
          else if (contestacao.resposta === 'discordar') {
            return {
              ...item,
              motivo_aprovacao: `Contestação aceita em ${new Date().toLocaleDateString('pt-BR')}: ${contestacao.motivo}`
            };
          }
        }
        return item;
      });
      localStorage.setItem('feriasEntries', JSON.stringify(updatedFerias));
    } 
    else if (contestacao.tipo === 'folgas') {
      const folgas = JSON.parse(localStorage.getItem('folgaEntries') || '[]');
      const updatedFolgas = folgas.map(item => {
        if (item.id === contestacao.itemId) {
          // Se a resposta foi "reagendar", atualizar data
          if (contestacao.resposta === 'reagendar') {
            return {
              ...item,
              data: contestacao.novaDataInicio,
              observacao: `Atualizado via contestação em ${new Date().toLocaleDateString('pt-BR')}`
            };
          }
          // Se a resposta foi "discordar", apenas adicionar observação
          else if (contestacao.resposta === 'discordar') {
            return {
              ...item,
              observacao: `Contestação aceita em ${new Date().toLocaleDateString('pt-BR')}: ${contestacao.motivo}`
            };
          }
        }
        return item;
      });
      localStorage.setItem('folgaEntries', JSON.stringify(updatedFolgas));
    }
  };

  // Adicionar notificação para o funcionário
  const adicionarNotificacaoFuncionario = (contestacao, decisao, resposta) => {
    const tipoLabel = contestacao.tipo === 'horasExtras' ? 'horas extras' : 
                      contestacao.tipo === 'ferias' ? 'férias' : 'folga';
    
    // Notificações do funcionário (criar se não existir)
    const notificacaoKey = `notificacoes_${contestacao.funcionarioId}`;
    const notificacoes = JSON.parse(localStorage.getItem(notificacaoKey) || '[]');
    
    notificacoes.push({
      id: Date.now(),
      tipo: 'contestacao',
      mensagem: `Sua contestação de ${tipoLabel} foi ${decisao === 'aprovar' ? 'aprovada' : 'rejeitada'}.`,
      detalhes: resposta,
      data: new Date().toLocaleDateString('pt-BR'),
      lido: false
    });
    
    localStorage.setItem(notificacaoKey, JSON.stringify(notificacoes));
  };

  // Formatador para o tipo de contestação
  const formatTipoContestacao = (tipo) => {
    switch(tipo) {
      case 'horasExtras': return 'Horas Extras';
      case 'ferias': return 'Férias';
      case 'folgas': return 'Folga';
      default: return tipo;
    }
  };

  return (
    <div className="bg-purple-900 bg-opacity-20 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Contestações</h2>
      
      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div>
          <label className="block text-sm text-purple-300 mb-1">Status</label>
          <select 
            value={filtroStatus} 
            onChange={(e) => setFiltroStatus(e.target.value)}
            className="bg-purple-800 border border-purple-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="todos">Todos</option>
            <option value="pendente">Pendentes</option>
            <option value="aprovado">Aprovados</option>
            <option value="rejeitado">Rejeitados</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-purple-300 mb-1">Tipo</label>
          <select 
            value={filtroTipo} 
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="bg-purple-800 border border-purple-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="todos">Todos</option>
            <option value="horasExtras">Horas Extras</option>
            <option value="ferias">Férias</option>
            <option value="folgas">Folgas</option>
          </select>
        </div>
      </div>
      
      {/* Lista de contestações */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-purple-300 text-sm border-b border-purple-700">
              <th className="px-4 py-2 text-left">Funcionário</th>
              <th className="px-4 py-2 text-left">Tipo</th>
              <th className="px-4 py-2 text-left">Data Original</th>
              <th className="px-4 py-2 text-left">Contestação</th>
              <th className="px-4 py-2 text-left">Status</th>
              <th className="px-4 py-2 text-left">Data</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {contestacoesFiltradas.length > 0 ? (
              contestacoesFiltradas.map((contestacao) => (
                <tr key={contestacao.id} className="border-b border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                  <td className="px-4 py-3">{contestacao.funcionarioNome}</td>
                  <td className="px-4 py-3">{formatTipoContestacao(contestacao.tipo)}</td>
                  <td className="px-4 py-3">{contestacao.dataOriginal}</td>
                  <td className="px-4 py-3">
                    {contestacao.resposta === 'concordar' ? 'Concorda com registro' : 
                     contestacao.resposta === 'discordar' ? 'Discorda do registro' : 
                     contestacao.tipo === 'ferias' ? 
                     `Solicita alteração para ${contestacao.novaDataInicio} a ${contestacao.novaDataFim}` : 
                     contestacao.tipo === 'horasExtras' ? 
                     `Solicita alteração para ${contestacao.novaDataInicio} (${contestacao.novasHoras}h)` : 
                     `Solicita alteração para ${contestacao.novaDataInicio}`}
                    <div className="text-xs text-purple-300 mt-1">
                      <strong>Motivo:</strong> {contestacao.motivo}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                      contestacao.status === 'aprovado' ? 'bg-green-600' : 
                      contestacao.status === 'rejeitado' ? 'bg-red-600' : 
                      'bg-yellow-600'
                    }`}>
                      {contestacao.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">{contestacao.dataCriacao}</td>
                  <td className="px-4 py-3">
                    {contestacao.status === 'pendente' ? (
                      <button
                        onClick={() => abrirRespostaModal(contestacao)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded"
                      >
                        Responder
                      </button>
                    ) : (
                      <div className="text-xs">
                        <div className="font-semibold">
                          {contestacao.status === 'aprovado' ? 'Aprovado' : 'Rejeitado'}
                        </div>
                        <div className="text-purple-300">
                          {contestacao.data_resposta}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="px-4 py-3 text-center text-purple-300">
                  Nenhuma contestação encontrada com os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal de resposta à contestação */}
      {showRespostaModal && contestacaoAtual && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
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

            <div className="mb-4">
              <h4 className="font-semibold">Detalhes da Contestação</h4>
              <p className="text-sm text-purple-300 mb-1">Funcionário: {contestacaoAtual.funcionarioNome}</p>
              <p className="text-sm text-purple-300 mb-1">Tipo: {formatTipoContestacao(contestacaoAtual.tipo)}</p>
              <p className="text-sm text-purple-300 mb-1">Data Original: {contestacaoAtual.dataOriginal}</p>
              <p className="text-sm text-purple-300 mb-1">
                Solicitação: {
                  contestacaoAtual.resposta === 'concordar' ? 'Concorda com registro' : 
                  contestacaoAtual.resposta === 'discordar' ? 'Discorda do registro' : 
                  contestacaoAtual.tipo === 'ferias' ? 
                  `Solicita alteração para ${contestacaoAtual.novaDataInicio} a ${contestacaoAtual.novaDataFim}` : 
                  contestacaoAtual.tipo === 'horasExtras' ? 
                  `Solicita alteração para ${contestacaoAtual.novaDataInicio} (${contestacaoAtual.novasHoras}h)` : 
                  `Solicita alteração para ${contestacaoAtual.novaDataInicio}`
                }
              </p>
              <p className="text-sm text-purple-300 mb-3">Motivo: {contestacaoAtual.motivo}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-purple-200 mb-2">Decisão</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setDecisaoAdmin('aprovar')}
                  className={`px-3 py-2 text-sm rounded-md ${decisaoAdmin === 'aprovar' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-purple-800 text-purple-300'}`}
                >
                  Aprovar
                </button>
                <button
                  onClick={() => setDecisaoAdmin('rejeitar')}
                  className={`px-3 py-2 text-sm rounded-md ${decisaoAdmin === 'rejeitar' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-purple-800 text-purple-300'}`}
                >
                  Rejeitar
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm text-purple-200 mb-2">Comentário/Justificativa</label>
              <textarea
                value={respostaAdmin}
                onChange={(e) => setRespostaAdmin(e.target.value)}
                placeholder="Adicione um comentário para o funcionário..."
                className="w-full bg-purple-800 border border-purple-700 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 h-24"
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
                onClick={responderContestacao}
                className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md"
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