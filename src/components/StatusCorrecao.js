// StatusCorrecao.js
import React, { useState } from 'react';

const StatusCorrecao = ({ solicitacao }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (solicitacao.status === 'pendente') {
    return (
      <div className="inline-flex items-center bg-yellow-600 px-3 py-2 rounded-lg text-xs font-medium">
        <span className="mr-1">⋯</span>
        CORREÇÃO PENDENTE
      </div>
    );
  }

  const isApproved = solicitacao.status === 'aprovado';
  
  return (
    <div className="flex flex-col gap-2">
      <div className={`flex items-center justify-between w-full px-3 py-2 rounded-lg ${
        isApproved ? 'bg-green-600' : 'bg-red-600'
      }`}>
        <span className="font-medium">
          {isApproved ? '✓ APROVADO' : '✕ REJEITADO'}
        </span>
        {solicitacao.justificativaAdmin && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-white hover:text-purple-200 underline ml-2"
          >
            {showDetails ? 'Ocultar Detalhes' : 'Ver Detalhes'}
          </button>
        )}
      </div>
      {showDetails && solicitacao.justificativaAdmin && (
        <div className="mt-2 bg-purple-900 bg-opacity-50 p-3 rounded text-sm">
          <div className="mb-2">
            <span className="text-purple-300">Justificativa:</span> {solicitacao.justificativaAdmin}
          </div>
          <div className="text-xs text-purple-300">
            Data da decisão: {solicitacao.dataDecisao}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusCorrecao;