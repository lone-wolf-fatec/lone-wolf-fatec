import React, { useState, useEffect } from 'react';
import FuncionariosService from './FuncionariosService';
import JornadasService from './JornadasService';

const FuncionariosTab = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [jornadas, setJornadas] = useState([]);
  const [funcionariosPorJornada, setFuncionariosPorJornada] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState(null);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState('nome');
  const [ordenacaoDirecao, setOrdenacaoDirecao] = useState('asc');
  
  // Estado para novo/edição funcionário
  const [formFuncionario, setFormFuncionario] = useState({
    id: null,
    nome: '',
    cargo: '',
    departamento: '',
    jornadaId: ''
  });
  
  // Carregar dados ao iniciar
  useEffect(() => {
    carregarDados();
  }, []);
  
  // Função para carregar todos os dados necessários
  const carregarDados = () => {
    const funcionariosData = FuncionariosService.getTodosFuncionarios();
    const jornadasData = JornadasService.getTodasJornadas();
    const funcionariosPorJornadaData = FuncionariosService.getFuncionariosPorJornada();
    
    setFuncionarios(funcionariosData);
    setJornadas(jornadasData);
    setFuncionariosPorJornada(funcionariosPorJornadaData);
  };
  
  // Abrir modal para criar funcionário
  const abrirModalCriar = () => {
    setFuncionarioSelecionado(null);
    setFormFuncionario({
      id: null,
      nome: '',
      cargo: '',
      departamento: '',
      jornadaId: ''
    });
    setModalAberto(true);
  };
  
  // Abrir modal para editar funcionário
  const abrirModalEditar = (funcionario) => {
    // Encontrar a jornada atual do funcionário
    let jornadaId = '';
    Object.entries(funcionariosPorJornada).forEach(([id, nomes]) => {
      if (nomes.includes(funcionario.nome)) {
        jornadaId = id;
      }
    });
    
    setFuncionarioSelecionado(funcionario);
    setFormFuncionario({
      ...funcionario,
      jornadaId
    });
    setModalAberto(true);
  };
  
  // Abrir modal de exclusão
  const abrirModalExclusao = (funcionario) => {
    setFuncionarioParaExcluir(funcionario);
    setModalExclusaoAberto(true);
  };
  
  // Salvar funcionário (criar ou editar)
  const salvarFuncionario = (e) => {
    e.preventDefault();
    
    if (!formFuncionario.nome || !formFuncionario.cargo || !formFuncionario.departamento) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    // Processar funcionário
    let funcionarioAtualizado;
    let jornadaAnteriorId = null;
    
    if (funcionarioSelecionado) {
      // Editar funcionário existente
      funcionarioAtualizado = {
        ...formFuncionario
      };
      
      // Encontrar jornada anterior
      Object.entries(funcionariosPorJornada).forEach(([id, nomes]) => {
        if (nomes.includes(funcionarioSelecionado.nome)) {
          jornadaAnteriorId = parseInt(id);
        }
      });
      
      // Atualizar funcionário na lista
      const funcionariosAtualizados = funcionarios.map(f => 
        f.id === funcionarioSelecionado.id ? funcionarioAtualizado : f
      );
      
      setFuncionarios(funcionariosAtualizados);
      localStorage.setItem('funcionarios', JSON.stringify(funcionariosAtualizados));
    } else {
      // Criar novo funcionário
      funcionarioAtualizado = {
        ...formFuncionario,
        id: Date.now()
      };
      
      // Adicionar funcionário à lista
      const funcionariosAtualizados = [...funcionarios, funcionarioAtualizado];
      setFuncionarios(funcionariosAtualizados);
      localStorage.setItem('funcionarios', JSON.stringify(funcionariosAtualizados));
    }
    
    // Atualizar jornada do funcionário, se necessário
    if (formFuncionario.jornadaId) {
      const jornadaId = parseInt(formFuncionario.jornadaId);
      
      // Remover da jornada anterior, se houver e for diferente
      if (jornadaAnteriorId && jornadaAnteriorId !== jornadaId) {
        const funcionariosJornadaAnterior = funcionariosPorJornada[jornadaAnteriorId] || [];
        const nomeAntigo = funcionarioSelecionado.nome;
        
        const novosFuncionariosJornadaAnterior = funcionariosJornadaAnterior.filter(
          n => n !== nomeAntigo
        );
        
        funcionariosPorJornada[jornadaAnteriorId] = novosFuncionariosJornadaAnterior;
      }
      
      // Adicionar à nova jornada
      const funcionariosJornada = funcionariosPorJornada[jornadaId] || [];
      
      // Verificar se o nome já existe na jornada
      const jaExiste = funcionariosJornada.includes(funcionarioAtualizado.nome);
      
      if (!jaExiste) {
        // Se está editando, remover o nome antigo primeiro
        const novosFuncionariosJornada = funcionarioSelecionado
          ? funcionariosJornada.filter(n => n !== funcionarioSelecionado.nome)
          : [...funcionariosJornada];
        
        novosFuncionariosJornada.push(funcionarioAtualizado.nome);
        
        const novoFuncionariosPorJornada = {
          ...funcionariosPorJornada,
          [jornadaId]: novosFuncionariosJornada
        };
        
        setFuncionariosPorJornada(novoFuncionariosPorJornada);
        localStorage.setItem('funcionariosPorJornada', JSON.stringify(novoFuncionariosPorJornada));
      }
    } else if (jornadaAnteriorId) {
      // Remover da jornada anterior, se estiver removendo a atribuição
      const funcionariosJornadaAnterior = funcionariosPorJornada[jornadaAnteriorId] || [];
      const nomeAntigo = funcionarioSelecionado.nome;
      
      const novosFuncionariosJornadaAnterior = funcionariosJornadaAnterior.filter(
        n => n !== nomeAntigo
      );
      
      const novoFuncionariosPorJornada = {
        ...funcionariosPorJornada,
        [jornadaAnteriorId]: novosFuncionariosJornadaAnterior
      };
      
      setFuncionariosPorJornada(novoFuncionariosPorJornada);
      localStorage.setItem('funcionariosPorJornada', JSON.stringify(novoFuncionariosPorJornada));
    }
    
    // Fechar modal
    setModalAberto(false);
    setFuncionarioSelecionado(null);
  };
  
  // Excluir funcionário
  const excluirFuncionario = () => {
    if (!funcionarioParaExcluir) return;
    
    // Remover funcionário da lista
    const funcionariosAtualizados = funcionarios.filter(f => f.id !== funcionarioParaExcluir.id);
    setFuncionarios(funcionariosAtualizados);
    localStorage.setItem('funcionarios', JSON.stringify(funcionariosAtualizados));
    
    // Remover funcionário de todas as jornadas
    const novoFuncionariosPorJornada = { ...funcionariosPorJornada };
    
    Object.keys(novoFuncionariosPorJornada).forEach(jornadaId => {
      novoFuncionariosPorJornada[jornadaId] = novoFuncionariosPorJornada[jornadaId].filter(
        nome => nome !== funcionarioParaExcluir.nome
      );
    });
    
    setFuncionariosPorJornada(novoFuncionariosPorJornada);
    localStorage.setItem('funcionariosPorJornada', JSON.stringify(novoFuncionariosPorJornada));
    
    // Fechar modal
    setModalExclusaoAberto(false);
    setFuncionarioParaExcluir(null);
  };
  
  // Buscar a jornada de um funcionário
  const buscarJornadaFuncionario = (funcionarioNome) => {
    let jornadaEncontrada = null;
    
    Object.entries(funcionariosPorJornada).forEach(([jornadaId, nomes]) => {
      if (nomes.includes(funcionarioNome)) {
        jornadaEncontrada = jornadas.find(j => j.id === parseInt(jornadaId));
      }
    });
    
    return jornadaEncontrada;
  };
  
  // Filtrar funcionários pela busca
  const funcionariosFiltrados = funcionarios.filter(f => 
    f.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
    f.cargo.toLowerCase().includes(filtroBusca.toLowerCase()) ||
    f.departamento.toLowerCase().includes(filtroBusca.toLowerCase())
  );
  
  // Ordenar funcionários
  const funcionariosOrdenados = [...funcionariosFiltrados].sort((a, b) => {
    let valorA = a[ordenacao]?.toLowerCase();
    let valorB = b[ordenacao]?.toLowerCase();
    
    // Para ordenação por jornada
    if (ordenacao === 'jornada') {
      const jornadaA = buscarJornadaFuncionario(a.nome);
      const jornadaB = buscarJornadaFuncionario(b.nome);
      
      valorA = jornadaA ? jornadaA.nome.toLowerCase() : 'zzz'; // Sem jornada ficam por último
      valorB = jornadaB ? jornadaB.nome.toLowerCase() : 'zzz';
    }
    
    if (ordenacaoDirecao === 'asc') {
      return valorA < valorB ? -1 : valorA > valorB ? 1 : 0;
    } else {
      return valorA > valorB ? -1 : valorA < valorB ? 1 : 0;
    }
  });
  
  // Alternar ordenação
  const alternarOrdenacao = (campo) => {
    if (ordenacao === campo) {
      // Alternar direção
      setOrdenacaoDirecao(ordenacaoDirecao === 'asc' ? 'desc' : 'asc');
    } else {
      // Mudar campo e resetar direção
      setOrdenacao(campo);
      setOrdenacaoDirecao('asc');
    }
  };
  
  return (
    <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Funcionários</h1>
        <button 
          onClick={abrirModalCriar}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Funcionário
        </button>
      </div>
      
      <div className="mb-4">
        <input 
          type="text" 
          className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
          placeholder="Buscar por nome, cargo ou departamento..."
          value={filtroBusca}
          onChange={(e) => setFiltroBusca(e.target.value)}
        />
      </div>
      
      <div className="bg-purple-900 bg-opacity-50 rounded-lg overflow-hidden shadow">
        <table className="w-full">
          <thead>
            <tr className="bg-purple-800">
              <th 
                className="p-3 text-left cursor-pointer"
                onClick={() => alternarOrdenacao('nome')}
              >
                Nome
                {ordenacao === 'nome' && (
                  <span className="ml-1">
                    {ordenacaoDirecao === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
              <th 
                className="p-3 text-left cursor-pointer"
                onClick={() => alternarOrdenacao('cargo')}
              >
                Cargo
                {ordenacao === 'cargo' && (
                  <span className="ml-1">
                    {ordenacaoDirecao === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
              <th 
                className="p-3 text-left cursor-pointer"
                onClick={() => alternarOrdenacao('departamento')}
              >
                Departamento
                {ordenacao === 'departamento' && (
                  <span className="ml-1">
                    {ordenacaoDirecao === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
              <th 
                className="p-3 text-left cursor-pointer"
                onClick={() => alternarOrdenacao('jornada')}
              >
                Jornada
                {ordenacao === 'jornada' && (
                  <span className="ml-1">
                    {ordenacaoDirecao === 'asc' ? '▲' : '▼'}
                  </span>
                )}
              </th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionariosOrdenados.map(funcionario => {
              const jornada = buscarJornadaFuncionario(funcionario.nome);
              
              return (
                <tr key={funcionario.id} className="border-t border-purple-700">
                  <td className="p-3">{funcionario.nome}</td>
                  <td className="p-3">{funcionario.cargo}</td>
                  <td className="p-3">{funcionario.departamento}</td>
                  <td className="p-3">
                    {jornada ? (
                      <span className={`px-2 py-1 rounded-full text-xs ${jornada.ativo ? 'bg-green-700' : 'bg-gray-700'}`}>
                        {jornada.nome}
                      </span>
                    ) : (
                      <span className="text-purple-400 text-sm">Sem jornada</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => abrirModalEditar(funcionario)}
                        className="bg-blue-600 hover:bg-blue-700 p-1 rounded"
                        title="Editar Funcionário"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => abrirModalExclusao(funcionario)}
                        className="bg-red-600 hover:bg-red-700 p-1 rounded"
                        title="Excluir Funcionário"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            
            {funcionariosOrdenados.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-purple-300">
                  {filtroBusca 
                    ? 'Nenhum funcionário encontrado com os critérios de busca.' 
                    : 'Nenhum funcionário cadastrado.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Modal de Edição/Criação de Funcionário */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {funcionarioSelecionado ? 'Editar Funcionário' : 'Novo Funcionário'}
            </h3>
            
            <form onSubmit={salvarFuncionario}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Nome *</label>
                  <input 
                    type="text" 
                    className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                    value={formFuncionario.nome}
                    onChange={(e) => setFormFuncionario({...formFuncionario, nome: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Cargo *</label>
                  <input 
                    type="text" 
                    className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                    value={formFuncionario.cargo}
                    onChange={(e) => setFormFuncionario({...formFuncionario, cargo: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Departamento *</label>
                  <input 
                    type="text" 
                    className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                    value={formFuncionario.departamento}
                    onChange={(e) => setFormFuncionario({...formFuncionario, departamento: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Jornada</label>
                  <select
                    className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                    value={formFuncionario.jornadaId}
                    onChange={(e) => setFormFuncionario({...formFuncionario, jornadaId: e.target.value})}
                  >
                    <option value="">Sem jornada</option>
                    {jornadas.map(jornada => (
                      <option 
                        key={jornada.id} 
                        value={jornada.id}
                        disabled={!jornada.ativo}
                      >
                        {jornada.nome} {!jornada.ativo && '(Inativa)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button 
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
                >
                  {funcionarioSelecionado ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de Confirmação de Exclusão */}
      {modalExclusaoAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirmar Exclusão</h3>
            <p className="mb-6">
              Tem certeza que deseja excluir o funcionário <strong>{funcionarioParaExcluir?.nome}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setModalExclusaoAberto(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button 
                onClick={excluirFuncionario}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FuncionariosTab;