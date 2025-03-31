import React, { useState, useEffect } from 'react';
import FuncionariosService from './FuncionariosService';

const ModalGerenciarFuncionarios = ({ 
  jornadaSelecionada, 
  funcionariosPorJornada, 
  setFuncionariosPorJornada, 
  fecharModal 
}) => {
  const [funcionariosDisponiveis, setFuncionariosDisponiveis] = useState([]);
  const [funcionariosSelecionados, setFuncionariosSelecionados] = useState([]);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [todosFuncionarios, setTodosFuncionarios] = useState([]);
  const [funcionariosUserDashboard, setFuncionariosUserDashboard] = useState([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('');
  
  // Carregar todos os funcionários
  useEffect(() => {
    // Carrega os funcionários do FuncionariosService
    const funcionariosService = FuncionariosService.getTodosFuncionarios();
    setTodosFuncionarios(funcionariosService);
    
    // Tenta carregar os funcionários cadastrados no UserDashboard
    try {
      const timeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
      const userFuncionarios = [];
      
      // Extrai nomes únicos dos registros de ponto
      if (timeEntries && timeEntries.length > 0) {
        const uniqueNames = new Set();
        
        timeEntries.forEach(entry => {
          if (entry.employeeName && !uniqueNames.has(entry.employeeName)) {
            uniqueNames.add(entry.employeeName);
            userFuncionarios.push({
              id: entry.employeeId || Date.now() + Math.random(),
              nome: entry.employeeName,
              cargo: entry.cargo || 'Funcionário',
              departamento: entry.departamento || 'Empresa'
            });
          }
        });
      }
      
      // Também tenta obter o usuário atual do localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser && currentUser.name) {
        const nameExists = userFuncionarios.some(f => f.nome === currentUser.name);
        if (!nameExists) {
          userFuncionarios.push({
            id: currentUser.id || Date.now() + Math.random(),
            nome: currentUser.name,
            cargo: currentUser.role || 'Funcionário',
            departamento: currentUser.department || 'Empresa'
          });
        }
      }
      
      setFuncionariosUserDashboard(userFuncionarios);
    } catch (error) {
      console.error('Erro ao carregar funcionários do UserDashboard:', error);
    }
  }, []);
  
  // Combina todos os funcionários (do service e do UserDashboard)
  useEffect(() => {
    const allFuncionarios = [...todosFuncionarios];
    
    // Adicionar funcionários do UserDashboard que não existem na lista principal
    funcionariosUserDashboard.forEach(userFunc => {
      const exists = allFuncionarios.some(f => f.nome === userFunc.nome);
      if (!exists) {
        allFuncionarios.push(userFunc);
      }
    });
    
    // Atualizar funcionários disponíveis
    if (jornadaSelecionada) {
      const funcionariosAtribuidos = new Set();
      
      Object.entries(funcionariosPorJornada).forEach(([jornadaId, funcionarios]) => {
        if (parseInt(jornadaId) !== jornadaSelecionada.id) {
          funcionarios.forEach(nomeFuncionario => {
            funcionariosAtribuidos.add(nomeFuncionario);
          });
        }
      });
      
      const disponiveis = allFuncionarios.filter(funcionario => 
        !funcionariosAtribuidos.has(funcionario.nome)
      );
      
      setFuncionariosDisponiveis(disponiveis);
      
      // Inicializar funcionários já selecionados
      const selecionados = funcionariosPorJornada[jornadaSelecionada.id] || [];
      setFuncionariosSelecionados(selecionados);
    }
  }, [jornadaSelecionada, funcionariosPorJornada, todosFuncionarios, funcionariosUserDashboard]);
  
  // Função para adicionar funcionário à jornada quando selecionado no dropdown
  const handleAddFuncionario = () => {
    if (!funcionarioSelecionado || !jornadaSelecionada) return;
    
    const funcionario = [...todosFuncionarios, ...funcionariosUserDashboard].find(
      f => f.id.toString() === funcionarioSelecionado
    );
    
    if (!funcionario) return;
    
    // Adicionar funcionário à jornada
    const jornadaId = jornadaSelecionada.id;
    const funcionariosAtuais = funcionariosPorJornada[jornadaId] || [];
    
    // Verificar se funcionário já está na jornada
    if (funcionariosAtuais.includes(funcionario.nome)) return;
    
    // Adicionar funcionário à jornada
    const novosFuncionarios = [...funcionariosAtuais, funcionario.nome];
    const novoFuncionariosPorJornada = {
      ...funcionariosPorJornada,
      [jornadaId]: novosFuncionarios
    };
    
    // Atualizar estado
    setFuncionariosPorJornada(novoFuncionariosPorJornada);
    setFuncionariosSelecionados([...funcionariosSelecionados, funcionario.nome]);
    
    // Atualizar lista de funcionários disponíveis
    setFuncionariosDisponiveis(funcionariosDisponiveis.filter(f => f.id !== funcionario.id));
    
    // Limpar seleção
    setFuncionarioSelecionado('');
  };
  
  // Função para adicionar funcionário à jornada (método antigo)
  const adicionarFuncionarioJornada = (funcionario) => {
    if (!jornadaSelecionada) return;
    
    const jornadaId = jornadaSelecionada.id;
    const funcionariosAtuais = funcionariosPorJornada[jornadaId] || [];
    
    // Verificar se funcionário já está na jornada
    if (funcionariosAtuais.includes(funcionario.nome)) return;
    
    // Adicionar funcionário à jornada
    const novosFuncionarios = [...funcionariosAtuais, funcionario.nome];
    const novoFuncionariosPorJornada = {
      ...funcionariosPorJornada,
      [jornadaId]: novosFuncionarios
    };
    
    // Atualizar estado
    setFuncionariosPorJornada(novoFuncionariosPorJornada);
    setFuncionariosSelecionados([...funcionariosSelecionados, funcionario.nome]);
    
    // Atualizar lista de funcionários disponíveis
    setFuncionariosDisponiveis(funcionariosDisponiveis.filter(f => f.id !== funcionario.id));
  };
  
  // Função para remover funcionário da jornada
  const removerFuncionarioJornada = (nome) => {
    if (!jornadaSelecionada) return;
    
    const jornadaId = jornadaSelecionada.id;
    const funcionariosAtuais = funcionariosPorJornada[jornadaId] || [];
    
    // Remover funcionário da jornada
    const novosFuncionarios = funcionariosAtuais.filter(f => f !== nome);
    const novoFuncionariosPorJornada = {
      ...funcionariosPorJornada,
      [jornadaId]: novosFuncionarios
    };
    
    // Atualizar estado
    setFuncionariosPorJornada(novoFuncionariosPorJornada);
    setFuncionariosSelecionados(funcionariosSelecionados.filter(f => f !== nome));
    
    // Adicionar de volta à lista de funcionários disponíveis
    const funcionario = [...todosFuncionarios, ...funcionariosUserDashboard].find(f => f.nome === nome);
    if (funcionario) {
      setFuncionariosDisponiveis(prev => [...prev, funcionario]);
    }
  };
  
  // Filtrar funcionários disponíveis com base na busca
  const funcionariosFiltrados = funcionariosDisponiveis.filter(f => 
    f.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
    (f.cargo && f.cargo.toLowerCase().includes(filtroBusca.toLowerCase())) ||
    (f.departamento && f.departamento.toLowerCase().includes(filtroBusca.toLowerCase()))
  );
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-purple-800 rounded-lg shadow-lg p-6 w-full max-w-3xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Gerenciar Funcionários - {jornadaSelecionada.nome}</h3>
          <button 
            onClick={fecharModal}
            className="text-purple-300 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Caixa de seleção para adicionar funcionários */}
        <div className="bg-purple-900 bg-opacity-40 p-4 rounded-lg mb-6">
          <h4 className="font-semibold mb-3">Adicionar Funcionário</h4>
          <div className="flex space-x-2">
            <select
              className="flex-grow bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
              value={funcionarioSelecionado}
              onChange={(e) => setFuncionarioSelecionado(e.target.value)}
            >
              <option value="">Selecione um funcionário</option>
              {funcionariosDisponiveis.map(funcionario => (
                <option key={funcionario.id} value={funcionario.id}>
                  {funcionario.nome} {funcionario.cargo ? `(${funcionario.cargo})` : ''}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddFuncionario}
              disabled={!funcionarioSelecionado}
              className={`px-4 py-2 rounded-md ${
                funcionarioSelecionado 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              Adicionar
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6">
          {/* Funcionários Atribuídos */}
          <div>
            <h4 className="font-semibold mb-2">Funcionários Atribuídos</h4>
            <div className="bg-purple-900 bg-opacity-50 rounded-lg p-3 min-h-40 max-h-80 overflow-y-auto">
              {funcionariosSelecionados.length > 0 ? (
                <ul className="space-y-2">
                  {funcionariosSelecionados.map((nome, index) => (
                    <li key={index} className="flex justify-between items-center bg-purple-700 rounded-lg p-2">
                      <span>{nome}</span>
                      <button
                        onClick={() => removerFuncionarioJornada(nome)}
                        className="text-red-400 hover:text-red-300"
                        title="Remover"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-purple-400 py-4">
                  Nenhum funcionário atribuído a esta jornada
                </p>
              )}
            </div>
          </div>
          
          {/* Lista de Funcionários Disponíveis (antiga, mantida como alternativa) */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold">Todos os Funcionários Disponíveis</h4>
              <div>
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="bg-purple-700 border border-purple-600 rounded-md p-1 text-white text-sm w-40"
                  value={filtroBusca}
                  onChange={(e) => setFiltroBusca(e.target.value)}
                />
              </div>
            </div>
            <div className="bg-purple-900 bg-opacity-50 rounded-lg p-3 min-h-40 max-h-60 overflow-y-auto">
              {funcionariosFiltrados.length > 0 ? (
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {funcionariosFiltrados.map((funcionario) => (
                    <li 
                      key={funcionario.id} 
                      className="flex justify-between items-center bg-purple-700 rounded-lg p-2"
                    >
                      <div>
                        <div className="font-medium">{funcionario.nome}</div>
                        {funcionario.cargo && funcionario.departamento && (
                          <div className="text-xs text-purple-300">
                            {funcionario.cargo} - {funcionario.departamento}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => adicionarFuncionarioJornada(funcionario)}
                        className="bg-green-600 hover:bg-green-700 text-white rounded-full p-1"
                        title="Adicionar"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-purple-400 py-4">
                  {filtroBusca ? 'Nenhum funcionário encontrado' : 'Todos os funcionários já estão atribuídos'}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <button
            onClick={fecharModal}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalGerenciarFuncionarios;