import React from 'react';

const PendentesTab = ({ 
  tipoSolicitacao, // 'ferias' ou 'folgas'
  solicitacoesPendentes
}) => {
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
    <div className="mt-6 bg-purple-900 bg-opacity-40 rounded-lg p-4">
      <h4 className="font-semibold mb-3">Suas Solicitações Pendentes</h4>
      
      {solicitacoesPendentes && solicitacoesPendentes.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-purple-300 text-sm border-b border-purple-700">
                {tipoSolicitacao === 'ferias' ? (
                  <>
                    <th className="px-4 py-2 text-left">Período</th>
                    <th className="px-4 py-2 text-left">Dias</th>
                    <th className="px-4 py-2 text-left">Observação</th>
                  </>
                ) : (
                  <>
                    <th className="px-4 py-2 text-left">Data</th>
                    <th className="px-4 py-2 text-left">Tipo</th>
                    <th className="px-4 py-2 text-left">Período</th>
                    <th className="px-4 py-2 text-left">Motivo</th>
                  </>
                )}
                <th className="px-4 py-2 text-left">Data de Solicitação</th>
                <th className="px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {solicitacoesPendentes.map((item) => (
                <tr key={item.id} className="border-b border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                  {tipoSolicitacao === 'ferias' ? (
                    <>
                      <td className="px-4 py-3">{item.dataInicio} a {item.dataFim}</td>
                      <td className="px-4 py-3">{item.diasTotais} dias</td>
                      <td className="px-4 py-3">
                        <div className="truncate max-w-xs" title={item.observacao}>
                          {item.observacao || '-'}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
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
                    </>
                  )}
                  <td className="px-4 py-3">{item.dataSolicitacao || '-'}</td>
                  <td className="px-4 py-3">{renderStatus(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-purple-300 py-2">
          Você não tem solicitações de {tipoSolicitacao === 'ferias' ? 'férias' : 'folgas'} pendentes.
        </p>
      )}
    </div>
  );
};

export default PendentesTab;