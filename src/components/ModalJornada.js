import React from 'react';

const ModalJornada = ({ 
  jornadaEmEdicao, 
  novaJornada, 
  setNovaJornada, 
  salvarJornada, 
  fecharModal,
  alternarDiaTrabalho
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-purple-800 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">
          {jornadaEmEdicao ? 'Editar Jornada' : 'Nova Jornada'}
        </h3>
        
        <form onSubmit={salvarJornada}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-sm text-purple-300 mb-1">Nome *</label>
              <input 
                type="text" 
                className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                value={novaJornada.nome}
                onChange={(e) => setNovaJornada({...novaJornada, nome: e.target.value})}
                required
                placeholder="Nome da jornada"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm text-purple-300 mb-1">Descrição</label>
              <input 
                type="text" 
                className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                value={novaJornada.descricao}
                onChange={(e) => setNovaJornada({...novaJornada, descricao: e.target.value})}
                placeholder="Descrição da jornada"
              />
            </div>
            
            <div>
              <label className="block text-sm text-purple-300 mb-1">Hora Início *</label>
              <input 
                type="time" 
                className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                value={novaJornada.horaInicio}
                onChange={(e) => setNovaJornada({...novaJornada, horaInicio: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-purple-300 mb-1">Hora Fim *</label>
              <input 
                type="time" 
                className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                value={novaJornada.horaFim}
                onChange={(e) => setNovaJornada({...novaJornada, horaFim: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-purple-300 mb-1">Intervalo Início</label>
              <input 
                type="time" 
                className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                value={novaJornada.intervaloInicio || ''}
                onChange={(e) => setNovaJornada({...novaJornada, intervaloInicio: e.target.value || null})}
              />
            </div>
            
            <div>
              <label className="block text-sm text-purple-300 mb-1">Intervalo Fim</label>
              <input 
                type="time" 
                className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                value={novaJornada.intervaloFim || ''}
                onChange={(e) => setNovaJornada({...novaJornada, intervaloFim: e.target.value || null})}
              />
            </div>
            
            <div>
              <label className="block text-sm text-purple-300 mb-1">Tolerância Entrada (min)</label>
              <input 
                type="number" 
                className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                value={novaJornada.toleranciaEntrada}
                onChange={(e) => setNovaJornada({...novaJornada, toleranciaEntrada: parseInt(e.target.value) || 0})}
                min="0"
                max="60"
              />
            </div>
            
            <div>
              <label className="block text-sm text-purple-300 mb-1">Tolerância Saída (min)</label>
              <input 
                type="number" 
                className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                value={novaJornada.toleranciaSaida}
                onChange={(e) => setNovaJornada({...novaJornada, toleranciaSaida: parseInt(e.target.value) || 0})}
                min="0"
                max="60"
              />
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="checkAtivo"
                className="mr-2"
                checked={novaJornada.ativo}
                onChange={() => setNovaJornada({...novaJornada, ativo: !novaJornada.ativo})}
              />
              <label htmlFor="checkAtivo" className="text-sm">Jornada Ativa</label>
            </div>
            
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="checkEscalaEspecial"
                className="mr-2"
                checked={novaJornada.escalaEspecial}
                onChange={() => setNovaJornada({...novaJornada, escalaEspecial: !novaJornada.escalaEspecial})}
              />
              <label htmlFor="checkEscalaEspecial" className="text-sm">Escala Especial</label>
            </div>
            
            {novaJornada.escalaEspecial && (
              <div className="md:col-span-2">
                <label className="block text-sm text-purple-300 mb-1">Carga Horária Semanal *</label>
                <input 
                  type="number" 
                  className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                  value={novaJornada.cargaHorariaSemanal}
                  onChange={(e) => setNovaJornada({...novaJornada, cargaHorariaSemanal: parseFloat(e.target.value) || 0})}
                  step="0.5"
                  min="0"
                  required={novaJornada.escalaEspecial}
                />
              </div>
            )}
            
            {!novaJornada.escalaEspecial && (
              <div className="md:col-span-2">
                <label className="block text-sm text-purple-300 mb-2">Dias de Trabalho *</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 0, nome: 'Dom' },
                    { id: 1, nome: 'Seg' },
                    { id: 2, nome: 'Ter' },
                    { id: 3, nome: 'Qua' },
                    { id: 4, nome: 'Qui' },
                    { id: 5, nome: 'Sex' },
                    { id: 6, nome: 'Sáb' }
                  ].map(dia => (
                    <button
                      key={dia.id}
                      type="button"
                      className={`px-3 py-1 rounded-full text-sm ${
                        novaJornada.diasTrabalho.includes(dia.id)
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-purple-900 hover:bg-purple-800'
                      }`}
                      onClick={() => alternarDiaTrabalho(dia.id)}
                    >
                      {dia.nome}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <button 
              type="button"
              onClick={fecharModal}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
            >
              {jornadaEmEdicao ? 'Atualizar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalJornada;