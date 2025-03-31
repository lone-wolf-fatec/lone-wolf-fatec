import React from 'react';

const ModalExcluirJornada = ({ 
  jornadaParaExcluir, 
  funcionariosPorJornada, 
  excluirJornada, 
  fecharModal 
}) => {
  // Verificar se há funcionários nesta jornada
  const temFuncionarios = funcionariosPorJornada[jornadaParaExcluir?.id]?.length > 0;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-purple-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-4">Confirmar Exclusão</h3>
        <p className="mb-6">
          Tem certeza que deseja excluir a jornada <strong>{jornadaParaExcluir?.nome}</strong>?
          {temFuncionarios && (
            <span className="block text-red-400 mt-2">
              Atenção: Esta jornada possui {funcionariosPorJornada[jornadaParaExcluir.id].length} funcionários associados. 
              É necessário remover os funcionários antes de excluir.
            </span>
          )}
        </p>
        <div className="flex justify-end space-x-2">
          <button 
            onClick={fecharModal}
            className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
          >
            Cancelar
          </button>
          <button 
            onClick={excluirJornada}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
            disabled={temFuncionarios}
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalExcluirJornada;