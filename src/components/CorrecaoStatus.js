// CorrecaoStatus.js
import React, { useState, useEffect } from 'react';

const CorrecaoStatus = ({ entry, onSolicitarCorrecao }) => {
  const [solicitacao, setSolicitacao] = useState(null);

  useEffect(() => {
    const solicitacoes = JSON.parse(localStorage.getItem('ajustePontoSolicitacoes') || '[]');
    const encontrada = solicitacoes.find(s => 
      s.funcionarioId === entry.employeeId && 
      s.data === entry.date && 
      s.tipoRegistro === entry.type
    );
    setSolicitacao(encontrada);
  }, [entry]);

  // Se já existe uma solicitação com decisão (aprovada ou rejeitada)
  if (solicitacao && (solicitacao.status === 'aprovado' || solicitacao.status === 'rejeitado')) {
    return (
      <div className="text-sm bg-purple-700 bg-opacity-50 p-2 rounded">
        <span className="text-purple-200">
          Ponto corrigido! Veja sua situação em Registros Recentes
        </span>
      </div>
    );
  }

  // Se tem solicitação pendente
  if (solicitacao && solicitacao.status === 'pendente') {
    return (
      <span className="inline-block px-2 py-1 rounded-full text-xs bg-yellow-600">
        CORREÇÃO PENDENTE
      </span>
    );
  }

  // Se não tem solicitação, mostra o botão
  return (
    <button
      onClick={() => onSolicitarCorrecao(entry)}
      className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded-md"
    >
      Solicitar Correção
    </button>
  );
};

export default CorrecaoStatus;