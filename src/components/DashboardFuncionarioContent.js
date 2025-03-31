import React, { useState, useEffect } from 'react';
import FuncionariosService from './FuncionariosService';
import JornadasService from './JornadasService';
import FuncionariosUtils from './FuncionariosUtils';

const DashboardFuncionarioComponent = ({ setLastAction, setNotifications }) => {
  // Estados
  const [funcionarios, setFuncionarios] = useState([]);
  const [jornadas, setJornadas] = useState([]);
  const [funcionariosPorJornada, setFuncionariosPorJornada] = useState({});
  const [userDashboardFuncionarios, setUserDashboardFuncionarios] = useState([]);
  const [novoFuncionario, setNovoFuncionario] = useState({
    nome: '',
    cargo: '',
    departamento: ''
  });
  const [modalAberto, setModalAberto] = useState(false);
  const [filtroBusca, setFiltroBusca] = useState('');
  
  // Carregar dados ao iniciar
  useEffect(() => {
    carregarDados();
  }, []);
  
  // Função para carregar todos os dados
  const carregarDados = () => {
    // Carregar funcionários do sistema
    const funcionariosService = FuncionariosService.getTodosFuncionarios();
    
    // Carregar funcionários do UserDashboard
    const funcionariosUserDashboard = FuncionariosUtils.getFuncionariosFromUserDashboard();
    setUserDashboardFuncionarios(funcionariosUserDashboard);
    
    // Combinar listas de funcionários
    const todosFuncionarios = FuncionariosUtils.combinarFuncionarios(
      funcionariosService,
      funcionariosUserDashboard
    );
    setFuncionarios(todosFuncionarios);
    
    // Carregar jornadas
    const jornadasService = JornadasService.getTodasJornadas();
    setJornadas(jornadasService);
    
    // Carregar atribuições de funcionários por jornada
    const funcionariosPorJornadaService = FuncionariosService.getFuncionariosPorJornada();
    setFuncionariosPorJornada(funcionariosPorJornadaService);
  };
  
  // Adicionar novo funcionário
  const adicionarFuncionario = (e) => {
    e.preventDefault();
    
    if (!novoFuncionario.nome) {
      alert('Por favor, informe pelo menos o nome do funcionário');
      return;
    }
    
    // Formatar nome do funcionário
    const nomeFormatado = FuncionariosUtils.formatarNomeFuncionario(novoFuncionario.nome);
    
    // Verificar se já existe funcionário com esse nome
    const funcionarioExistente = funcionarios.find(f => 
      f.nome.toLowerCase() === nomeFormatado.toLowerCase()
    );
    
    if (funcionarioExistente) {
      alert(`Já existe um funcionário com o nome ${nomeFormatado}`);
      return;
    }
    
    // Criar novo funcionário
    const novoFuncionarioObj = {
      id: Date.now(),
      nome: nomeFormatado,
      cargo: novoFuncionario.cargo || 'Funcionário',
      departamento: novoFuncionario.departamento || 'Empresa'
    };
    
    // Adicionar ao UserDashboard
    FuncionariosUtils.saveUserDashboardFuncionario(novoFuncionarioObj);
    
    // Atualizar lista de funcionários
    setFuncionarios([...funcionarios, novoFuncionarioObj]);
    
    // Limpar formulário e fechar modal
    setNovoFuncionario({
      nome: '',
      cargo: '',
      departamento: ''
    });
    setModalAberto(false);
    
    // Notificar sucesso
    setLastAction?.(`Funcionário ${nomeFormatado} adicionado com sucesso`);
    
    // Adicionar notificação
    if (setNotifications) {
      const newNotification = {
        id: Date.now(),
        text: `Funcionário ${nomeFormatado} foi cadastrado com sucesso`,
        read: false,
        date: new Date().toLocaleDateString('pt-BR')
      };
      setNotifications(prev => [newNotification, ...prev]);
    }
  };
  
  // Obter jornada de um funcionário
  const getJornadaFuncionario = (funcionario) => {
    return FuncionariosUtils.getJornadaFuncionario(
      funcionario.nome,
      funcionariosPorJornada,
      jornadas
    );
  };
  
  // Filtrar funcionários com base na busca
  const funcionariosFiltrados = funcionarios.filter(f =>
    f.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
    (f.cargo && f.cargo.toLowerCase().includes(filtroBusca.toLowerCase())) ||
    (f.departamento && f.departamento.toLowerCase().includes(filtroBusca.toLowerCase()))
  );
  
  return (
    <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Gerenciar Funcionários
        </h2>
        <button 
          onClick={() => setModalAberto(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Novo Funcionário
        </button>
      </div>
      
      {/* Filtro de busca */}
      <div className="mb-4">
        <input 
          type="text" 
          className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
          placeholder="Buscar por nome, cargo ou departamento..."
          value={filtroBusca}
          onChange={(e) => setFiltroBusca(e.target.value)}
        />
      </div>
      
      {/* Lista de funcionários */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-purple-300 text-sm">
              <th className="text-left p-2">Nome</th>
              <th className="text-left p-2">Cargo</th>
              <th className="text-left p-2">Departamento</th>
              <th className="text-left p-2">Jornada</th>
              <th className="text-left p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {funcionariosFiltrados.length > 0 ? (
              funcionariosFiltrados.map((funcionario) => {
                const jornada = getJornadaFuncionario(funcionario);
                
                return (
                  <tr key={funcionario.id} className="border-t border-purple-700">
                    <td className="p-2">{funcionario.nome}</td>
                    <td className="p-2">{funcionario.cargo || '-'}</td>
                    <td className="p-2">{funcionario.departamento || '-'}</td>
                    <td className="p-2">
                      {jornada ? (
                        <span className={`px-2 py-1 rounded-full text-xs ${jornada.ativo ? 'bg-green-600' : 'bg-gray-600'}`}>
                          {jornada.nome}
                        </span>
                      ) : (
                        <span className="text-purple-400 text-xs">Não atribuído</span>
                      )}
                    </td>
                    <td className="p-2">
                      {jornada ? (
                        <span className={`px-2 py-1 rounded-full text-xs ${jornada.ativo ? 'bg-green-600' : 'bg-gray-600'}`}>
                          {jornada.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-600">
                          Pendente
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
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
      
      {/* Modal para adicionar funcionário */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Novo Funcionário</h3>
              <button 
                onClick={() => setModalAberto(false)}
                className="text-purple-300 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={adicionarFuncionario}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Nome *</label>
                  <input 
                    type="text" 
                    className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                    value={novoFuncionario.nome}
                    onChange={(e) => setNovoFuncionario({...novoFuncionario, nome: e.target.value})}
                    required
                    placeholder="Nome do funcionário"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Cargo</label>
                  <input 
                    type="text" 
                    className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                    value={novoFuncionario.cargo}
                    onChange={(e) => setNovoFuncionario({...novoFuncionario, cargo: e.target.value})}
                    placeholder="Cargo do funcionário"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Departamento</label>
                  <input 
                    type="text" 
                    className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                    value={novoFuncionario.departamento}
                    onChange={(e) => setNovoFuncionario({...novoFuncionario, departamento: e.target.value})}
                    placeholder="Departamento do funcionário"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-600 rounded-md"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md"
                >
                  Adicionar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardFuncionarioComponent;