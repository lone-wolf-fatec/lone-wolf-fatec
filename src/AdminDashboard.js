import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
  const navigate = useNavigate();
   // Carrega os dados do usuário do localStorage quando o componente é montado
    useEffect(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUserData({
            name: parsedUser.name || 'Usuário'
          });
        } catch (error) {
          console.error('Erro ao analisar dados do usuário:', error);
          setUserData({ name: 'Usuário' });
        }
      }
    }, []);
    // Pega as iniciais do nome para o avatar
    const getInitials = (name) => {
      if (!name) return 'U';
      const nameParts = name.split(' ');
      if (nameParts.length === 1) return nameParts[0].charAt(0).toUpperCase();
      return (nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0)).toUpperCase();
    };
  // Obter dados do usuário logado do localStorage
  const [userData, setUserData] = useState(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : {
      name: 'Usuário',
      initials: 'US',
      isAdmin: true
    };
  });
  
  // Obter registros de ponto do localStorage
  const [timeEntries, setTimeEntries] = useState(() => {
    const storedEntries = localStorage.getItem('timeEntries');
    return storedEntries ? JSON.parse(storedEntries) : [];
  });
  
  // Estado para os tabs
  const [activeTab, setActiveTab] = useState('overtimes');
  
  // Estados para horas extras
  const [overtimeEntries, setOvertimeEntries] = useState(() => {
    const storedOvertimes = localStorage.getItem('overtimeEntries');
    return storedOvertimes ? JSON.parse(storedOvertimes) : [
      { date: '10/03/2025', hours: 2, status: 'aprovado', reason: 'Finalização de projeto urgente' },
      { date: '05/03/2025', hours: 1.5, status: 'pendente', reason: 'Reunião com cliente internacional' }
    ];
  });
  const [newOvertime, setNewOvertime] = useState({
    date: '',
    hours: '',
    reason: ''
  });
  
  // Estados para férias
  const [vacationRequests, setVacationRequests] = useState(() => {
    const storedVacations = localStorage.getItem('vacationRequests');
    return storedVacations ? JSON.parse(storedVacations) : [
      { startDate: '01/04/2025', endDate: '15/04/2025', status: 'aprovado', workingDays: 10 },
      { startDate: '10/07/2025', endDate: '24/07/2025', status: 'pendente', workingDays: 11 }
    ];
  });
  const [newVacation, setNewVacation] = useState({
    startDate: '',
    endDate: '',
  });
  
  // Estados para folgas
  const [dayOffRequests, setDayOffRequests] = useState(() => {
    const storedDaysOff = localStorage.getItem('dayOffRequests');
    return storedDaysOff ? JSON.parse(storedDaysOff) : [
      { date: '15/03/2025', reason: 'Compensação de horas', status: 'aprovado' },
      { date: '20/04/2025', reason: 'Aniversário', status: 'pendente' }
    ];
  });
  const [newDayOff, setNewDayOff] = useState({
    date: '',
    reason: ''
  });
  
  // Estado para mostrar/esconder o menu do perfil
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Salvar dados quando forem alterados
  useEffect(() => {
    localStorage.setItem('overtimeEntries', JSON.stringify(overtimeEntries));
    localStorage.setItem('vacationRequests', JSON.stringify(vacationRequests));
    localStorage.setItem('dayOffRequests', JSON.stringify(dayOffRequests));
  }, [overtimeEntries, vacationRequests, dayOffRequests]);
  
  // Função para calcular dias úteis entre duas datas
  const calculateWorkingDays = (startDate, endDate) => {
    const start = parseDate(startDate);
    const end = parseDate(endDate);
    
    let count = 0;
    const current = new Date(start);
    
    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Não é sábado nem domingo
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  };
  
  // Helper para parsear data
  const parseDate = (dateString) => {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  };

  // Lógica para detectar horas extras automaticamente (simplificada)
  const detectOvertime = () => {
    // Detecta horas extras trabalhadas analisando os registros de ponto
    const standardWorkHours = 8; // 8 horas por dia
    const detectedOvertimes = [];
    
    // Agrupa os registros por data
    const groupedEntries = timeEntries.reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = [];
      }
      acc[entry.date].push(entry);
      return acc;
    }, {});
    
    // Calcula as horas trabalhadas para cada dia
    Object.keys(groupedEntries).forEach(date => {
      const entriesForDay = groupedEntries[date].sort((a, b) => {
        // Ordena por tempo e então por tipo (entrada vem antes de saída)
        if (a.time === b.time) {
          return a.type === 'entrada' ? -1 : 1;
        }
        return a.time.localeCompare(b.time);
      });
      
      // Calcula horas trabalhadas
      let totalMinutes = 0;
      for (let i = 0; i < entriesForDay.length; i += 2) {
        if (i + 1 < entriesForDay.length && entriesForDay[i].type === 'entrada' && entriesForDay[i+1].type === 'saída') {
          const [startHour, startMinute] = entriesForDay[i].time.split(':').map(Number);
          const [endHour, endMinute] = entriesForDay[i+1].time.split(':').map(Number);
          
          const startMinutes = startHour * 60 + startMinute;
          const endMinutes = endHour * 60 + endMinute;
          
          totalMinutes += endMinutes - startMinutes;
        }
      }
      
      // Se trabalhou mais que o padrão, registra como hora extra
      const hoursWorked = totalMinutes / 60;
      if (hoursWorked > standardWorkHours) {
        const overtimeHours = hoursWorked - standardWorkHours;
        
        // Verifica se essa hora extra já existe
        const existingOvertime = overtimeEntries.find(ot => ot.date === date && ot.auto === true);
        
        if (!existingOvertime) {
          detectedOvertimes.push({
            date,
            hours: parseFloat(overtimeHours.toFixed(1)),
            status: 'detectado',
            reason: 'Detectado automaticamente',
            auto: true
          });
        }
      }
    });
    
    // Adiciona as horas extras detectadas
    if (detectedOvertimes.length > 0) {
      setOvertimeEntries([...detectedOvertimes, ...overtimeEntries]);
    }
  };

  // Adicionar nova hora extra
  const handleAddOvertime = (e) => {
    e.preventDefault();
    if (!newOvertime.date || !newOvertime.hours || !newOvertime.reason) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    const overtime = {
      ...newOvertime,
      status: 'pendente',
      hours: parseFloat(newOvertime.hours)
    };
    
    setOvertimeEntries([overtime, ...overtimeEntries]);
    setNewOvertime({ date: '', hours: '', reason: '' });
  };
  
  // Adicionar nova solicitação de férias
  const handleAddVacation = (e) => {
    e.preventDefault();
    if (!newVacation.startDate || !newVacation.endDate) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    const workingDays = calculateWorkingDays(newVacation.startDate, newVacation.endDate);
    
    const vacation = {
      ...newVacation,
      status: 'pendente',
      workingDays
    };
    
    setVacationRequests([vacation, ...vacationRequests]);
    setNewVacation({ startDate: '', endDate: '' });
  };
  
  // Adicionar nova solicitação de folga
  const handleAddDayOff = (e) => {
    e.preventDefault();
    if (!newDayOff.date || !newDayOff.reason) {
      alert('Por favor, preencha todos os campos');
      return;
    }
    
    const dayOff = {
      ...newDayOff,
      status: 'pendente'
    };
    
    setDayOffRequests([dayOff, ...dayOffRequests]);
    setNewDayOff({ date: '', reason: '' });
  };
  
  // Alterar status (simulação de aprovação/rejeição)
  const changeStatus = (type, index, newStatus) => {
    if (type === 'overtime') {
      const updated = [...overtimeEntries];
      updated[index].status = newStatus;
      setOvertimeEntries(updated);
    } else if (type === 'vacation') {
      const updated = [...vacationRequests];
      updated[index].status = newStatus;
      setVacationRequests(updated);
    } else if (type === 'dayoff') {
      const updated = [...dayOffRequests];
      updated[index].status = newStatus;
      setDayOffRequests(updated);
    }
  };
  
  // Detector automático de horas extras na inicialização
  useEffect(() => {
    detectOvertime();
  }, [timeEntries]);
  
  // Função para fazer logout
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };
  
  // Função para voltar ao dashboard
  const goToDashboard = () => {
    navigate('/');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-black text-white">
      {/* Header */}
      <header className="bg-purple-900 bg-opacity-80 shadow-lg sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-purple-600 rounded-full p-1 mr-2 cursor-pointer" onClick={goToDashboard}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xl font-bold">CuidaEmprego</span>
          </div>
          
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
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-4 mb-8">
          <h1 className="text-2xl font-bold mb-6">Gerenciamento de Horas Extras, Férias e Folgas</h1>
          
          {/* Tabs */}
          <div className="flex border-b border-purple-700 mb-6">
            <button 
              className={`px-4 py-2 mr-2 focus:outline-none ${activeTab === 'overtimes' ? 'border-b-2 border-purple-400 font-semibold' : 'text-purple-300'}`}
              onClick={() => setActiveTab('overtimes')}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Horas Extras
              </div>
            </button>
            <button 
              className={`px-4 py-2 mr-2 focus:outline-none ${activeTab === 'vacations' ? 'border-b-2 border-purple-400 font-semibold' : 'text-purple-300'}`}
              onClick={() => setActiveTab('vacations')}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Férias
              </div>
            </button>
            <button 
              className={`px-4 py-2 focus:outline-none ${activeTab === 'daysoff' ? 'border-b-2 border-purple-400 font-semibold' : 'text-purple-300'}`}
              onClick={() => setActiveTab('daysoff')}
            >
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Folgas
              </div>
            </button>
          </div>
          
          {/* Conteúdo da Tab - Horas Extras */}
          {activeTab === 'overtimes' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Registrar Nova Hora Extra</h2>
                <form onSubmit={handleAddOvertime} className="bg-purple-900 bg-opacity-40 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-purple-300 mb-1">Data</label>
                      <input 
                        type="date" 
                        className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                        value={newOvertime.date}
                        onChange={(e) => setNewOvertime({...newOvertime, date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-purple-300 mb-1">Horas</label>
                      <input 
                        type="number" 
                        step="0.5"
                        min="0.5"
                        className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                        value={newOvertime.hours}
                        onChange={(e) => setNewOvertime({...newOvertime, hours: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-purple-300 mb-1">Motivo</label>
                      <input 
                        type="text" 
                        className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                        value={newOvertime.reason}
                        onChange={(e) => setNewOvertime({...newOvertime, reason: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Solicitar Hora Extra
                  </button>
                </form>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Histórico de Horas Extras</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-purple-300 text-sm">
                        <th className="text-left p-2">Data</th>
                        <th className="text-left p-2">Horas</th>
                        <th className="text-left p-2">Motivo</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overtimeEntries.map((entry, index) => (
                        <tr key={index} className="border-t border-purple-700">
                          <td className="p-2">{entry.date}</td>
                          <td className="p-2">{entry.hours}h</td>
                          <td className="p-2">{entry.reason}</td>
                          <td className="p-2">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              entry.status === 'aprovado' ? 'bg-green-600' : 
                              entry.status === 'rejeitado' ? 'bg-red-600' :
                              entry.status === 'detectado' ? 'bg-blue-600' : 'bg-yellow-600'
                            }`}>
                              {entry.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-2">
                            {entry.status === 'pendente' && (
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => changeStatus('overtime', index, 'aprovado')}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                                >
                                  Aprovar
                                </button>
                                <button 
                                  onClick={() => changeStatus('overtime', index, 'rejeitado')}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                                >
                                  Rejeitar
                                </button>
                              </div>
                            )}
                            {entry.status === 'detectado' && (
                              <button 
                                onClick={() => changeStatus('overtime', index, 'aprovado')}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                              >
                                Confirmar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {/* Conteúdo da Tab - Férias */}
          {activeTab === 'vacations' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Solicitar Férias</h2>
                <form onSubmit={handleAddVacation} className="bg-purple-900 bg-opacity-40 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-purple-300 mb-1">Data de Início</label>
                      <input 
                        type="date" 
                        className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                        value={newVacation.startDate}
                        onChange={(e) => setNewVacation({...newVacation, startDate: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-purple-300 mb-1">Data de Término</label>
                      <input 
                        type="date" 
                        className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                        value={newVacation.endDate}
                        onChange={(e) => setNewVacation({...newVacation, endDate: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Solicitar Férias
                  </button>
                </form>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Solicitações de Férias</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-purple-300 text-sm">
                        <th className="text-left p-2">Data de Início</th>
                        <th className="text-left p-2">Data de Término</th>
                        <th className="text-left p-2">Dias Úteis</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vacationRequests.map((request, index) => (
                        <tr key={index} className="border-t border-purple-700">
                          <td className="p-2">{request.startDate}</td>
                          <td className="p-2">{request.endDate}</td>
                          <td className="p-2">{request.workingDays}</td>
                          <td className="p-2">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              request.status === 'aprovado' ? 'bg-green-600' : 
                              request.status === 'rejeitado' ? 'bg-red-600' : 'bg-yellow-600'
                            }`}>
                              {request.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-2">
                            {request.status === 'pendente' && (
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => changeStatus('vacation', index, 'aprovado')}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                                >
                                  Aprovar
                                </button>
                                <button 
                                  onClick={() => changeStatus('vacation', index, 'rejeitado')}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                                >
                                  Rejeitar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
         {/* Conteúdo da Tab - Folgas */}
         {activeTab === 'daysoff' && (
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-4">Solicitar Folga</h2>
                <form onSubmit={handleAddDayOff} className="bg-purple-900 bg-opacity-40 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-purple-300 mb-1">Data</label>
                      <input 
                        type="date" 
                        className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                        value={newDayOff.date}
                        onChange={(e) => setNewDayOff({...newDayOff, date: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-purple-300 mb-1">Motivo</label>
                      <input 
                        type="text" 
                        className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                        value={newDayOff.reason}
                        onChange={(e) => setNewDayOff({...newDayOff, reason: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Solicitar Folga
                  </button>
                </form>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Solicitações de Folga</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-purple-300 text-sm">
                        <th className="text-left p-2">Data</th>
                        <th className="text-left p-2">Motivo</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dayOffRequests.map((request, index) => (
                        <tr key={index} className="border-t border-purple-700">
                          <td className="p-2">{request.date}</td>
                          <td className="p-2">{request.reason}</td>
                          <td className="p-2">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              request.status === 'aprovado' ? 'bg-green-600' : 
                              request.status === 'rejeitado' ? 'bg-red-600' : 'bg-yellow-600'
                            }`}>
                              {request.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-2">
                            {request.status === 'pendente' && (
                              <div className="flex space-x-2">
                                <button 
                                  onClick={() => changeStatus('dayoff', index, 'aprovado')}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded"
                                >
                                  Aprovar
                                </button>
                                <button 
                                  onClick={() => changeStatus('dayoff', index, 'rejeitado')}
                                  className="bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
                                >
                                  Rejeitar
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card - Horas Extras */}
          <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-4">
            <div className="flex items-center mb-4">
              <div className="bg-purple-600 p-2 rounded-full mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">Horas Extras</h2>
            </div>
            <p className="text-purple-300 mb-2">Total de solicitações: {overtimeEntries.length}</p>
            <div className="flex justify-between text-sm">
              <span className="text-green-400">Aprovadas: {overtimeEntries.filter(e => e.status === 'aprovado').length}</span>
              <span className="text-yellow-400">Pendentes: {overtimeEntries.filter(e => e.status === 'pendente' || e.status === 'detectado').length}</span>
              <span className="text-red-400">Rejeitadas: {overtimeEntries.filter(e => e.status === 'rejeitado').length}</span>
            </div>
          </div>
          
          {/* Card - Férias */}
          <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-4">
            <div className="flex items-center mb-4">
              <div className="bg-purple-600 p-2 rounded-full mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">Férias</h2>
            </div>
            <p className="text-purple-300 mb-2">Total de solicitações: {vacationRequests.length}</p>
            <div className="flex justify-between text-sm">
              <span className="text-green-400">Aprovadas: {vacationRequests.filter(e => e.status === 'aprovado').length}</span>
              <span className="text-yellow-400">Pendentes: {vacationRequests.filter(e => e.status === 'pendente').length}</span>
              <span className="text-red-400">Rejeitadas: {vacationRequests.filter(e => e.status === 'rejeitado').length}</span>
            </div>
          </div>
          
          {/* Card - Folgas */}
          <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-4">
            <div className="flex items-center mb-4">
              <div className="bg-purple-600 p-2 rounded-full mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold">Folgas</h2>
            </div>
            <p className="text-purple-300 mb-2">Total de solicitações: {dayOffRequests.length}</p>
            <div className="flex justify-between text-sm">
              <span className="text-green-400">Aprovadas: {dayOffRequests.filter(e => e.status === 'aprovado').length}</span>
              <span className="text-yellow-400">Pendentes: {dayOffRequests.filter(e => e.status === 'pendente').length}</span>
              <span className="text-red-400">Rejeitadas: {dayOffRequests.filter(e => e.status === 'rejeitado').length}</span>
            </div>
          </div>
        </div>
        
        {/* Admin Actions */}
        <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Ações rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Exportar Relatórios
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Criar Nova Política
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              Notificar Funcionários
            </button>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-purple-900 bg-opacity-80 shadow-lg py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-purple-300 text-sm">
          <p>&copy; 2025 CuidaEmprego. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default AdminDashboard;