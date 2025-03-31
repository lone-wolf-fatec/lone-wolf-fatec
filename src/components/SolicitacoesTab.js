import React, { useState, useEffect } from 'react';

const SolicitacoesTab = () => {
  // Estado para armazenar solicitações
  const [solicitacoes, setSolicitacoes] = useState(() => {
    const stored = localStorage.getItem('solicitacoes');
    return stored ? JSON.parse(stored) : [];
  });
  
  // Estado para nova solicitação
  const [novaSolicitacao, setNovaSolicitacao] = useState({
    id: '',
    funcionarioId: '',
    funcionarioNome: '',
    tipo: 'ferias',
    dataInicio: '',
    dataFim: '',
    motivo: '',
    status: 'pendente',
    createdAt: '',
    updatedAt: ''
  });
  
  // Estado para modal
  const [showModal, setShowModal] = useState(false);
  
  // Estado para funcionários
  const [employees, setEmployees] = useState(() => {
    // Obtém funcionários cadastrados manualmente
    const storedFuncionarios = localStorage.getItem('funcionarios');
    const existingFuncionarios = storedFuncionarios ? JSON.parse(storedFuncionarios) : [];
    
    // Obtém usuários registrados no sistema
    const registeredUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    // Evita duplicatas verificando por e-mail
    const existingEmails = existingFuncionarios.map(func => func.email);
    
    // Converte usuários para o formato de funcionários
    const userEmployees = registeredUsers
      .filter(user => !existingEmails.includes(user.email))
      .map((user, index) => ({
        id: `user_${user.id || index}`, // Garante ID único
        nome: user.name || user.displayName || user.email.split('@')[0],
        email: user.email,
        departamento: user.department || 'Não especificado'
      }));
    
    // Combina as duas listas
    return [...existingFuncionarios, ...userEmployees];
  });
  
  // Estado para filtros
  const [filtros, setFiltros] = useState({
    status: '',
    funcionario: '',
    tipo: '',
    periodo: ''
  });
  
  // Efeito para salvar solicitações no localStorage
  useEffect(() => {
    localStorage.setItem('solicitacoes', JSON.stringify(solicitacoes));
  }, [solicitacoes]);
  
  // Efeito para monitorar novos usuários registrados
  useEffect(() => {
    // Função para atualizar lista de funcionários
    const updateEmployees = () => {
      // Obtém funcionários cadastrados manualmente
      const storedFuncionarios = localStorage.getItem('funcionarios');
      const existingFuncionarios = storedFuncionarios ? JSON.parse(storedFuncionarios) : [];
      
      // Obtém usuários registrados no sistema
      const registeredUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Evita duplicatas verificando por e-mail
      const existingEmails = existingFuncionarios.map(func => func.email);
      
      // Converte usuários para o formato de funcionários
      const userEmployees = registeredUsers
        .filter(user => !existingEmails.includes(user.email))
        .map((user, index) => ({
          id: `user_${user.id || index}`, // Garante ID único
          nome: user.name || user.displayName || user.email.split('@')[0],
          email: user.email,
          departamento: user.department || 'Não especificado'
        }));
      
      // Combina as duas listas
      setEmployees([...existingFuncionarios, ...userEmployees]);
    };
    
    // Configura event listeners para atualizar quando novos usuários são registrados
    window.addEventListener('userRegistered', updateEmployees);
    window.addEventListener('storage', (e) => {
      if (e.key === 'users' || e.key === 'funcionarios') {
        updateEmployees();
      }
    });
    
    // Limpa event listeners quando o componente é desmontado
    return () => {
      window.removeEventListener('userRegistered', updateEmployees);
      window.removeEventListener('storage', updateEmployees);
    };
  }, []);
  
  // Função para abrir modal de nova solicitação
  const openModal = () => {
    setNovaSolicitacao({
      id: '',
      funcionarioId: '',
      funcionarioNome: '',
      tipo: 'ferias',
      dataInicio: '',
      dataFim: '',
      motivo: '',
      status: 'pendente',
      createdAt: '',
      updatedAt: ''
    });
    setShowModal(true);
  };
  
  // Função para fechar modal
  const closeModal = () => {
    setShowModal(false);
  };
  
  // Função para lidar com alterações nos inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNovaSolicitacao({
      ...novaSolicitacao,
      [name]: value
    });
  };
  
  // Função para lidar com a seleção de funcionário
  const handleSelecionarFuncionario = (e) => {
    const funcionarioId = e.target.value;
    
    if (!funcionarioId) {
      setNovaSolicitacao({
        ...novaSolicitacao,
        funcionarioId: '',
        funcionarioNome: ''
      });
      return;
    }
    
    // Encontra o funcionário selecionado
    const selectedEmployee = employees.find(emp => emp.id.toString() === funcionarioId.toString());
    
    if (selectedEmployee) {
      setNovaSolicitacao({
        ...novaSolicitacao,
        funcionarioId: funcionarioId,
        funcionarioNome: selectedEmployee.nome
      });
    }
  };
  
  // Função para criar nova solicitação
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const now = new Date().toISOString();
    const novaId = solicitacoes.length > 0 ? Math.max(...solicitacoes.map(s => parseInt(s.id))) + 1 : 1;
    
    const solicitacaoCompleta = {
      ...novaSolicitacao,
      id: novaId.toString(),
      createdAt: now,
      updatedAt: now
    };
    
    setSolicitacoes([solicitacaoCompleta, ...solicitacoes]);
    closeModal();
    
    // Adicionar notificação para o usuário
    const notificacao = {
      id: Date.now(),
      userId: parseInt(novaSolicitacao.funcionarioId),
      message: `Sua solicitação de ${novaSolicitacao.tipo} foi registrada com sucesso e está em análise.`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    };
    
    const currentNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    localStorage.setItem('userNotifications', JSON.stringify([
      notificacao,
      ...currentNotifications
    ]));
  };
  
  // Função para aprovar/rejeitar solicitação
  const handleUpdateStatus = (id, newStatus) => {
    const updatedSolicitacoes = solicitacoes.map(solicitacao => {
      if (solicitacao.id === id) {
        // Criar notificação para o funcionário
        const statusText = newStatus === 'aprovada' ? 'aprovada' : 'rejeitada';
        const notificacao = {
          id: Date.now(),
          userId: parseInt(solicitacao.funcionarioId),
          message: `Sua solicitação de ${solicitacao.tipo} foi ${statusText}.`,
          date: new Date().toLocaleDateString('pt-BR'),
          read: false
        };
        
        const currentNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
        localStorage.setItem('userNotifications', JSON.stringify([
          notificacao,
          ...currentNotifications
        ]));
        
        return {
          ...solicitacao,
          status: newStatus,
          updatedAt: new Date().toISOString()
        };
      }
      return solicitacao;
    });
    
    setSolicitacoes(updatedSolicitacoes);
  };
  
  // Filtrar solicitações
  const filteredSolicitacoes = solicitacoes.filter(solicitacao => {
    // Filtro por status
    if (filtros.status && solicitacao.status !== filtros.status) {
      return false;
    }
    
    // Filtro por funcionário
    if (filtros.funcionario && solicitacao.funcionarioNome !== filtros.funcionario) {
      return false;
    }
    
    // Filtro por tipo
    if (filtros.tipo && solicitacao.tipo !== filtros.tipo) {
      return false;
    }
    
    // Filtro por período (implementar conforme necessário)
    
    return true;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Solicitações</h1>
          <p className="text-purple-300">Gerencie as solicitações de férias e ausências</p>
        </div>
        
        <button 
          onClick={openModal}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nova Solicitação
        </button>
      </div>
      
      {/* Filtros */}
      <div className="bg-purple-800 bg-opacity-40 rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm text-purple-300 mb-1">Status</label>
          <select
            className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
            value={filtros.status}
            onChange={(e) => setFiltros({...filtros, status: e.target.value})}
          >
            <option value="">Todos</option>
            <option value="pendente">Pendente</option>
            <option value="aprovada">Aprovada</option>
            <option value="rejeitada">Rejeitada</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-purple-300 mb-1">Funcionário</label>
          <select
            className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
            value={filtros.funcionario}
            onChange={(e) => setFiltros({...filtros, funcionario: e.target.value})}
          >
            <option value="">Todos os funcionários</option>
            {[...new Set(solicitacoes.map(s => s.funcionarioNome))].map((nome, index) => (
              <option key={index} value={nome}>{nome}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-purple-300 mb-1">Tipo</label>
          <select
            className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
            value={filtros.tipo}
            onChange={(e) => setFiltros({...filtros, tipo: e.target.value})}
          >
            <option value="">Todos os tipos</option>
            <option value="ferias">Férias</option>
            <option value="ausencia">Ausência</option>
            <option value="medica">Licença Médica</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-purple-300 mb-1">Período</label>
          <select
            className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
            value={filtros.periodo}
            onChange={(e) => setFiltros({...filtros, periodo: e.target.value})}
          >
            <option value="">Qualquer período</option>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
        </div>
      </div>
      
      {/* Lista de solicitações */}
      <div className="bg-purple-800 bg-opacity-20 rounded-lg shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-purple-300 text-sm">
                <th className="text-left p-4">Funcionário</th>
                <th className="text-left p-4">Tipo</th>
                <th className="text-left p-4">Data de Início</th>
                <th className="text-left p-4">Data de Fim</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSolicitacoes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center">Nenhuma solicitação encontrada.</td>
                </tr>
              ) : (
                filteredSolicitacoes.map(solicitacao => (
                  <tr key={solicitacao.id} className="border-t border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                    <td className="p-4">{solicitacao.funcionarioNome}</td>
                    <td className="p-4">
                      <span className="capitalize">{solicitacao.tipo}</span>
                    </td>
                    <td className="p-4">{new Date(solicitacao.dataInicio).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4">{new Date(solicitacao.dataFim).toLocaleDateString('pt-BR')}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        solicitacao.status === 'aprovada' ? 'bg-green-600' : 
                        solicitacao.status === 'rejeitada' ? 'bg-red-600' : 'bg-yellow-600'
                      }`}>
                        {solicitacao.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      {solicitacao.status === 'pendente' && (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(solicitacao.id, 'aprovada')}
                            className="bg-green-600 hover:bg-green-500 px-2 py-1 rounded text-xs"
                          >
                            Aprovar
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(solicitacao.id, 'rejeitada')}
                            className="bg-red-600 hover:bg-red-500 px-2 py-1 rounded text-xs"
                          >
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal para nova solicitação */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Nova Solicitação</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Funcionário</label>
                <select 
                  className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                  value={novaSolicitacao.funcionarioId}
                  onChange={handleSelecionarFuncionario}
                  required
                >
                  <option value="">Selecione</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>
                      {employee.nome}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Solicitação</label>
                <select
                  name="tipo"
                  value={novaSolicitacao.tipo}
                  onChange={handleInputChange}
                  className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                  required
                >
                  <option value="ferias">Férias</option>
                  <option value="ausencia">Ausência</option>
                  <option value="medica">Licença Médica</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data de Início</label>
                  <input 
                    type="date" 
                    name="dataInicio"
                    value={novaSolicitacao.dataInicio}
                    onChange={handleInputChange}
                    className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Data de Fim</label>
                  <input 
                    type="date" 
                    name="dataFim"
                    value={novaSolicitacao.dataFim}
                    onChange={handleInputChange}
                    className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Motivo/Observações</label>
                <textarea 
                  name="motivo"
                  value={novaSolicitacao.motivo}
                  onChange={handleInputChange}
                  className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white min-h-20"
                  placeholder="Descreva o motivo da solicitação..."
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-purple-800 hover:bg-purple-700 rounded-md"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md"
                >
                  Criar Solicitação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SolicitacoesTab;