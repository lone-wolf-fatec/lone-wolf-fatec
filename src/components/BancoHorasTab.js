import React, { useState, useEffect } from 'react';

const BancoHorasTab = () => {
  // Estado para armazenar funcionários
  const [employees, setEmployees] = useState(() => {
    // First check for registered users
    const registeredUsers = JSON.parse(localStorage.getItem('users') || '[]');
    // Then check for existing employees
    const storedEmployees = localStorage.getItem('employees');
    const existingEmployees = storedEmployees ? JSON.parse(storedEmployees) : [
      { id: 1, name: 'João Silva', email: 'joao.silva@empresa.com', department: 'TI' },
      { id: 2, name: 'Maria Oliveira', email: 'maria.oliveira@empresa.com', department: 'RH' },
      { id: 3, name: 'Carlos Pereira', email: 'carlos.pereira@empresa.com', department: 'Financeiro' },
      { id: 4, name: 'Ana Santos', email: 'ana.santos@empresa.com', department: 'Marketing' },
      { id: 5, name: 'Bruno Almeida', email: 'bruno.almeida@empresa.com', department: 'Operações' }
    ];
    
    // Convert registered users to employee format and merge with existing employees
    // Avoid duplicates by checking emails
    const existingEmails = existingEmployees.map(emp => emp.email);
    
    const usersAsEmployees = registeredUsers
      .filter(user => !existingEmails.includes(user.email))
      .map((user, index) => ({
        id: existingEmployees.length + index + 1,
        name: user.name || user.displayName || user.email.split('@')[0],
        email: user.email,
        department: user.department || 'Não especificado'
      }));
    
    return [...existingEmployees, ...usersAsEmployees];
  });
  
  // Estado para armazenar banco de horas
  const [bancoHoras, setBancoHoras] = useState(() => {
    const storedBanco = localStorage.getItem('bancoHoras');
    return storedBanco ? JSON.parse(storedBanco) : [
      { id: 1, employeeId: 1, employeeName: 'João Silva', saldoPositivo: '10:30', saldoNegativo: '00:00', totalHoras: '10:30', updatedAt: '15/03/2025', notified: true },
      { id: 2, employeeId: 2, employeeName: 'Maria Oliveira', saldoPositivo: '05:45', saldoNegativo: '01:30', totalHoras: '04:15', updatedAt: '18/03/2025', notified: true },
      { id: 3, employeeId: 3, employeeName: 'Carlos Pereira', saldoPositivo: '08:15', saldoNegativo: '00:45', totalHoras: '07:30', updatedAt: '19/03/2025', notified: true },
      { id: 4, employeeId: 4, employeeName: 'Ana Santos', saldoPositivo: '02:30', saldoNegativo: '00:00', totalHoras: '02:30', updatedAt: '17/03/2025', notified: true },
      { id: 5, employeeId: 5, employeeName: 'Bruno Almeida', saldoPositivo: '12:00', saldoNegativo: '02:15', totalHoras: '09:45', updatedAt: '16/03/2025', notified: true }
    ];
  });
  
  // Estado para movimentações no banco de horas
  const [movimentacoes, setMovimentacoes] = useState(() => {
    const storedMovimentacoes = localStorage.getItem('movimentacoesBancoHoras');
    return storedMovimentacoes ? JSON.parse(storedMovimentacoes) : [
      { id: 1, employeeId: 1, employeeName: 'João Silva', tipo: 'crédito', horas: '02:30', motivo: 'Hora extra', data: '15/03/2025', notified: true },
      { id: 2, employeeId: 2, employeeName: 'Maria Oliveira', tipo: 'crédito', horas: '01:45', motivo: 'Projeto especial', data: '16/03/2025', notified: true },
      { id: 3, employeeId: 3, employeeName: 'Carlos Pereira', tipo: 'débito', horas: '00:45', motivo: 'Saída antecipada', data: '17/03/2025', notified: true },
      { id: 4, employeeId: 1, employeeName: 'João Silva', tipo: 'crédito', horas: '03:00', motivo: 'Trabalho no fim de semana', data: '18/03/2025', notified: true },
      { id: 5, employeeId: 5, employeeName: 'Bruno Almeida', tipo: 'crédito', horas: '04:15', motivo: 'Suporte emergencial', data: '19/03/2025', notified: true }
    ];
  });
  
  // Estados para modais e filtros
  const [showMovimentacaoModal, setShowMovimentacaoModal] = useState(false);
  const [showCompensacaoModal, setShowCompensacaoModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeFilter, setActiveFilter] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State para nova movimentação
  const [newMovimentacao, setNewMovimentacao] = useState({
    employeeId: '',
    tipo: 'crédito',
    horas: '',
    motivo: '',
    data: new Date().toISOString().split('T')[0]
  });
  
  // Salvar dados no localStorage quando mudarem
  useEffect(() => {
    localStorage.setItem('bancoHoras', JSON.stringify(bancoHoras));
    
    // Atualizar notificações dos funcionários quando o banco de horas for atualizado
    const pendingNotifications = bancoHoras
      .filter(banco => !banco.notified)
      .map(banco => {
        return {
          id: Date.now() + Math.random(),
          userId: banco.employeeId,
          message: `Seu banco de horas foi atualizado. Saldo atual: ${banco.totalHoras}`,
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
      setBancoHoras(bancoHoras.map(banco => 
        !banco.notified ? { ...banco, notified: true } : banco
      ));
    }
  }, [bancoHoras]);
  
  useEffect(() => {
    localStorage.setItem('movimentacoesBancoHoras', JSON.stringify(movimentacoes));
    
    // Atualizar notificações dos funcionários quando novas movimentações forem criadas
    const pendingNotifications = movimentacoes
      .filter(mov => !mov.notified)
      .map(mov => {
        const tipoMsg = mov.tipo === 'crédito' ? 'crédito' : 'débito';
        return {
          id: Date.now() + Math.random(),
          userId: mov.employeeId,
          message: `Nova movimentação de ${tipoMsg} de ${mov.horas}h no seu banco de horas: ${mov.motivo}`,
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
      setMovimentacoes(movimentacoes.map(mov => 
        !mov.notified ? { ...mov, notified: true } : mov
      ));
      
      // Atualizar banco de horas com base nas novas movimentações
      atualizarBancoHoras();
    }
  }, [movimentacoes]);

  // Add useEffect to update employees when users change
  useEffect(() => {
    // Event listener for user registration changes
    const handleUserChanges = () => {
      const registeredUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Convert to employee format without duplicates
      const existingEmails = employees.map(emp => emp.email);
      
      const newUsers = registeredUsers
        .filter(user => !existingEmails.includes(user.email))
        .map((user, index) => ({
          id: employees.length + index + 1,
          name: user.name || user.displayName || user.email.split('@')[0],
          email: user.email,
          department: user.department || 'Não especificado'
        }));
      
      if (newUsers.length > 0) {
        const updatedEmployees = [...employees, ...newUsers];
        setEmployees(updatedEmployees);
        localStorage.setItem('employees', JSON.stringify(updatedEmployees));
      }
    };
    
    // Add event listener
    window.addEventListener('userRegistered', handleUserChanges);
    
    // Check for changes on component mount
    handleUserChanges();
    
    // Cleanup
    return () => {
      window.removeEventListener('userRegistered', handleUserChanges);
    };
  }, [employees]);

  // Add a storage event listener to detect changes made in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'users') {
        // Refresh employees when users storage changes
        const registeredUsers = JSON.parse(e.newValue || '[]');
        const existingEmails = employees.map(emp => emp.email);
        
        const newUsers = registeredUsers
          .filter(user => !existingEmails.includes(user.email))
          .map((user, index) => ({
            id: employees.length + index + 1,
            name: user.name || user.displayName || user.email.split('@')[0],
            email: user.email,
            department: user.department || 'Não especificado'
          }));
        
        if (newUsers.length > 0) {
          setEmployees(prev => [...prev, ...newUsers]);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [employees]);
  
  // Função para atualizar o banco de horas com base nas movimentações
  const atualizarBancoHoras = () => {
    // Para cada funcionário, calcular o saldo com base nas movimentações
    const bancoAtualizado = [...bancoHoras];
    
    employees.forEach(employee => {
      // Filtrar movimentações do funcionário que ainda não foram contabilizadas
      const movsFuncionario = movimentacoes.filter(mov => 
        mov.employeeId === employee.id && !mov.contabilizado
      );
      
      if (movsFuncionario.length > 0) {
        // Encontrar o registro atual do funcionário no banco de horas
        let bancoFuncionario = bancoAtualizado.find(b => b.employeeId === employee.id);
        
        // Se não existir, criar um novo
        if (!bancoFuncionario) {
          bancoFuncionario = {
            id: bancoAtualizado.length + 1,
            employeeId: employee.id,
            employeeName: employee.name,
            saldoPositivo: '00:00',
            saldoNegativo: '00:00',
            totalHoras: '00:00',
            updatedAt: new Date().toLocaleDateString('pt-BR'),
            notified: false
          };
          bancoAtualizado.push(bancoFuncionario);
        }
        
        // Atualizar saldos com base nas movimentações
        movsFuncionario.forEach(mov => {
          const horasAtuais = mov.tipo === 'crédito' 
            ? somarHoras(bancoFuncionario.saldoPositivo, mov.horas) 
            : somarHoras(bancoFuncionario.saldoNegativo, mov.horas);
          
          if (mov.tipo === 'crédito') {
            bancoFuncionario.saldoPositivo = horasAtuais;
          } else {
            bancoFuncionario.saldoNegativo = horasAtuais;
          }
          
          // Marcar movimentação como contabilizada
          const movsAtualizadas = [...movimentacoes];
          const index = movsAtualizadas.findIndex(m => m.id === mov.id);
          if (index !== -1) {
            movsAtualizadas[index] = { ...movsAtualizadas[index], contabilizado: true };
          }
          setMovimentacoes(movsAtualizadas);
        });
        
        // Calcular total (saldo positivo - saldo negativo)
        bancoFuncionario.totalHoras = subtrairHoras(bancoFuncionario.saldoPositivo, bancoFuncionario.saldoNegativo);
        bancoFuncionario.updatedAt = new Date().toLocaleDateString('pt-BR');
        bancoFuncionario.notified = false;
      }
    });
    
    setBancoHoras(bancoAtualizado);
  };
  
  // Função para somar horas no formato HH:MM
  const somarHoras = (horasA, horasB) => {
    const [horasAHH, horasAMM] = horasA.split(':').map(Number);
    const [horasBHH, horasBMM] = horasB.split(':').map(Number);
    
    let minutos = horasAMM + horasBMM;
    let horas = horasAHH + horasBHH;
    
    if (minutos >= 60) {
      horas += Math.floor(minutos / 60);
      minutos = minutos % 60;
    }
    
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  };
  
  // Função para subtrair horas no formato HH:MM
  const subtrairHoras = (horasA, horasB) => {
    const [horasAHH, horasAMM] = horasA.split(':').map(Number);
    const [horasBHH, horasBMM] = horasB.split(':').map(Number);
    
    // Converter tudo para minutos
    const minutosA = horasAHH * 60 + horasAMM;
    const minutosB = horasBHH * 60 + horasBMM;
    
    // Subtrair
    let minutosTotal = minutosA - minutosB;
    
    // Se resultado for negativo, retornar zero
    if (minutosTotal < 0) {
      minutosTotal = 0;
    }
    
    // Converter de volta para horas e minutos
    const horas = Math.floor(minutosTotal / 60);
    const minutos = minutosTotal % 60;
    
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
  };
  
  // Filtrar funcionários com base no termo de busca
  const filteredEmployees = employees.filter(employee => {
    const searchLower = searchTerm.toLowerCase();
    return !searchTerm || 
      (employee.name && employee.name.toLowerCase().includes(searchLower)) ||
      (employee.department && employee.department.toLowerCase().includes(searchLower));
  });
  
  // Filtrar banco de horas com base no filtro ativo e termo de busca
  const filteredBancoHoras = bancoHoras.filter(banco => {
    const searchLower = searchTerm.toLowerCase();
    return !searchTerm || 
      (banco.employeeName && banco.employeeName.toLowerCase().includes(searchLower));
  });
  
  // Filtrar movimentações com base no filtro ativo e termo de busca
  const filteredMovimentacoes = movimentacoes.filter(mov => {
    const matchesFilter = 
      (activeFilter === 'creditos' && mov.tipo === 'crédito') ||
      (activeFilter === 'debitos' && mov.tipo === 'débito') ||
      (activeFilter === 'todos');
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      !searchTerm || 
      (mov.employeeName && mov.employeeName.toLowerCase().includes(searchLower)) ||
      (mov.motivo && mov.motivo.toLowerCase().includes(searchLower)) ||
      (mov.data && mov.data.includes(searchTerm));
    
    return matchesFilter && matchesSearch;
  });
  
  // Função para abrir modal de nova movimentação
  const openMovimentacaoModal = (employee) => {
    setSelectedEmployee(employee);
    setNewMovimentacao({
      ...newMovimentacao,
      employeeId: employee.id
    });
    setShowMovimentacaoModal(true);
  };
  
  // Função para criar uma nova movimentação
  const createMovimentacao = () => {
    const formattedDate = new Date(newMovimentacao.data).toLocaleDateString('pt-BR');
    
    const novaMovimentacao = {
      id: movimentacoes.length + 1,
      employeeId: parseInt(newMovimentacao.employeeId),
      employeeName: selectedEmployee.name,
      tipo: newMovimentacao.tipo,
      horas: newMovimentacao.horas,
      motivo: newMovimentacao.motivo,
      data: formattedDate,
      notified: false,
      contabilizado: false
    };
    
    setMovimentacoes([novaMovimentacao, ...movimentacoes]);
    setShowMovimentacaoModal(false);
  };
  
  // Manipuladores para os inputs do formulário
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewMovimentacao(prev => ({ ...prev, [name]: value }));
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Banco de Horas</h1>
          <p className="text-purple-300">Gerencie o saldo de horas dos funcionários</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, departamento..."
              className="w-full sm:w-64 px-3 py-2 pl-10 bg-purple-800 bg-opacity-40 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-3 top-2.5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Tabs para navegação entre visualizações */}
      <div className="bg-purple-800 bg-opacity-40 rounded-lg p-1 flex flex-wrap space-x-1">
        <button
          onClick={() => setActiveFilter('todos')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'todos' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Todos
        </button>
        <button
          onClick={() => setActiveFilter('creditos')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'creditos' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Créditos
        </button>
        <button
          onClick={() => setActiveFilter('debitos')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'debitos' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Débitos
        </button>
        <button
          onClick={() => setActiveFilter('saldos')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'saldos' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Saldos
        </button>
        <button
          onClick={() => setActiveFilter('funcionarios')}
          className={`px-4 py-2 rounded-md ${activeFilter === 'funcionarios' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Funcionários
        </button>
      </div>
      
      {/* Conteúdo baseado na tab ativa */}
      {(activeFilter === 'todos' || activeFilter === 'creditos' || activeFilter === 'debitos') && (
        <div className="bg-purple-800 bg-opacity-20 rounded-lg shadow-lg">
          <div className="p-4 border-b border-purple-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {activeFilter === 'todos' ? 'Todas as Movimentações' : 
                activeFilter === 'creditos' ? 'Movimentações de Crédito' : 'Movimentações de Débito'}
            </h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-purple-300 text-sm">
                  <th className="text-left p-4">Funcionário</th>
                  <th className="text-left p-4">Data</th>
                  <th className="text-left p-4">Tipo</th>
                  <th className="text-left p-4">Horas</th>
                  <th className="text-left p-4">Motivo</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovimentacoes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">Nenhuma movimentação encontrada.</td>
                  </tr>
                ) : (
                  filteredMovimentacoes.map(movimentacao => (
                    <tr key={movimentacao.id} className="border-t border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                      <td className="p-4">{movimentacao.employeeName}</td>
                      <td className="p-4">{movimentacao.data}</td>
                      <td className="p-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${movimentacao.tipo === 'crédito' ? 'bg-green-600' : 'bg-red-600'}`}>
                          {movimentacao.tipo.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4">{movimentacao.horas}</td>
                      <td className="p-4">{movimentacao.motivo}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeFilter === 'saldos' && (
        <div className="bg-purple-800 bg-opacity-20 rounded-lg shadow-lg">
          <div className="p-4 border-b border-purple-700 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Saldos de Banco de Horas</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-purple-300 text-sm">
                  <th className="text-left p-4">Funcionário</th>
                  <th className="text-left p-4">Saldo Positivo</th>
                  <th className="text-left p-4">Saldo Negativo</th>
                  <th className="text-left p-4">Total</th>
                  <th className="text-left p-4">Última Atualização</th>
                </tr>
              </thead>
              <tbody>
                {filteredBancoHoras.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-4 text-center">Nenhum registro de banco de horas encontrado.</td>
                  </tr>
                ) : (
                  filteredBancoHoras.map(banco => (
                    <tr key={banco.id} className="border-t border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                      <td className="p-4">{banco.employeeName}</td>
                      <td className="p-4 text-green-400">{banco.saldoPositivo}</td>
                      <td className="p-4 text-red-400">{banco.saldoNegativo}</td>
                      <td className="p-4 font-bold">{banco.totalHoras}</td>
                      <td className="p-4">{banco.updatedAt}</td>
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
            <p className="text-purple-300 text-sm">Adicione movimentações de banco de horas por funcionário</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {filteredEmployees.map(employee => {
              // Encontrar saldo do funcionário
              const bancoFuncionario = bancoHoras.find(b => b.employeeId === employee.id);
              const saldoTotal = bancoFuncionario ? bancoFuncionario.totalHoras : '00:00';
              
              return (
                <div key={employee.id} className="bg-purple-800 bg-opacity-40 rounded-lg p-4">
                  <h3 className="font-bold text-lg">{employee.name}</h3>
                  <p className="text-purple-300">{employee.department}</p>
                  <p className="text-sm mb-2">{employee.email}</p>
                  
                  <div className="mb-4">
                    <p className="text-sm text-purple-300">Saldo Atual:</p>
                    <p className="text-xl font-bold">{saldoTotal}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => openMovimentacaoModal(employee)}
                      className="bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded text-sm"
                    >
                      Adicionar Movimentação
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* Modal para nova movimentação */}
      {showMovimentacaoModal && selectedEmployee && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Nova Movimentação para {selectedEmployee.name}</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Tipo de Movimentação</label>
              <select
                name="tipo"
                value={newMovimentacao.tipo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="crédito">Crédito</option>
                <option value="débito">Débito</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Horas (HH:MM)</label>
              <input 
                type="text" 
                name="horas"
                value={newMovimentacao.horas}
                onChange={handleInputChange}
                placeholder="Ex: 02:30"
                className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Data</label>
              <input 
                type="date" 
                name="data"
                value={newMovimentacao.data}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Motivo</label>
              <textarea 
                name="motivo"
                value={newMovimentacao.motivo}
                onChange={handleInputChange}
                className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-20"
                placeholder="Descreva o motivo da movimentação..."
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowMovimentacaoModal(false)}
                className="px-4 py-2 bg-purple-800 hover:bg-purple-700 rounded-md"
              >
                Cancelar
              </button>
              <button 
                onClick={createMovimentacao}
                disabled={!newMovimentacao.horas || !newMovimentacao.motivo}
                className={`px-4 py-2 rounded-md ${(newMovimentacao.horas && newMovimentacao.motivo) ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-900 opacity-50 cursor-not-allowed'}`}
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BancoHorasTab;