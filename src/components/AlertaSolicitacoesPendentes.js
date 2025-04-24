import React, { useState } from 'react';

const AlertaSolicitacoesPendentes = ({ solicitacoesPendentes, setActiveTab }) => {
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  
  if (solicitacoesPendentes.length === 0) {
    return null;
  }
  
  const toggleDetalhes = () => {
    setMostrarDetalhes(!mostrarDetalhes);
  };
  
  const fecharDetalhes = () => {
    setMostrarDetalhes(false);
  };
  
  return (
    <div className="bg-yellow-600 bg-opacity-40 backdrop-blur-sm rounded-lg p-3 mb-5">
      {!mostrarDetalhes ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>Você tem {solicitacoesPendentes.length} solicitação(ões) de correção de ponto pendente(s) de aprovação.</span>
          </div>
          <button 
            onClick={toggleDetalhes}
            className="bg-yellow-500 hover:bg-yellow-600 px-3 py-1 rounded-md text-sm font-medium"
          >
            Ver Detalhes
          </button>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-medium text-lg">Detalhes das Solicitações</h3>
            <button 
              onClick={fecharDetalhes}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md text-sm font-medium"
            >
              Fechar
            </button>
          </div>
          
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {solicitacoesPendentes.map((solicitacao, index) => (
              <div key={index} className="bg-white bg-opacity-90 p-3 rounded-md">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-sm font-medium">Data:</p>
                    <p className="text-sm">{solicitacao.data}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Tipo:</p>
                    <p className="text-sm">{solicitacao.tipo}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Horário Original:</p>
                    <p className="text-sm">{solicitacao.horarioOriginal}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Horário Solicitado:</p>
                    <p className="text-sm">{solicitacao.horarioSolicitado}</p>
                  </div>
                </div>
                <div className="mt-2">
                  <p className="text-sm font-medium">Justificativa:</p>
                  <p className="text-sm">{solicitacao.justificativa}</p>
                </div>
                <div className="mt-3 flex space-x-2">
                  <button 
                    onClick={() => {
                      // Lógica para aprovar a solicitação
                      // ...
                      fecharDetalhes();
                    }}
                    className="bg-green-500 hover:bg-green-600 px-3 py-1 rounded-md text-sm font-medium text-white"
                  >
                    Aprovar
                  </button>
                  <button 
                    onClick={() => {
                      // Lógica para recusar a solicitação
                      // ...
                      fecharDetalhes();
                    }}
                    className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm font-medium text-white"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertaSolicitacoesPendentes;