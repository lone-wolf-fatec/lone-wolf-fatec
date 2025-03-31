import React, { useState, useEffect } from 'react';

const NotificacoesComponent = ({ userId }) => {
  // Estado para as notificações
  const [notificacoes, setNotificacoes] = useState([]);
  const [showNotificacoes, setShowNotificacoes] = useState(false);
  const [novasNotificacoes, setNovasNotificacoes] = useState(0);
  
  // Carregar notificações do localStorage
  useEffect(() => {
    const carregarNotificacoes = () => {
      const todasNotificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
      
      // Filtrar notificações para este usuário
      const notificacoesUsuario = todasNotificacoes.filter(notif => notif.userId === userId);
      
      setNotificacoes(notificacoesUsuario);
      setNovasNotificacoes(notificacoesUsuario.filter(notif => !notif.read).length);
    };
    
    carregarNotificacoes();
    
    // Configurar intervalo para verificar novas notificações
    const interval = setInterval(carregarNotificacoes, 30000); // A cada 30 segundos
    
    return () => clearInterval(interval);
  }, [userId]);
  
  // Marcar notificação como lida
  const marcarComoLida = (id) => {
    const todasNotificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    
    const notificacoesAtualizadas = todasNotificacoes.map(notif => {
      if (notif.id === id) {
        return { ...notif, read: true };
      }
      return notif;
    });
    
    localStorage.setItem('userNotifications', JSON.stringify(notificacoesAtualizadas));
    
    // Atualizar estado
    setNotificacoes(prevNotifs => prevNotifs.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
    
    setNovasNotificacoes(prev => Math.max(0, prev - 1));
  };
  
  // Marcar todas como lidas
  const marcarTodasComoLidas = () => {
    const todasNotificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    
    const notificacoesAtualizadas = todasNotificacoes.map(notif => {
      if (notif.userId === userId && !notif.read) {
        return { ...notif, read: true };
      }
      return notif;
    });
    
    localStorage.setItem('userNotifications', JSON.stringify(notificacoesAtualizadas));
    
    // Atualizar estado
    setNotificacoes(prevNotifs => prevNotifs.map(notif => ({ ...notif, read: true })));
    setNovasNotificacoes(0);
  };
  
  // Remover notificação
  const removerNotificacao = (id) => {
    const todasNotificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    
    const notificacoesAtualizadas = todasNotificacoes.filter(notif => notif.id !== id);
    
    localStorage.setItem('userNotifications', JSON.stringify(notificacoesAtualizadas));
    
    // Atualizar estado
    const notificacaoRemovida = notificacoes.find(notif => notif.id === id);
    setNotificacoes(prevNotifs => prevNotifs.filter(notif => notif.id !== id));
    
    if (notificacaoRemovida && !notificacaoRemovida.read) {
      setNovasNotificacoes(prev => Math.max(0, prev - 1));
    }
  };
  
  // Toggle mostrar/esconder notificações
  const toggleNotificacoes = () => {
    setShowNotificacoes(!showNotificacoes);
  };
  
  // Limpar todas as notificações
  const limparNotificacoes = () => {
    const todasNotificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    
    const notificacoesAtualizadas = todasNotificacoes.filter(notif => notif.userId !== userId);
    
    localStorage.setItem('userNotifications', JSON.stringify(notificacoesAtualizadas));
    
    // Atualizar estado
    setNotificacoes([]);
    setNovasNotificacoes(0);
  };
  
  return (
    <div className="relative">
      {/* Botão de notificações */}
      <button 
        className="relative p-2 rounded-full bg-purple-700 hover:bg-purple-600 transition-colors"
        onClick={toggleNotificacoes}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        
        {novasNotificacoes > 0 && (
          <span className="absolute top-0 right-0 inline-block w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {novasNotificacoes > 9 ? '9+' : novasNotificacoes}
          </span>
        )}
      </button>
      
      {/* Painel de notificações */}
      {showNotificacoes && (
        <div className="absolute right-0 mt-2 w-80 bg-purple-800 rounded-lg shadow-xl z-50">
          <div className="p-3 border-b border-purple-700 flex justify-between items-center">
            <h3 className="font-medium text-white">Notificações</h3>
            {notificacoes.length > 0 && (
              <div className="flex space-x-2">
                <button 
                  className="text-xs text-purple-300 hover:text-white"
                  onClick={marcarTodasComoLidas}
                >
                  Marcar todas como lidas
                </button>
                <button 
                  className="text-xs text-purple-300 hover:text-white"
                  onClick={limparNotificacoes}
                >
                  Limpar todas
                </button>
              </div>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notificacoes.length === 0 ? (
              <div className="p-4 text-center text-purple-300">
                <p>Nenhuma notificação</p>
              </div>
            ) : (
              <ul>
                {notificacoes.map(notif => (
                  <li 
                    key={notif.id} 
                    className={`p-3 border-b border-purple-700 hover:bg-purple-700 ${!notif.read ? 'bg-purple-900' : ''}`}
                  >
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <p className="text-sm text-white mb-1">{notif.message}</p>
                        <p className="text-xs text-purple-300">{notif.date}</p>
                      </div>
                      <div className="flex items-start space-x-1">
                        {!notif.read && (
                          <button 
                            className="text-xs text-blue-400 hover:text-blue-300"
                            onClick={() => marcarComoLida(notif.id)}
                          >
                            Marcar como lida
                          </button>
                        )}
                        <button 
                          className="text-xs text-red-400 hover:text-red-300"
                          onClick={() => removerNotificacao(notif.id)}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificacoesComponent;