import React, { useState, useEffect } from 'react';

const ClearTimeEntriesButton = () => {
  const [showModal, setShowModal] = useState(false);
  const [timeUntilNextClear, setTimeUntilNextClear] = useState(null);
  const [canClear, setCanClear] = useState(false);

  useEffect(() => {
    // Verificar quando foi a última limpeza
    const lastClear = localStorage.getItem('lastTimeEntriesClear');
    const now = new Date().getTime();
    
    if (!lastClear) {
      // Se nunca limpou, permitir limpeza
      setCanClear(true);
      setTimeUntilNextClear(null);
    } else {
      // Tempo de espera: 2 dias (48 horas) em milissegundos
      const waitTime = 2 * 24 * 60 * 60 * 1000;
      const timeSinceLastClear = now - parseInt(lastClear);
      
      if (timeSinceLastClear >= waitTime) {
        setCanClear(true);
        setTimeUntilNextClear(null);
      } else {
        setCanClear(false);
        
        // Calcular tempo restante
        const remainingTime = waitTime - timeSinceLastClear;
        setTimeUntilNextClear(formatRemainingTime(remainingTime));
        
        // Atualizar o contador a cada minuto
        const interval = setInterval(() => {
          const currentTime = new Date().getTime();
          const updatedRemainingTime = waitTime - (currentTime - parseInt(lastClear));
          
          if (updatedRemainingTime <= 0) {
            setCanClear(true);
            setTimeUntilNextClear(null);
            clearInterval(interval);
          } else {
            setTimeUntilNextClear(formatRemainingTime(updatedRemainingTime));
          }
        }, 60000); // Atualizar a cada minuto
        
        return () => clearInterval(interval);
      }
    }
  }, []);

  // Formatar tempo restante em formato legível (dias, horas, minutos)
  const formatRemainingTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;
    
    let result = '';
    if (days > 0) result += `${days} dia${days > 1 ? 's' : ''} `;
    if (remainingHours > 0) result += `${remainingHours} hora${remainingHours > 1 ? 's' : ''} `;
    if (remainingMinutes > 0) result += `${remainingMinutes} minuto${remainingMinutes > 1 ? 's' : ''}`;
    
    return result.trim();
  };

  // Limpar os registros de ponto
  const clearTimeEntries = () => {
    // Obter registros atuais
    const timeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    
    // Criar um backup
    localStorage.setItem('timeEntriesBackup', JSON.stringify(timeEntries));
    
    // Limpar registros
    localStorage.setItem('timeEntries', JSON.stringify([]));
    
    // Registrar a data/hora da limpeza
    localStorage.setItem('lastTimeEntriesClear', new Date().getTime().toString());
    
    // Atualizar estado
    setCanClear(false);
    setTimeUntilNextClear('2 dias');
    
    setShowModal(false);
    
    // Notificar administrador
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    adminNotifications.unshift({
      id: Date.now(),
      message: `${user.name || 'Um usuário'} realizou a limpeza dos registros de ponto`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    });
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
    
    // Mostrar mensagem de sucesso
    alert('Registros de ponto limpos com sucesso!');
    
    // Recarregar a página para atualizar os dados exibidos
    window.location.reload();
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`w-full sm:w-64 font-bold py-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center
          ${canClear 
            ? 'bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white' 
            : 'bg-gray-600 cursor-not-allowed opacity-60 text-gray-300'}`}
        disabled={!canClear}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        {canClear 
          ? "Limpar Registros de Ponto" 
          : `Aguarde ${timeUntilNextClear}`}
      </button>

      {/* Modal de confirmação */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Confirmar Limpeza</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-purple-300 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-red-800 bg-opacity-40 p-4 rounded-lg mb-4">
                <p className="flex items-center text-white mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="font-bold">Atenção!</span>
                </p>
                <p className="text-white">Você está prestes a limpar todos os seus registros de ponto.</p>
                <p className="text-white mt-2">Esta ação não pode ser desfeita e você só poderá realizar uma nova limpeza após 2 dias.</p>
              </div>

              <p className="text-purple-300">Após a limpeza, todos os seus registros de entrada e saída serão removidos. Um backup será mantido para fins administrativos.</p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-purple-800 hover:bg-purple-700 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={clearTimeEntries}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md"
              >
                Confirmar Limpeza
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClearTimeEntriesButton;