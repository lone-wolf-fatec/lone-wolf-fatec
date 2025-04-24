import React, { useState, useEffect } from 'react';

const AdminAprovacaoTab = ({
  tipoSolicitacao, // 'ferias' ou 'folgas'
  userData,
  onSolicitacaoAprovada,
  onSolicitacaoRejeitada
}) => {
  // Estados
  const [solicitacoesPendentes, setSolicitacoesPendentes] = useState([]);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [itemSelecionadoRejeicao, setItemSelecionadoRejeicao] = useState(null);
  const [showRejeitarModal, setShowRejeitarModal] = useState(false);
  
  // Carregar solicitações pendentes ao iniciar
  useEffect(() => {
    carregarSolicitacoesPendentes();
  }, [tipoSolicitacao]);
  
  // Função para carregar solicitações pendentes
  const carregarSolicitacoesPendentes = () => {
    if (tipoSolicitacao === 'ferias') {
      const storedFerias = localStorage.getItem('feriasEntries');
      if (storedFerias) {
        const ferias = JSON.parse(storedFerias);
        const pendentes = ferias.filter(item => item.status === 'pendente');
        setSolicitacoesPendentes(pendentes);
      }
    } else {
      const storedFolgas = localStorage.getItem('folgaEntries');
      if (storedFolgas) {
        const folgas = JSON.parse(storedFolgas);
        const pendentes = folgas.filter(item => item.status === 'pendente');
        setSolicitacoesPendentes(pendentes);
      }
    }
  };
  
  // Função para aprovar solicitação
  const handleAprovar = (id) => {
    const chave = tipoSolicitacao === 'ferias' ? 'feriasEntries' : 'folgaEntries';
    const entries = JSON.parse(localStorage.getItem(chave) || '[]');
    
    const updatedEntries = entries.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'aprovado',
          dataAprovacao: new Date().toLocaleDateString('pt-BR')
        };
      }
      return item;
    });
    
    localStorage.setItem(chave, JSON.stringify(updatedEntries));
    
    // Encontrar a solicitação aprovada
    const solicitacao = entries.find(item => item.id === id);
    
    if (solicitacao) {
      // Atualizar banco de horas se necessário (para folgas do tipo banco de horas)
      if (tipoSolicitacao === 'folgas' && solicitacao.tipo === 'banco de horas') {
        const horasUtilizadas = solicitacao.periodo === 'dia' ? 8 : 4;
        const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
        
        const updatedFuncionarios = funcionarios.map(func => {
          if (func.id === solicitacao.funcionarioId) {
            return {
              ...func,
              bancoHoras: Math.max(0, (func.bancoHoras || 0) - horasUtilizadas)
            };
          }
          return func;
        });
        
        localStorage.setItem('funcionarios', JSON.stringify(updatedFuncionarios));
      }
      
      // Notificar funcionário
      const userNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
      userNotifications.push({
        id: Date.now(),
        userId: solicitacao.funcionarioId,
        message: tipoSolicitacao === 'ferias' 
          ? `Sua solicitação de férias de ${solicitacao.dataInicio} a ${solicitacao.dataFim} foi aprovada.`
          : `Sua solicitação de folga para ${solicitacao.data} foi aprovada.`,
        date: new Date().toLocaleDateString('pt-BR'),
        read: false
      });
      localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
      
      // Notificar componente pai
      if (onSolicitacaoAprovada) {
        onSolicitacaoAprovada(solicitacao);
      }
      
      // Atualizar lista
      carregarSolicitacoesPendentes();
    }
    
    alert(`Solicitação de ${tipoSolicitacao === 'ferias' ? 'férias' : 'folga'} aprovada com sucesso!`);
  };
  
  // Abrir modal de rejeição
  const abrirModalRejeitar = (item) => {
    setItemSelecionadoRejeicao(item);
    setMotivoRejeicao('');
    setShowRejeitarModal(true);
  };
  
  // Função para rejeitar solicitação
  const handleRejeitar = () => {
    if (!itemSelecionadoRejeicao) return;
    
    if (!motivoRejeicao) {
      alert('Por favor, informe o motivo da rejeição');
      return;
    }
    
    const chave = tipoSolicitacao === 'ferias' ? 'feriasEntries' : 'folgaEntries';
    const entries = JSON.parse(localStorage.getItem(chave) || '[]');
    
    const updatedEntries = entries.map(item => {
      if (item.id === itemSelecionadoRejeicao.id) {
        return {
          ...item,
          status: 'rejeitado',
          // Campo diferente para cada tipo de solicitação
          ...(tipoSolicitacao === 'ferias' 
            ? { motivoRejeicao: motivoRejeicao } 
            : { observacao_rejeicao: motivoRejeicao }
          ),
          dataRejeicao: new Date().toLocaleDateString('pt-BR')
        };
      }
      return item;
    });
    
    localStorage.setItem(chave, JSON.stringify(updatedEntries));
    
    // Notificar funcionário
    const userNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    userNotifications.push({
      id: Date.now(),
      userId: itemSelecionadoRejeicao.funcionarioId,
      message: tipoSolicitacao === 'ferias'
        ? `Sua solicitação de férias de ${itemSelecionadoRejeicao.dataInicio} a ${itemSelecionadoRejeicao.dataFim} foi rejeitada. Motivo: ${motivoRejeicao}`
        : `Sua solicitação de folga para ${itemSelecionadoRejeicao.data} foi rejeitada. Motivo: ${motivoRejeicao}`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    });
    localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
    
    // Notificar componente pai
    if (onSolicitacaoRejeitada) {
      onSolicitacaoRejeitada(itemSelecionadoRejeicao, motivoRejeicao);
    }
    
    // Fechar modal e atualizar
    setShowRejeitarModal(false);
    setItemSelecionadoRejeicao(null);
    setMotivoRejeicao('');
    carregarSolicitacoesPendentes();
    
    alert(`Solicitação de ${tipoSolicitacao === 'ferias' ? 'férias' : 'folga'} rejeitada.`);
  };
  
  // Renderizar status
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
      default:
        className = 'bg-gray-600';
    }
    
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs ${className}`}>
        {text}
      </span>
    );
  };
  
  return (
    <div className="bg-blue-900 bg-opacity-40 rounded-lg p-4 mt-6">
      <h4 className="font-semibold mb-3 text-blue-200">
        Solicitações de {tipoSolicitacao === 'ferias' ? 'Férias' : 'Folgas'} Pendentes
      </h4>
      
      {solicitacoesPendentes.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-blue-300 text-sm border-b border-blue-700">
                <th className="px-4 py-2 text-left">Funcionário</th>
                {tipoSolicitacao === 'ferias' ? (
                  <>
                    <th className="px-4 py-2 text-left">Período</th>
                    <th className="px-4 py-2 text-left">Dias</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-2 text-left">Data</th>
                    <th className="px-4 py-2 text-left">Tipo</th>
                    <th className="px-4 py-2 text-left">Período</th>
                  </>
                )}
                <th className="px-4 py-2 text-left">{tipoSolicitacao === 'ferias' ? 'Observação' : 'Motivo'}</th>
                <th className="px-4 py-2 text-left">Data Solicitação</th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {solicitacoesPendentes.map((item) => (
                <tr key={item.id} className="border-b border-blue-700 hover:bg-blue-800 hover:bg-opacity-30">
                  <td className="px-4 py-3">{item.funcionarioNome}</td>
                  
                  {tipoSolicitacao === 'ferias' ? (
                    <>
                      <td className="px-4 py-3">{item.dataInicio} a {item.dataFim}</td>
                      <td className="px-4 py-3">{item.diasTotais} dias</td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3">{item.data}</td>
                      <td className="px-4 py-3">{item.tipo}</td>
                      <td className="px-4 py-3">
                        {item.periodo === 'dia' ? 'Dia inteiro' :
                        item.periodo === 'manhã' ? 'Manhã' : 'Tarde'}
                      </td>
                    </>
                  )}
                  
                  <td className="px-4 py-3">
                    <div className="truncate max-w-xs" title={tipoSolicitacao === 'ferias' ? item.observacao : item.motivo}>
                      {tipoSolicitacao === 'ferias' ? (item.observacao || '-') : (item.motivo || '-')}
                    </div>
                  </td>
                  <td className="px-4 py-3">{item.dataSolicitacao || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAprovar(item.id)}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                      >
                        Aprovar
                      </button>
                      <button
                        onClick={() => abrirModalRejeitar(item)}
                        className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                      >
                        Rejeitar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-blue-200 py-4">
          Não há solicitações de {tipoSolicitacao === 'ferias' ? 'férias' : 'folgas'} pendentes.
        </p>
      )}
      
      {/* Modal de Rejeição */}
      {showRejeitarModal && itemSelecionadoRejeicao && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">
                Rejeitar Solicitação de {tipoSolicitacao === 'ferias' ? 'Férias' : 'Folga'}
              </h3>
              <button
                onClick={() => setShowRejeitarModal(false)}
                className="text-purple-300 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-purple-200">
                Você está rejeitando a solicitação de {tipoSolicitacao === 'ferias' ? 'férias' : 'folga'} de <strong>{itemSelecionadoRejeicao.funcionarioNome}</strong>
                {tipoSolicitacao === 'ferias' 
                  ? ` para o período de ${itemSelecionadoRejeicao.dataInicio} a ${itemSelecionadoRejeicao.dataFim}.`
                  : ` para ${itemSelecionadoRejeicao.data} (${itemSelecionadoRejeicao.periodo === 'dia' ? 'dia inteiro' : itemSelecionadoRejeicao.periodo}).`
                }
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-purple-300 mb-1">Motivo da Rejeição*</label>
              <textarea 
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                rows="3"
                value={motivoRejeicao}
                onChange={(e) => setMotivoRejeicao(e.target.value)}
                placeholder="Informe o motivo da rejeição"
                required
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowRejeitarModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={handleRejeitar}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md"
                disabled={!motivoRejeicao}
              >
                Rejeitar {tipoSolicitacao === 'ferias' ? 'Férias' : 'Folga'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAprovacaoTab;