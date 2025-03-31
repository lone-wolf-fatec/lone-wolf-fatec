import React, { useState, useEffect } from 'react';
import FuncionariosService from './FuncionariosService';

export const useFuncionarioSelector = (funcionariosPorJornada, jornadaId) => {
  const [todosFuncionarios, setTodosFuncionarios] = useState([]);
  const [funcionariosDisponiveis, setFuncionariosDisponiveis] = useState([]);
  const [funcionariosSelecionados, setFuncionariosSelecionados] = useState([]);

  // Carregar funcionários
  useEffect(() => {
    const funcionarios = FuncionariosService.getTodosFuncionarios();
    setTodosFuncionarios(funcionarios);
  }, []);

  // Inicializar funcionários da jornada
  useEffect(() => {
    if (jornadaId) {
      const funcionariosNaJornada = funcionariosPorJornada[jornadaId] || [];
      setFuncionariosSelecionados(funcionariosNaJornada);
    }
  }, [funcionariosPorJornada, jornadaId]);

  // Atualizar funcionários disponíveis
  useEffect(() => {
    const disponiveis = todosFuncionarios.filter(funcionario => {
      // Verificar se o funcionário não está em outra jornada
      const estaEmOutraJornada = Object.entries(funcionariosPorJornada).some(
        ([id, funcionarios]) => 
          id !== String(jornadaId) && 
          funcionarios.includes(funcionario.id)
      );

      return !estaEmOutraJornada || funcionariosSelecionados.includes(funcionario.id);
    });

    setFuncionariosDisponiveis(disponiveis);
  }, [todosFuncionarios, funcionariosPorJornada, funcionariosSelecionados, jornadaId]);

  // Adicionar funcionário
  const adicionarFuncionario = (funcionarioId) => {
    if (!funcionariosSelecionados.includes(funcionarioId)) {
      setFuncionariosSelecionados([...funcionariosSelecionados, funcionarioId]);
    }
  };

  // Remover funcionário
  const removerFuncionario = (funcionarioId) => {
    setFuncionariosSelecionados(
      funcionariosSelecionados.filter(id => id !== funcionarioId)
    );
  };

  // Obter nomes dos funcionários selecionados
  const obterNomesFuncionariosSelecionados = () => {
    return funcionariosSelecionados.map(id => 
      todosFuncionarios.find(f => f.id === id)?.nome || ''
    );
  };

  return {
    todosFuncionarios,
    funcionariosDisponiveis,
    funcionariosSelecionados,
    adicionarFuncionario,
    removerFuncionario,
    obterNomesFuncionariosSelecionados,
    setFuncionariosSelecionados
  };
};

// Componente de seleção de funcionários reutilizável
export const SeletorFuncionarios = ({
  funcionariosDisponiveis,
  funcionariosSelecionados,
  adicionarFuncionario,
  removerFuncionario,
  todosFuncionarios
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Funcionários Disponíveis */}
      <div>
        <h4 className="font-semibold mb-2">Funcionários Disponíveis</h4>
        <div className="space-y-2">
          {funcionariosDisponiveis.map(funcionario => (
            <div 
              key={funcionario.id} 
              className="flex justify-between items-center bg-gray-100 p-2 rounded"
            >
              <span>{funcionario.nome}</span>
              <button 
                onClick={() => adicionarFuncionario(funcionario.id)}
                className="bg-green-500 text-white p-1 rounded"
              >
                +
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Funcionários Selecionados */}
      <div>
        <h4 className="font-semibold mb-2">Funcionários Selecionados</h4>
        <div className="space-y-2">
          {funcionariosSelecionados.map(funcionarioId => {
            const funcionario = todosFuncionarios.find(f => f.id === funcionarioId);
            return funcionario ? (
              <div 
                key={funcionario.id} 
                className="flex justify-between items-center bg-gray-100 p-2 rounded"
              >
                <span>{funcionario.nome}</span>
                <button 
                  onClick={() => removerFuncionario(funcionario.id)}
                  className="bg-red-500 text-white p-1 rounded"
                >
                  -
                </button>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
};

// Exportar hook personalizado e componente
export { 
  useFuncionarioSelector, 
  SeletorFuncionarios 
};

export default SeletorFuncionarios;