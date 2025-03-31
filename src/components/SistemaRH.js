import React, { useState, useEffect } from 'react';
import HorasExtrasTab from './HorasExtrasTab';
import FeriasTab from './FeriasTab';
import FolgaTab from './FolgaTab';

const SistemaRH = () => {
  const [activeTab, setActiveTab] = useState('horasExtras');
  const [notifications, setNotifications] = useState([]);
  
  // Carregar notificações do localStorage
  useEffect(() => {
    const userNotifications = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    // Filtrar apenas notificações não lidas
    const unreadNotifications = userNotifications.filter(notif => !notif.read);
    setNotifications(unreadNotifications);
  }, []);
  
  // Renderizar aba ativa
  const renderActiveTab = () => {
    switch(activeTab) {
      case 'horasExtras':
        return <HorasExtrasTab />;
      case 'ferias':
        return <FeriasTab />;
      case 'folgas':
        return <FolgaTab />;
      default:
        return <HorasExtrasTab />;
    }
  };
  
  return (
    <div className="min-h-screen bg-purple-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Sistema de RH</h1>
            <p className="text-purple-300">Gerenciamento de Pessoal</p>
          </div>
          
          {/* Notificações */}
          <div className="relative">
            <button className="bg-purple-800 p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </header>
        
        {/* Tabs */}
        <div className="bg-purple-800 bg-opacity-30 rounded-t-lg p-1 flex space-x-1">
          <button 
            className={`px-4 py-2 rounded-t-md font-medium transition ${activeTab === 'horasExtras' ? 'bg-purple-800 bg-opacity-70' : 'hover:bg-purple-800 hover:bg-opacity-40'}`}
            onClick={() => setActiveTab('horasExtras')}
          >
            Horas Extras
          </button>
          <button 
            className={`px-4 py-2 rounded-t-md font-medium transition ${activeTab === 'ferias' ? 'bg-purple-800 bg-opacity-70' : 'hover:bg-purple-800 hover:bg-opacity-40'}`}
            onClick={() => setActiveTab('ferias')}
          >
            Férias
          </button>
          <button 
            className={`px-4 py-2 rounded-t-md font-medium transition ${activeTab === 'folgas' ? 'bg-purple-800 bg-opacity-70' : 'hover:bg-purple-800 hover:bg-opacity-40'}`}
            onClick={() => setActiveTab('folgas')}
          >
            Folgas
          </button>
        </div>
        
        {/* Content */}
        <div>
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default SistemaRH;