import React from 'react';

const JornadaCard = ({ 
  jornada, 
  funcionariosCadastrados,
  funcionariosPorJornada, 
  renderizarDiasTrabalho, 
  alternarStatusJornada,
  abrirModalEditarJornada,
  confirmarExclusaoJornada,
  abrirModalGerenciarFuncionarios
}) => {
  return (
    <div 
      className={`bg-purple-900 bg-opacity-40 rounded-lg p-4 shadow ${!jornada.ativo ? 'opacity-70' : ''}`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold">{jornada.nome}</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => alternarStatusJornada(jornada.id)}
            className={`p-1 rounded ${jornada.ativo ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
            title={jornada.ativo ? 'Desativar Jornada' : 'Ativar Jornada'}
          >
            ✅
          </button>
          <button 
            onClick={() => abrirModalEditarJornada(jornada)}
            className="bg-blue-600 hover:bg-blue-700 p-1 rounded"
            title="Editar Jornada"
          >
            ✏️
          </button>
          <button 
            onClick={() => confirmarExclusaoJornada(jornada)}
            className="bg-red-600 hover:bg-red-700 p-1 rounded"
            title="Excluir Jornada"
          >
            🗑️
          </button>
        </div>
      </div>
      <p className="text-purple-300 text-sm mb-3">{jornada.descricao}</p>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
        <div>
          <span className="text-purple-300 text-xs">Horário:</span>
          <p>{jornada.horaInicio} - {jornada.horaFim}</p>
        </div>
        <div>
          <span className="text-purple-300 text-xs">Intervalo:</span>
          <p>{jornada.intervaloInicio ? `${jornada.intervaloInicio} - ${jornada.intervaloFim}` : 'Sem intervalo'}</p>
        </div>
      </div>
      
      {/* Funcionários disponíveis */}
      <div>
        <span className="text-purple-300 text-xs">Funcionários Disponíveis:</span>
        <div className="mt-1 flex flex-wrap gap-1">
          {funcionariosCadastrados.map((funcionario, index) => (
            <span 
              key={index} 
              className="bg-gray-700 text-xs px-2 py-1 rounded-full cursor-pointer hover:bg-gray-500"
              title={funcionario}
              onClick={() => abrirModalGerenciarFuncionarios(jornada, funcionario)}
            >
              {funcionario}
            </span>
          ))}
        </div>
      </div>

      {/* Funcionários nesta jornada */}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-purple-300 text-xs">
            Funcionários nesta Jornada ({funcionariosPorJornada[jornada.id]?.length || 0}):
          </span>
          <button
            onClick={() => abrirModalGerenciarFuncionarios(jornada)}
            className="text-purple-300 hover:text-white text-xs underline"
          >
            Gerenciar
          </button>
        </div>
        <div className="mt-1 flex flex-wrap gap-1">
          {funcionariosPorJornada[jornada.id]?.map((funcionario, index) => (
            <span 
              key={index} 
              className="bg-purple-700 text-xs px-2 py-1 rounded-full"
              title={funcionario}
            >
              {funcionario}
            </span>
          ))}
          {(!funcionariosPorJornada[jornada.id] || funcionariosPorJornada[jornada.id].length === 0) && (
            <span className="text-purple-400 text-xs">Nenhum funcionário atribuído</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default JornadaCard;