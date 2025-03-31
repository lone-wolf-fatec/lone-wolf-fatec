import React, { useState, useEffect } from 'react';

const NotificacoesTab = () => {
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
  
  // Estado para armazenar notificações do administrador
  const [adminNotifications, setAdminNotifications] = useState(() => {
    const storedNotifications = localStorage.getItem('adminNotifications');
    return storedNotifications ? JSON.parse(storedNotifications) : [
      { id: 1, message: 'João Silva não registrou ponto de saída (18:00)', date: '19/03/2025', read: false },
      { id: 2, message: 'Maria Oliveira solicitou ajuste de ponto', date: '18/03/2025', read: false },
      { id: 3, message: 'Carlos Pereira solicitou hora extra', date: '17/03/2025', read: true }
    ];
  });
  
  // Estado para armazenar todas as notificações dos funcionários
  const [userNotifications, setUserNotifications] = useState(() => {
    const storedNotifications = localStorage.getItem('userNotifications');
    return storedNotifications ? JSON.parse(storedNotifications) : [];
  });
  
  // Estados para modais e filtros
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeFilter, setActiveFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State para nova notificação
  const [newNotification, setNewNotification] = useState({
    message: '',
    recipients: 'todos' // 'todos', 'individual'
  });
  
  // Salvar notificações no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
  }, [adminNotifications]);
  
  useEffect(() => {
    localStorage.setItem('userNotifications', JSON.stringify(userNotifications));
  }, [userNotifications]);
  
  // Todas as notificações (admin + funcionários) para visualização
  const allNotifications = [
    ...adminNotifications.map(n => ({ 
      ...n, 
      type: 'admin', 
      recipientName: 'Administrador',
      recipientId: 0
    })),
    ...userNotifications.map(n => {
      const employee = employees.find(e => e.id === n.userId) || { name: 'Funcionário não encontrado' };
      return {
        ...n,
        type: 'user',
        recipientName: employee.name,
        recipientId: n.userId
      };
    })
  ];
  
  // Filtrar notificações com base no filtro ativo e termo de busca
  const filteredNotifications = allNotifications.filter(notification => {
    const matchesFilter = 
      (activeFilter === 'todas') ||
      (activeFilter === 'admin' && notification.type === 'admin') ||
      (activeFilter === 'user' && notification.type === 'user') ||
      (activeFilter === 'nao-lidas' && !notification.read) ||
      (activeFilter === 'lidas' && notification.read);
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm || 
      notification.message.toLowerCase().includes(searchLower) ||
      notification.recipientName.toLowerCase().includes(searchLower) ||
      notification.date.includes(searchTerm);
    
    return matchesFilter && matchesSearch;
  });
  
  // Função para marcar notificação como lida
  const markAsRead = (notification) => {
    if (notification.type === 'admin') {
      setAdminNotifications(adminNotifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      ));
    } else {
      setUserNotifications(userNotifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      ));
    }
  };
  
  // Função para marcar todas notificações como lidas
  const markAllAsRead = () => {
    setAdminNotifications(adminNotifications.map(n => ({ ...n, read: true })));
    setUserNotifications(userNotifications.map(n => ({ ...n, read: true })));
  };
  
  // Função para excluir notificação
  const deleteNotification = (notification) => {
    if (notification.type === 'admin') {
      setAdminNotifications(adminNotifications.filter(n => n.id !== notification.id));
    } else {
      setUserNotifications(userNotifications.filter(n => n.id !== notification.id));
    }
  };
  
  // Função para abrir modal de nova notificação
  const openNotificationModal = (employee = null) => {
    setSelectedEmployee(employee);
    setNewNotification({
      message: '',
      recipients: employee ? 'individual' : 'todos'
    });
    setShowNotificationModal(true);
  };
  
  // Função para enviar nova notificação
  const sendNotification = () => {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    
    if (newNotification.recipients === 'todos') {
      // Enviar para todos os funcionários
      const notificacoesFuncionarios = employees.map(employee => ({
        id: Date.now() + Math.random(),
        userId: employee.id,
        message: newNotification.message,
        date: formattedDate,
        read: false
      }));
      
      setUserNotifications([...notificacoesFuncionarios, ...userNotifications]);
      
      // Adicionar à lista de admin também
      const notificacaoAdmin = {
        id: adminNotifications.length + 1,
        message: `Notificação enviada para todos os funcionários: "${newNotification.message}"`,
        date: formattedDate,
        read: false
      };
      
      setAdminNotifications([notificacaoAdmin, ...adminNotifications]);
    } else if (selectedEmployee) {
      // Enviar para funcionário específico
      const novaNotificacaoFuncionario = {
        id: Date.now() + Math.random(),
        userId: selectedEmployee.id,
        message: newNotification.message,
        date: formattedDate,
        read: false
      };
      
      setUserNotifications([novaNotificacaoFuncionario, ...userNotifications]);
      
      // Adicionar à lista de admin também
      const notificacaoAdmin = {
        id: adminNotifications.length + 1,
        message: `Notificação enviada para ${selectedEmployee.name}: "${newNotification.message}"`,
        date: formattedDate,
        read: false
      };
      
      setAdminNotifications([notificacaoAdmin, ...adminNotifications]);
    }
    
    setShowNotificationModal(false);
  };
  
  // Manipuladores para os inputs do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotification(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Notificações</h1>
          <p className="text-purple-300">Gerencie todas as notificações do sistema</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar notificações..."
              className="w-full sm:w-64 px-3 py-2 pl-10 bg-purple-800 bg-opacity-40 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <button
            onClick={() => openNotificationModal()}
            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-md text-sm flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nova Notificação
          </button>
        </div>
      </div>
      
      {/* Filtros */}
      <div className="bg-purple-800 bg-opacity-40 rounded-lg p-1 flex flex-wrap gap-1">
        <button
          onClick={() => setActiveFilter('todas')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'todas' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Todas
        </button>
        <button
          onClick={() => setActiveFilter('admin')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'admin' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Admin
        </button>
        <button
          onClick={() => setActiveFilter('user')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'user' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Funcionários
        </button>
        <button
          onClick={() => setActiveFilter('nao-lidas')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'nao-lidas' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Não Lidas
        </button>
        <button
          onClick={() => setActiveFilter('lidas')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'lidas' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Lidas
        </button>
        <button
          onClick={() => setActiveFilter('funcionarios')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'funcionarios' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Enviar por Funcionário
        </button>
      </div>
      
      {/* Notificações */}
      {activeFilter !== 'funcionarios' && (
        <div className="bg-purple-800 bg-opacity-20 rounded-lg shadow-lg">
          <div className="p-4 border-b border-purple-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Lista de Notificações</h2>
            {filteredNotifications.length > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded-md text-sm"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>
          
          <div className="divide-y divide-purple-700">
            {filteredNotifications.length === 0 ? (
              <div className="p-4 text-center text-purple-300">
                Nenhuma notificação encontrada.
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div 
                  key={`${notification.type}-${notification.id}`} 
                  className={`p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 ${!notification.read ? 'bg-purple-800 bg-opacity-30' : ''}`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs ${notification.type === 'admin' ? 'bg-purple-600' : 'bg-blue-600'}`}>
                        {notification.type === 'admin' ? 'ADMIN' : 'FUNCIONÁRIO'}
                      </span>
                      <span className="text-sm text-purple-300">
                        {notification.type === 'admin' ? 'Para: Admin' : `Para: ${notification.recipientName}`}
                      </span>
                      {!notification.read && (
                        <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-white">{notification.message}</p>
                    <p className="text-sm text-purple-300 mt-1">{notification.date}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification)}
                        className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded-md text-xs"
                      >
                        Marcar como lida
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification)}
                      className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded-md text-xs"
                    >
                      Excluir
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      
      {/* Enviar por funcionário */}
      {activeFilter === 'funcionarios' && (
        <div className="bg-purple-800 bg-opacity-20 rounded-lg shadow-lg">
          <div className="p-4 border-b border-purple-700">
            <h2 className="text-xl font-semibold">Enviar Notificação por Funcionário</h2>
            <p className="text-purple-300 text-sm">Selecione um funcionário para enviar uma notificação específica</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {employees.map(employee => {
              // Contar notificações não lidas do funcionário
              const notificacoesFuncionario = userNotifications.filter(n => n.userId === employee.id);
              const naoLidas = notificacoesFuncionario.filter(n => !n.read).length;
              
              return (
                <div key={employee.id} className="bg-purple-800 bg-opacity-40 rounded-lg p-4">
                  <h3 className="font-bold text-lg">{employee.name}</h3>
                  <p className="text-purple-300">{employee.department}</p>
                  <p className="text-sm mb-2">{employee.email}</p>
                  
                  <div className="mb-4">
                    <p className="text-sm text-purple-300">Total de notificações: {notificacoesFuncionario.length}</p>
                    {naoLidas > 0 && (
                      <p className="text-sm text-red-300">Não lidas: {naoLidas}</p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => openNotificationModal(employee)}
                    className="bg-purple-600 hover:bg-purple-500 px-3 py-1 rounded text-sm w-full"
                  >
                    Enviar Notificação
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Modal para enviar notificação */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {newNotification.recipients === 'individual' 
                ? `Enviar Notificação para ${selectedEmployee.name}` 
                : 'Enviar Notificação para Todos'}
            </h3>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Mensagem</label>
              <textarea 
                name="message"
                value={newNotification.message}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-32"
                placeholder="Digite a mensagem da notificação..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowNotificationModal(false)}
                className="px-4 py-2 bg-purple-800 hover:bg-purple-700 rounded-md"
              >
                Cancelar
              </button>
              <button 
                onClick={sendNotification}
                disabled={!newNotification.message}
                className={`px-4 py-2 rounded-md ${newNotification.message ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-900 opacity-50 cursor-not-allowed'}`}
              >
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacoesTab;