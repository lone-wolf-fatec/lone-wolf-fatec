import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AusenciasTab = () => {
  const navigate = useNavigate();
  
  // Estado para armazenar funcionários
  const [employees, setEmployees] = useState(() => {
    const storedEmployees = localStorage.getItem('employees');
    return storedEmployees ? JSON.parse(storedEmployees) : [
      { id: 1, name: 'João Silva', email: 'joao.silva@empresa.com', department: 'TI' },
      { id: 2, name: 'Maria Oliveira', email: 'maria.oliveira@empresa.com', department: 'RH' },
      { id: 3, name: 'Carlos Pereira', email: 'carlos.pereira@empresa.com', department: 'Financeiro' },
      { id: 4, name: 'Ana Santos', email: 'ana.santos@empresa.com', department: 'Marketing' },
      { id: 5, name: 'Bruno Almeida', email: 'bruno.almeida@empresa.com', department: 'Operações' }
    ];
  });
  
  // Estado para armazenar ausências
  const [ausencias, setAusencias] = useState(() => {
    const storedAusencias = localStorage.getItem('ausencias');
    return storedAusencias ? JSON.parse(storedAusencias) : [
      { 
        id: 1, 
        employeeId: 2, 
        employeeName: 'Maria Oliveira', 
        tipo: 'atestado', 
        dataInicio: '10/03/2025',
        dataFim: '12/03/2025',
        motivo: 'Atestado médico - consulta',
        anexo: 'atestado_maria.pdf',
        status: 'aprovado',
        notified: true,
        dataConfirmacao: '09/03/2025',
        confirmacaoMotivo: 'Aprovado conforme política de atestados médicos'
      },
      { 
        id: 2, 
        employeeId: 1, 
        employeeName: 'João Silva', 
        tipo: 'falta', 
        dataInicio: '15/03/2025',
        dataFim: '15/03/2025',
        motivo: 'Problema familiar',
        anexo: null,
        status: 'pendente',
        notified: false
      },
      { 
        id: 3, 
        employeeId: 5, 
        employeeName: 'Bruno Almeida', 
        tipo: 'atestado', 
        dataInicio: '18/03/2025',
        dataFim: '20/03/2025',
        motivo: 'Atestado médico - tratamento',
        anexo: 'atestado_bruno.pdf',
        status: 'pendente',
        notified: false
      },
      { 
        id: 4, 
        employeeId: 3, 
        employeeName: 'Carlos Pereira', 
        tipo: 'licença', 
        dataInicio: '05/04/2025',
        dataFim: '15/04/2025',
        motivo: 'Licença paternidade',
        anexo: 'declaracao_paternidade.pdf',
        status: 'aprovado',
        notified: true,
        dataConfirmacao: '01/04/2025',
        confirmacaoMotivo: 'Aprovado conforme lei de licença paternidade'
      },
      { 
        id: 5, 
        employeeId: 4, 
        employeeName: 'Ana Santos', 
        tipo: 'falta', 
        dataInicio: '08/03/2025',
        dataFim: '08/03/2025',
        motivo: 'Transporte público em greve',
        anexo: null,
        status: 'rejeitado',
        notified: true,
        dataConfirmacao: '09/03/2025',
        confirmacaoMotivo: 'Solicitação negada, houve opções alternativas de transporte'
      }
    ];
  });
  
  // Estados para modais e filtros
  const [showAusenciaModal, setShowAusenciaModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedAusencia, setSelectedAusencia] = useState(null);
  const [activeFilter, setActiveFilter] = useState('pendentes');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmacaoMotivo, setConfirmacaoMotivo] = useState('');
  
  // State para nova ausência
  const [newAusencia, setNewAusencia] = useState({
    tipo: 'atestado',
    dataInicio: '',
    dataFim: '',
    motivo: '',
    anexo: null,
    status: 'pendente'
  });

  // Função para navegar para a página do colaborador
  const handleViewEmployee = (employeeId) => {
    navigate(`/admin/colaborador/${employeeId}`);
  };
  
  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('ausencias', JSON.stringify(ausencias));
    
    // Atualizar notificações dos funcionários quando status de ausências forem atualizados
    const pendingNotifications = ausencias
      .filter(ausencia => ausencia.status !== 'pendente' && !ausencia.notified)
      .map(ausencia => {
        const status = ausencia.status === 'aprovado' ? 'aprovada' : 'rejeitada';
        return {
          id: Date.now() + Math.random(),
          userId: ausencia.employeeId,
          message: `Sua ausência do tipo ${ausencia.tipo} de ${ausencia.dataInicio} a ${ausencia.dataFim} foi ${status}. Justificativa: ${ausencia.confirmacaoMotivo || 'Não fornecida'}`,
          date: new Date().toLocaleDateString('pt-BR'),
          read: false
        };
      });
    
    if (pendingNotifications.length > 0) {
      const currentNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
      localStorage.setItem('userNotifications', JSON.stringify([
        ...pendingNotifications,
        ...currentNotifications
      ]));
      
      // Marcar como notificado
      setAusencias(ausencias.map(ausencia => 
        !ausencia.notified && ausencia.status !== 'pendente' ? { ...ausencia, notified: true } : ausencia
      ));
    }
  }, [ausencias]);
  
  // Monitorar mudanças nas ausências vindas de outros componentes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedAusencias = JSON.parse(localStorage.getItem('ausencias') || '[]');
      setAusencias(storedAusencias);
    };
    
    // Verificar a cada 5 segundos se houve mudanças no localStorage
    const interval = setInterval(() => {
      handleStorageChange();
    }, 5000);
    
    // Adicionar event listener para notificações de outros componentes
    window.addEventListener('storage', handleStorageChange);
    
    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Filtrar ausências com base no filtro ativo e termo de busca
  const filteredAusencias = ausencias.filter(ausencia => {
    const matchesFilter = 
      (activeFilter === 'pendentes' && ausencia.status === 'pendente') ||
      (activeFilter === 'aprovadas' && ausencia.status === 'aprovado') ||
      (activeFilter === 'rejeitadas' && ausencia.status === 'rejeitado') ||
      (activeFilter === 'atestados' && ausencia.tipo === 'atestado') ||
      (activeFilter === 'faltas' && ausencia.tipo === 'falta') ||
      (activeFilter === 'licencas' && ausencia.tipo === 'licença') ||
      (activeFilter === 'ferias' && ausencia.tipo === 'férias') ||
      (activeFilter === 'todas');
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm || 
      (ausencia.employeeName && ausencia.employeeName.toLowerCase().includes(searchLower)) ||
      (ausencia.motivo && ausencia.motivo.toLowerCase().includes(searchLower)) ||
      (ausencia.dataInicio && ausencia.dataInicio.includes(searchTerm)) ||
      (ausencia.dataFim && ausencia.dataFim.includes(searchTerm));
    
    return matchesFilter && matchesSearch;
  });
  
  // Filtrar funcionários com base no termo de busca
  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    return !searchTerm || 
      (employee.name && employee.name.toLowerCase().includes(searchLower)) ||
      (employee.department && employee.department.toLowerCase().includes(searchLower));
  });
  
  // Função para abrir modal de aprovação
  const openApprovalModal = (ausencia) => {
    setSelectedAusencia(ausencia);
    setConfirmacaoMotivo('');
    setShowApprovalModal(true);
  };
  
  // Função para aprovar ou rejeitar ausência
  const handleAusenciaStatus = (status) => {
    const dataConfirmacao = new Date().toLocaleDateString('pt-BR');
    
    setAusencias(ausencias.map(ausencia => 
      ausencia.id === selectedAusencia.id ? { 
        ...ausencia, 
        status, 
        notified: false,
        dataConfirmacao,
        confirmacaoMotivo: confirmacaoMotivo || (status === 'aprovado' ? 'Aprovado pela gestão' : 'Rejeitado pela gestão')
      } : ausencia
    ));
    setShowApprovalModal(false);
  };
  
  // Função para abrir modal de nova ausência para um funcionário
  const openAusenciaModal = (employee) => {
    setSelectedEmployee(employee);
    setNewAusencia({
      tipo: 'atestado',
      dataInicio: '',
      dataFim: '',
      motivo: '',
      anexo: null,
      status: 'pendente'
    });
    setShowAusenciaModal(true);
  };
  
  // Função para criar uma nova ausência
  const createAusencia = () => {
    // Validar datas
    if (!newAusencia.dataInicio || !newAusencia.dataFim || !newAusencia.motivo) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    const novaAusencia = {
      id: Date.now(),
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      tipo: newAusencia.tipo,
      dataInicio: newAusencia.dataInicio,
      dataFim: newAusencia.dataFim,
      motivo: newAusencia.motivo,
      anexo: newAusencia.anexo,
      status: 'pendente',
      notified: false,
      dataCriacao: new Date().toLocaleDateString('pt-BR')
    };
    
    setAusencias([novaAusencia, ...ausencias]);
    setShowAusenciaModal(false);
  };
  
  // Manipuladores para os inputs do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAusencia(prev => ({ ...prev, [name]: value }));
  };
  
  // Função para formatar data do Javascript para DD/MM/YYYY
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
  };
  
  // Função para obter o nome da classe CSS para o status
  const getStatusClass = (status) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-600';
      case 'pendente':
        return 'bg-yellow-600';
      case 'rejeitado':
        return 'bg-red-600';
      case 'cancelado':
        return 'bg-gray-600';
      default:
        return 'bg-purple-600';
    }
  };

  // Função para obter o nome da classe CSS para o tipo
  const getTipoClass = (tipo) => {
    switch (tipo) {
      case 'atestado':
        return 'bg-blue-600';
      case 'falta':
        return 'bg-orange-600';
      case 'férias':
        return 'bg-green-600';
      case 'licença':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Ausências</h1>
          <p className="text-purple-300">Gerencie as ausências, atestados e licenças dos funcionários</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, motivo..."
              className="w-full sm:w-64 px-3 py-2 pl-10 bg-purple-800 bg-opacity-40 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-purple-800 bg-opacity-40 rounded-lg p-1 flex flex-wrap gap-1">
        <button
          onClick={() => setActiveFilter('pendentes')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'pendentes' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Pendentes
        </button>
        <button
          onClick={() => setActiveFilter('aprovadas')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'aprovadas' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Aprovadas
        </button>
        <button
          onClick={() => setActiveFilter('rejeitadas')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'rejeitadas' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Rejeitadas
        </button>
        <button
          onClick={() => setActiveFilter('atestados')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'atestados' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Atestados
        </button>
        <button
          onClick={() => setActiveFilter('faltas')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'faltas' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Faltas
        </button>
        <button
          onClick={() => setActiveFilter('licencas')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'licencas' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Licenças
        </button>
        <button
          onClick={() => setActiveFilter('ferias')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'ferias' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Férias
        </button>
        <button
          onClick={() => setActiveFilter('todas')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'todas' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Todas
        </button>
        <button
          onClick={() => setActiveFilter('funcionarios')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'funcionarios' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Funcionários
        </button>
      </div>
      
      {/* Conteúdo baseado na tab ativa */}
      {activeFilter !== 'funcionarios' && (
        <div className="bg-purple-800 bg-opacity-20 rounded-lg shadow-lg">
          <div className="p-4 border-b border-purple-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Ausências Registradas</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-purple-300 text-sm">
                  <th className="text-left p-4">Funcionário</th>
                  <th className="text-left p-4">Tipo</th>
                  <th className="text-left p-4">Período</th>
                  <th className="text-left p-4">Motivo</th>
                  <th className="text-left p-4">Documento</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredAusencias.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4 text-center">Nenhuma ausência encontrada.</td>
                  </tr>
                ) : (
                  filteredAusencias.map(ausencia => (
                    <tr key={ausencia.id} className="border-t border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                      <td className="p-4">
                        <span 
                          className="hover:underline cursor-pointer"
                          onClick={() => handleViewEmployee(ausencia.employeeId)}
                        >
                          {ausencia.employeeName}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getTipoClass(ausencia.tipo)}`}>
                          {ausencia.tipo.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        {ausencia.dataInicio === ausencia.dataFim 
                          ? ausencia.dataInicio 
                          : `${ausencia.dataInicio} - ${ausencia.dataFim}`}
                      </td>
                      <td className="p-4">{ausencia.motivo}</td>
                      <td className="p-4">
                        {ausencia.anexo ? (
                          <span className="text-blue-400 cursor-pointer hover:underline">
                            {ausencia.anexo}
                          </span>
                        ) : (
                          <span className="text-gray-500">Não anexado</span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusClass(ausencia.status)}`}>
                          {ausencia.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">
                        {ausencia.status === 'pendente' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openApprovalModal(ausencia)}
                              className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded-md text-sm"
                            >
                              Revisar
                            </button>
                          </div>
                        )}
                        {ausencia.status !== 'pendente' && (
                          <div className="text-xs text-purple-300">
                            {ausencia.dataConfirmacao ? `Confirmado em: ${ausencia.dataConfirmacao}` : ''}
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
      )}
      
      {activeFilter === 'funcionarios' && (
        <div className="bg-purple-800 bg-opacity-20 rounded-lg shadow-lg">
          <div className="p-4 border-b border-purple-700">
            <h2 className="text-xl font-semibold">Lista de Funcionários</h2>
            <p className="text-purple-300 text-sm">Registre ausências por funcionário</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredEmployees.map(employee => {
              // Contar ausências do funcionário
              const ausenciasFuncionario = ausencias.filter(a => a.employeeId === employee.id);
              const ausenciasPendentes = ausenciasFuncionario.filter(a => a.status === 'pendente').length;
              
              return (
                <div key={employee.id} className="bg-purple-800 bg-opacity-40 rounded-lg p-4">
                  <h3 
                    className="font-bold text-lg hover:underline cursor-pointer"
                    onClick={() => handleViewEmployee(employee.id)}
                  >
                    {employee.name}
                  </h3>
                  <p className="text-purple-300">{employee.department}</p>
                  <p className="text-sm mb-4">{employee.email}</p>
                  
                  <div className="mb-4">
                    <p className="text-sm text-purple-300">Total de Ausências: {ausenciasFuncionario.length}</p>
                    {ausenciasPendentes > 0 && (
                      <p className="text-sm text-yellow-300">Pendentes: {ausenciasPendentes}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => openAusenciaModal(employee)}
                    className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded text-sm w-full"
                  >
                    Registrar Ausência
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Modal para aprovação/rejeição */}
      {showApprovalModal && selectedAusencia && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Revisar Ausência</h3>
            
            <div className="mb-4">
              <p><span className="text-purple-300">Funcionário:</span> {selectedAusencia.employeeName}</p>
              <p><span className="text-purple-300">Tipo:</span> {selectedAusencia.tipo.toUpperCase()}</p>
              <p><span className="text-purple-300">Período:</span> {selectedAusencia.dataInicio} a {selectedAusencia.dataFim}</p>
              <p><span className="text-purple-300">Motivo:</span> {selectedAusencia.motivo}</p>
              {selectedAusencia.anexo && (
                <p><span className="text-purple-300">Documento:</span> {selectedAusencia.anexo}</p>
              )}
            </div>
            
            {/* Justificativa para aprovação/rejeição */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Justificativa da Confirmação</label>
              <textarea 
                value={confirmacaoMotivo}
                onChange={(e) => setConfirmacaoMotivo(e.target.value)}
                className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-20"
                placeholder="Informe a justificativa para a aprovação ou rejeição..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowApprovalModal(false)}
                className="px-4 py-2 bg-purple-800 hover:bg-purple-700 rounded-md"
              >
                Cancelar
              </button>
              <button 
                onClick={() => handleAusenciaStatus('rejeitado')}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-md"
              >
                Rejeitar
              </button>
              <button 
                onClick={() => handleAusenciaStatus('aprovado')}
                className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-md"
              >
                Aprovar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal para nova ausência */}
      {showAusenciaModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Registrar Ausência para {selectedEmployee.name}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Tipo de Ausência</label>
              <select
                name="tipo"
                value={newAusencia.tipo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="atestado">Atestado Médico</option>
                <option value="falta">Falta Justificada</option>
                <option value="férias">Férias</option>
                <option value="licença">Licença</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Data de Início</label>
              <input 
                type="date" 
                name="dataInicio"
                value={newAusencia.dataInicio}
                onChange={(e) => setNewAusencia(prev => ({ 
                  ...prev, 
                  dataInicio: formatDate(e.target.value),
                  // Se a data de fim não estiver definida, define igual à data de início
                  dataFim: prev.dataFim ? prev.dataFim : formatDate(e.target.value)
                }))}
                className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Data de Fim</label>
              <input 
                type="date" 
                name="dataFim"
                value={newAusencia.dataFim}
                onChange={(e) => setNewAusencia(prev => ({ ...prev, dataFim: formatDate(e.target.value) }))}
                className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Motivo</label>
              <textarea 
                name="motivo"
                value={newAusencia.motivo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-20"
                placeholder="Descreva o motivo da ausência..."
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Documento (opcional)</label>
              <input 
                type="text" 
                name="anexo"
                value={newAusencia.anexo || ''}
                onChange={handleInputChange}
                placeholder="Nome do arquivo anexado"
                className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-xs text-purple-300 mt-1">Informe o nome do documento para referência</p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowAusenciaModal(false)}
                className="px-4 py-2 bg-purple-800 hover:bg-purple-700 rounded-md"
              >
                Cancelar
              </button>
              <button 
                onClick={createAusencia}
                disabled={!newAusencia.dataInicio || !newAusencia.dataFim || !newAusencia.motivo}
                className={`px-4 py-2 rounded-md ${(newAusencia.dataInicio && newAusencia.dataFim && newAusencia.motivo) ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-900 opacity-50 cursor-not-allowed'}`}
              >
                Registrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AusenciasTab;