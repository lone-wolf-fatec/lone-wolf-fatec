import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PontoBatidoTab from '../components/PontoBatidoTab';
import AjustesPontoTab from '../components/AjustesPontoTab';
import JornadasTab from '../components/JornadasTab';
import RelatoriosTab from '../components/RelatoriosTab';
import NotificacoesTab from '../components/NotificacoesTab';
import BancoHorasTab from '../components/BancoHorasTab';
import AusenciasTab from '../components/AusenciasTab';
import ContestacaoAdmin from '../components/ContestacaoAdmin';

const AdminDashboard = () => {
  const navigate = useNavigate();
  
  // Obter dados do usuário logado do localStorage
  const [userData, setUserData] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      name: storedUser.name || 'Administrador',
      initials: storedUser.name ? storedUser.name.charAt(0) : 'A',
      isAdmin: true
    };
  });
  
  // Estado para as tabs
  const [activeTab, setActiveTab] = useState('pontoBatido');
  
  // Estado para notificações
  const [notifications, setNotifications] = useState(() => {
    const storedNotifications = localStorage.getItem('adminNotifications');
    return storedNotifications ? JSON.parse(storedNotifications) : [
      { id: 1, message: 'João Silva não registrou ponto de saída (18:00)', date: '19/03/2025', read: false },
      { id: 2, message: 'Maria Oliveira solicitou ajuste de ponto', date: '18/03/2025', read: false },
      { id: 3, message: 'Carlos Pereira solicitou hora extra', date: '17/03/2025', read: true }
    ];
  });
  
  // Estado para mostrar/esconder o menu do perfil
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Estado para mostrar/esconder menu de notificações
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  
  // Estado para contagem de contestações pendentes
  const [contestacoesPendentes, setContestacoesPendentes] = useState(0);
  
  // Funções para manipular notificações
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;
  
  const markAllNotificationsAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
  };
  
  const markNotificationAsRead = (id) => {
    const updatedNotifications = notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem('adminNotifications', JSON.stringify(updatedNotifications));
  };
  
  // Função para fazer logout
  const handleLogout = () => {
    // Remover dados de autenticação do localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    // Navegar para a página de login
    navigate('/login');
  };
  
  // Função para navegação do menu lateral
  const handleNavigation = (tab) => {
    // Caso especial para Horas Extras - navega para a rota /rh
    if (tab === 'horasExtras') {
      navigate('/rh');
    } else {
      setActiveTab(tab);
    }
  };
  
  // Carregar dados do funcionário do AdminPage
  useEffect(() => {
    // Salvando notificações quando alteradas
    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
  }, [notifications]);
  
  // Verificar contestações pendentes
  useEffect(() => {
    const checkPendingContestacoes = () => {
      const contestacoes = JSON.parse(localStorage.getItem('contestacoes') || '[]');
      const pendentes = contestacoes.filter(c => c.status === 'pendente').length;
      setContestacoesPendentes(pendentes);
    };
    
    checkPendingContestacoes();
    
    // Verificar a cada 10 segundos
    const interval = setInterval(checkPendingContestacoes, 10000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white flex flex-col">
      {/* Header */}
      <header className="bg-purple-900 bg-opacity-80 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-purple-600 rounded-full p-1 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold">CuidaEmprego | Administrador</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notificações */}
            <div className="relative">
              <button 
                onClick={() => setShowNotificationsMenu(!showNotificationsMenu)}
                className="relative focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotificationsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>
              
              {showNotificationsMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-purple-800 rounded-md shadow-lg py-1 z-20">
                  <div className="flex justify-between items-center px-4 py-2 border-b border-purple-700">
                    <h3 className="font-medium">Notificações</h3>
                    {unreadNotificationsCount > 0 && (
                      <button 
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-purple-300 hover:text-white"
                      >
                        Marcar todas como lidas
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="px-4 py-2 text-sm text-purple-300">Sem notificações.</p>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`px-4 py-2 border-b border-purple-700 cursor-pointer hover:bg-purple-700 ${!notification.read ? 'bg-purple-700 bg-opacity-50' : ''}`}
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <p className="text-sm">{notification.message}</p>
                          <p className="text-xs text-purple-300">{notification.date}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 text-center">
                    <button 
                      onClick={() => setActiveTab('notificacoes')}
                      className="text-xs text-purple-300 hover:text-white"
                    >
                      Ver todas notificações
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Perfil */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 focus:outline-none"
              >
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                  <span className="font-medium text-sm">{userData.initials}</span>
                </div>
                <span className="hidden md:inline-block">{userData.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-purple-800 rounded-md shadow-lg py-1 z-20">
                  <a href="#" className="block px-4 py-2 text-sm hover:bg-purple-700">Meu Perfil</a>
                  <a href="#" className="block px-4 py-2 text-sm hover:bg-purple-700">Configurações</a>
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm hover:bg-purple-700">Sair</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex">
        {/* Sidebar */}
        <div className="w-64 bg-purple-900 bg-opacity-60 shadow-lg hidden md:block">
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Menu Administrativo</h2>
            <nav>
              <ul>
                <li className="mb-2">
                  <button 
                    onClick={() => handleNavigation('pontoBatido')}
                    className={`w-full flex items-center p-2 rounded-md ${activeTab === 'pontoBatido' ? 'bg-purple-700' : 'hover:bg-purple-800'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Ponto Batido
                  </button>
                </li>
                <li className="mb-2">
                  <button 
                    onClick={() => handleNavigation('ajustesPonto')}
                    className={`w-full flex items-center p-2 rounded-md ${activeTab === 'ajustesPonto' ? 'bg-purple-700' : 'hover:bg-purple-800'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Ajustes de Ponto
                  </button>
                </li>
                <li className="mb-2">
                  <button 
                    onClick={() => handleNavigation('jornadas')}
                    className={`w-full flex items-center p-2 rounded-md ${activeTab === 'jornadas' ? 'bg-purple-700' : 'hover:bg-purple-800'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Jornadas de Trabalho
                  </button>
                </li>
                <li className="mb-2">
                  <button 
                    onClick={() => handleNavigation('horasExtras')}
                    className={`w-full flex items-center p-2 rounded-md hover:bg-purple-800`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Horas Extras
                  </button>
                </li>
                <li className="mb-2">
                  <button 
                    onClick={() => handleNavigation('contestacoes')}
                    className={`w-full flex items-center p-2 rounded-md relative ${activeTab === 'contestacoes' ? 'bg-purple-700' : 'hover:bg-purple-800'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Contestações
                    {contestacoesPendentes > 0 && (
                      <span className="absolute right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {contestacoesPendentes}
                      </span>
                    )}
                  </button>
                </li>
                <li className="mb-2">
                  <button 
                    onClick={() => handleNavigation('ausencias')}
                    className={`w-full flex items-center p-2 rounded-md ${activeTab === 'ausencias' ? 'bg-purple-700' : 'hover:bg-purple-800'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Ausências
                  </button>
                </li>
                <li className="mb-2">
                  <button 
                    onClick={() => handleNavigation('bancoHoras')}
                    className={`w-full flex items-center p-2 rounded-md ${activeTab === 'bancoHoras' ? 'bg-purple-700' : 'hover:bg-purple-800'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                    Banco de Horas
                  </button>
                </li>
                <li className="mb-2">
                  <button 
                    onClick={() => handleNavigation('relatorios')}
                    className={`w-full flex items-center p-2 rounded-md ${activeTab === 'relatorios' ? 'bg-purple-700' : 'hover:bg-purple-800'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Relatórios
                  </button>
                </li>
                <li className="mb-2">
                  <button 
                    onClick={() => handleNavigation('notificacoes')}
                    className={`w-full flex items-center p-2 rounded-md ${activeTab === 'notificacoes' ? 'bg-purple-700' : 'hover:bg-purple-800'}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Notificações
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-4 overflow-y-auto">
          {activeTab === 'pontoBatido' && <PontoBatidoTab />}
          {activeTab === 'ajustesPonto' && <AjustesPontoTab />}
          {activeTab === 'jornadas' && <JornadasTab />}
          {activeTab === 'contestacoes' && <ContestacaoAdmin />}
          {activeTab === 'ausencias' && <AusenciasTab />}
          {activeTab === 'bancoHoras' && <BancoHorasTab />}
          {activeTab === 'relatorios' && <RelatoriosTab />}
          {activeTab === 'notificacoes' && <NotificacoesTab />}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-purple-900 bg-opacity-80 shadow-lg py-4">
        <div className="container mx-auto px-4 text-center text-purple-300 text-sm">
          <p>&copy; 2025 CuidaEmprego. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;