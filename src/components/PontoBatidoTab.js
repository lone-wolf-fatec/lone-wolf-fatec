import React, { useState, useEffect, useRef } from 'react';

const PontoBatidoTab = () => {
  // Constantes para status
  const STATUS_APROVADO = 'aprovado';
  const STATUS_REJEITADO = 'rejeitado';
  const STATUS_PENDENTE = 'pendente';
  const STATUS_AJUSTADO = 'ajustado';
  const FUNCIONARIOS_KEY = 'funcionarios';
  
  // Estados
  const [pontoRegistros, setPontoRegistros] = useState(() => {
    const storedRegistros = localStorage.getItem('pontoRegistros');
    const registrosBase = storedRegistros ? JSON.parse(storedRegistros) : [
      {
        id: 1,
        funcionarioId: 101,
        funcionarioNome: 'João Silva',
        data: '19/03/2025',
        registros: [
          { tipo: 'entrada', hora: '08:05', status: 'regular' },
          { tipo: 'saída', hora: '12:00', status: 'regular' },
          { tipo: 'entrada', hora: '13:10', status: 'regular' },
          { tipo: 'saída', hora: '--:--', status: STATUS_PENDENTE }
        ]
      },
      {
        id: 2,
        funcionarioId: 102,
        funcionarioNome: 'Maria Oliveira',
        data: '19/03/2025',
        registros: [
          { tipo: 'entrada', hora: '08:15', status: 'atrasado' },
          { tipo: 'saída', hora: '12:05', status: 'regular' },
          { tipo: 'entrada', hora: '13:00', status: 'regular' },
          { tipo: 'saída', hora: '17:10', status: 'regular' }
        ]
      },
      {
        id: 3,
        funcionarioId: 103,
        funcionarioNome: 'Carlos Pereira',
        data: '19/03/2025',
        registros: [
          { tipo: 'entrada', hora: '09:20', status: 'atrasado' },
          { tipo: 'saída', hora: '12:15', status: 'regular' },
          { tipo: 'entrada', hora: '13:10', status: 'regular' },
          { tipo: 'saída', hora: '18:35', status: 'hora extra' }
        ]
      },
      {
        id: 4,
        funcionarioId: 104,
        funcionarioNome: 'Ana Souza',
        data: '19/03/2025',
        registros: [
          { tipo: 'entrada', hora: '--:--', status: STATUS_PENDENTE },
          { tipo: 'saída', hora: '--:--', status: STATUS_PENDENTE },
          { tipo: 'entrada', hora: '--:--', status: STATUS_PENDENTE },
          { tipo: 'saída', hora: '--:--', status: STATUS_PENDENTE }
        ]
      },
      {
        id: 5,
        funcionarioId: 101,
        funcionarioNome: 'João Silva',
        data: '18/03/2025',
        registros: [
          { tipo: 'entrada', hora: '08:00', status: 'regular' },
          { tipo: 'saída', hora: '12:00', status: 'regular' },
          { tipo: 'entrada', hora: '13:00', status: 'regular' },
          { tipo: 'saída', hora: '17:05', status: 'regular' }
        ]
      },
      {
        id: 6,
        funcionarioId: 102,
        funcionarioNome: 'Maria Oliveira',
        data: '18/03/2025',
        registros: [
          { tipo: 'entrada', hora: '08:10', status: 'regular' },
          { tipo: 'saída', hora: '12:00', status: 'regular' },
          { tipo: 'entrada', hora: '13:05', status: 'regular' },
          { tipo: 'saída', hora: '17:00', status: 'regular' }
        ]
      }
    ];
    
    // Restaurar status salvos em chaves individuais
    return registrosBase.map(registro => {
      const registrosAtualizados = registro.registros.map((r, indice) => {
        const statusKey = `pontoStatus_${registro.id}_${indice}`;
        const statusSalvo = localStorage.getItem(statusKey);
        
        // Se houver um status salvo separadamente, usá-lo
        if (statusSalvo) {
          return { ...r, status: statusSalvo };
        }
        
        // Converter "falta" para "pendente" se necessário
        if (r.status === 'falta') {
          return { ...r, status: STATUS_PENDENTE };
        }
        
        return r;
      });
      
      return { ...registro, registros: registrosAtualizados };
    });
  });

  const [filtros, setFiltros] = useState({
    data: '',
    funcionario: '',
    status: ''
  });

  const [allFuncionarios, setAllFuncionarios] = useState([]);
  const [editandoRegistro, setEditandoRegistro] = useState(null);
  const horaInputRefs = useRef({});
  
  // Funções auxiliares
  const getAllPossibleFuncionarios = () => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const funcionariosFromUsers = registeredUsers.map(user => ({
        id: user.id,
        nome: user.name || user.nome
      }));
      
      const storedFuncionarios = JSON.parse(localStorage.getItem(FUNCIONARIOS_KEY) || '[]');
      
      const funcionariosFromRegistros = pontoRegistros.map(registro => ({
        id: registro.funcionarioId,
        nome: registro.funcionarioNome
      }));

      const funcionariosMap = new Map();
      
      [...funcionariosFromUsers, ...storedFuncionarios, ...funcionariosFromRegistros]
        .forEach(func => {
          if (func && func.id) {
            funcionariosMap.set(func.id, func);
          }
        });

      return Array.from(funcionariosMap.values());
    } catch (error) {
      console.error('Erro ao obter funcionários de todas as fontes:', error);
      return [];
    }
  };

  const getLatestFuncionarios = () => {
    try {
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const funcionariosStorage = JSON.parse(localStorage.getItem(FUNCIONARIOS_KEY) || '[]');
      const userStorage = JSON.parse(localStorage.getItem('user') || '{}');

      const funcionariosFromUsers = registeredUsers.map(user => ({
        id: user.id,
        nome: user.name || user.nome
      }));

      const funcionariosFromRegistros = pontoRegistros.map(registro => ({
        id: registro.funcionarioId,
        nome: registro.funcionarioNome
      }));

      const allFuncionarios = [...funcionariosStorage];
      
      [...funcionariosFromUsers, ...funcionariosFromRegistros].forEach(func => {
        if (!allFuncionarios.some(f => f.id === func.id)) {
          allFuncionarios.push(func);
        }
      });

      if (userStorage && userStorage.id && userStorage.name) {
        if (!allFuncionarios.some(f => f.id === userStorage.id)) {
          allFuncionarios.push({
            id: userStorage.id,
            nome: userStorage.name
          });
        }
      }

      localStorage.setItem(FUNCIONARIOS_KEY, JSON.stringify(allFuncionarios));
      return allFuncionarios;
    } catch (error) {
      console.error("Erro ao buscar funcionários:", error);
      return [];
    }
  };

  // Função simplificada para salvar status de forma consistente
  const salvarStatus = (registroId, indice, novoStatus, novaHora = null) => {
    // 1. Salvar na chave individualizada no localStorage
    const statusKey = `pontoStatus_${registroId}_${indice}`;
    localStorage.setItem(statusKey, novoStatus);
    
    // 2. Atualizar o estado local
    const novosRegistros = pontoRegistros.map(registro => {
      if (registro.id === registroId) {
        const novosRegistrosInternos = registro.registros.map((r, idx) => {
          if (idx === indice) {
            return { 
              ...r, 
              status: novoStatus,
              hora: novaHora !== null ? novaHora : r.hora 
            };
          }
          return r;
        });
        
        return { ...registro, registros: novosRegistrosInternos };
      }
      return registro;
    });
    
    // 3. Atualizar o estado e o localStorage
    setPontoRegistros(novosRegistros);
    localStorage.setItem('pontoRegistros', JSON.stringify(novosRegistros));
    
    // 4. Adicionar notificação para o funcionário
    const registro = pontoRegistros.find(r => r.id === registroId);
    if (registro) {
      const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
      notificacoes.push({
        id: Date.now(),
        userId: registro.funcionarioId,
        message: `Seu registro de ponto do dia ${registro.data} foi ${novoStatus} pelo administrador.`,
        date: new Date().toLocaleDateString('pt-BR'),
        read: false
      });
      localStorage.setItem('userNotifications', JSON.stringify(notificacoes));
      
      // 5. Mostrar confirmação
      alert(`Ponto atualizado para ${registro.funcionarioNome} em ${registro.data}.`);
    }
  };

  const adicionarRegistrosParaTodosFuncionarios = (funcionarios) => {
    if (!funcionarios || funcionarios.length === 0) return;
    
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const todasDatas = [...new Set(pontoRegistros.map(registro => registro.data))];
    let nextId = Math.max(...pontoRegistros.map(registro => registro.id), 0) + 1;
    
    // Criar uma cópia para não modificar o estado diretamente
    const novosRegistros = [...pontoRegistros];
    
    // Mapear registros existentes para evitar duplicação
    const registrosExistentes = new Map();
    pontoRegistros.forEach(registro => {
      const chave = `${registro.funcionarioId}-${registro.data}`;
      registrosExistentes.set(chave, registro.id);
    });
    
    // Para cada funcionário, verificar e adicionar registros faltantes
    let adicionados = false;
    
    funcionarios.forEach(funcionario => {
      // Para datas existentes
      todasDatas.forEach(data => {
        const chave = `${funcionario.id}-${data}`;
        if (!registrosExistentes.has(chave)) {
          novosRegistros.push({
            id: nextId++,
            funcionarioId: funcionario.id,
            funcionarioNome: funcionario.nome,
            data: data,
            registros: [
              { tipo: 'entrada', hora: '--:--', status: STATUS_PENDENTE },
              { tipo: 'saída', hora: '--:--', status: STATUS_PENDENTE },
              { tipo: 'entrada', hora: '--:--', status: STATUS_PENDENTE },
              { tipo: 'saída', hora: '--:--', status: STATUS_PENDENTE }
            ]
          });
          registrosExistentes.set(chave, nextId - 1);
          adicionados = true;
        }
      });
      
      // Para a data atual, se necessário
      if (!todasDatas.includes(dataAtual)) {
        const chave = `${funcionario.id}-${dataAtual}`;
        if (!registrosExistentes.has(chave)) {
          novosRegistros.push({
            id: nextId++,
            funcionarioId: funcionario.id,
            funcionarioNome: funcionario.nome,
            data: dataAtual,
            registros: [
              { tipo: 'entrada', hora: '--:--', status: STATUS_PENDENTE },
              { tipo: 'saída', hora: '--:--', status: STATUS_PENDENTE },
              { tipo: 'entrada', hora: '--:--', status: STATUS_PENDENTE },
              { tipo: 'saída', hora: '--:--', status: STATUS_PENDENTE }
            ]
          });
          registrosExistentes.set(chave, nextId - 1);
          adicionados = true;
        }
      }
    });
    
    // Só atualizar o estado se algo foi adicionado
    if (adicionados) {
      // Restaurar status salvos para os novos registros
      const registrosAtualizados = novosRegistros.map(registro => {
        const registrosComStatus = registro.registros.map((r, indice) => {
          const statusKey = `pontoStatus_${registro.id}_${indice}`;
          const statusSalvo = localStorage.getItem(statusKey);
          
          if (statusSalvo) {
            return { ...r, status: statusSalvo };
          }
          return r;
        });
        
        return { ...registro, registros: registrosComStatus };
      });
      
      setPontoRegistros(registrosAtualizados);
      localStorage.setItem('pontoRegistros', JSON.stringify(registrosAtualizados));
    }
  };

  const marcarFaltaJustificada = (registroId) => {
    const registro = pontoRegistros.find(r => r.id === registroId);
    if (!registro) return;
    
    let mudancas = false;
    
    // Atualizar todos os registros com status pendente
    const novosRegistros = pontoRegistros.map(r => {
      if (r.id === registroId) {
        const registrosAtualizados = r.registros.map((reg, idx) => {
          if (reg.status === STATUS_PENDENTE || reg.status === 'falta') {
            // Salvar na chave individualizada
            const statusKey = `pontoStatus_${registroId}_${idx}`;
            localStorage.setItem(statusKey, 'falta justificada');
            mudancas = true;
            return { ...reg, status: 'falta justificada' };
          }
          return reg;
        });
        
        return { ...r, registros: registrosAtualizados };
      }
      return r;
    });
    
    if (mudancas) {
      setPontoRegistros(novosRegistros);
      localStorage.setItem('pontoRegistros', JSON.stringify(novosRegistros));
      alert(`Falta justificada registrada para ${registro.funcionarioNome} em ${registro.data}.`);
    }
  };

  const notificarFuncionario = (funcionarioId, funcionarioNome) => {
    const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    notificacoes.push({
      id: Date.now(),
      userId: funcionarioId,
      message: 'Por favor, registre seu ponto pendente do dia de hoje.',
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    });
    localStorage.setItem('userNotifications', JSON.stringify(notificacoes));
    alert(`Notificação enviada para ${funcionarioNome} sobre ponto pendente.`);
  };

  const iniciarEdicaoPonto = (registroId, indiceRegistro) => {
    setEditandoRegistro({ registroId, indiceRegistro });
    setTimeout(() => {
      if (horaInputRefs.current[`${registroId}-${indiceRegistro}`]) {
        horaInputRefs.current[`${registroId}-${indiceRegistro}`].focus();
      }
    }, 100);
  };

  const salvarEdicaoPonto = (registroId, indiceRegistro, statusSelecionado = STATUS_AJUSTADO) => {
    const inputRef = horaInputRefs.current[`${registroId}-${indiceRegistro}`];
    if (inputRef && inputRef.value) {
      salvarStatus(registroId, indiceRegistro, statusSelecionado, inputRef.value);
    }
    setEditandoRegistro(null);
  };

  const cancelarEdicaoPonto = () => {
    setEditandoRegistro(null);
  };

  const renderizarStatus = (status) => {
    let corClasse = '';
    let texto = status.toUpperCase();
    switch(status) {
      case 'regular':
        corClasse = 'bg-green-600';
        break;
      case 'atrasado':
        corClasse = 'bg-yellow-600';
        break;
      case 'hora extra':
        corClasse = 'bg-blue-600';
        break;
      case STATUS_PENDENTE:
      case 'falta':
        corClasse = 'bg-purple-600';
        texto = 'PENDENTE';
        break;
      case 'falta justificada':
        corClasse = 'bg-orange-600';
        texto = 'JUSTIFICADA';
        break;
      case STATUS_AJUSTADO:
        corClasse = 'bg-indigo-600';
        break;
      case STATUS_APROVADO:
        corClasse = 'bg-green-700';
        break;
      case STATUS_REJEITADO:
        corClasse = 'bg-red-700';
        break;
      default:
        corClasse = 'bg-gray-600';
    }
    return (
      <span className={`inline-block px-2 py-1 rounded-full text-xs ${corClasse}`}>
        {texto}
      </span>
    );
  };
  
  // Inicialização e carregamento de dados
  useEffect(() => {
    // Carregar funcionários e atualizar registros
    const funcionarios = getLatestFuncionarios();
    setAllFuncionarios(funcionarios);
    adicionarRegistrosParaTodosFuncionarios(funcionarios);
    
    // Timer para atualizar a lista de funcionários periodicamente
    const interval = setInterval(() => {
      const updatedFuncionarios = getLatestFuncionarios();
      // Só atualizar se a lista mudou
      if (JSON.stringify(updatedFuncionarios) !== JSON.stringify(allFuncionarios)) {
        setAllFuncionarios(updatedFuncionarios);
        adicionarRegistrosParaTodosFuncionarios(updatedFuncionarios);
      }
    }, 15000); // Reduzido para evitar conflitos
    
    // Event listener para mudanças no localStorage
    const handleStorageChange = (e) => {
      // Reagir a mudanças em funcionários
      if (e.key === FUNCIONARIOS_KEY || e.key === 'registeredUsers' || e.key === 'user') {
        const updatedFuncionarios = getAllPossibleFuncionarios();
        setAllFuncionarios(updatedFuncionarios);
        adicionarRegistrosParaTodosFuncionarios(updatedFuncionarios);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Executar apenas na montagem do componente

  // Persistir mudanças no estado
  useEffect(() => {
    localStorage.setItem('pontoRegistros', JSON.stringify(pontoRegistros));
  }, [pontoRegistros]);

  // Listas e filtros
  const funcionarios = [
    ...new Set([
      ...allFuncionarios.map(f => f.nome),
      ...pontoRegistros.map(registro => registro.funcionarioNome)
    ])
  ].filter(Boolean).sort();

  const datas = [...new Set(pontoRegistros.map(registro => registro.data))];

  const registrosFiltrados = pontoRegistros.filter(registro => {
    return (
      (filtros.data === '' || registro.data === filtros.data) &&
      (filtros.funcionario === '' || registro.funcionarioNome === filtros.funcionario) &&
      (filtros.status === '' || registro.registros.some(r => r.status === filtros.status))
    );
  });

  const registrosOrdenados = [...registrosFiltrados].sort((a, b) => {
    const [diaA, mesA, anoA] = a.data.split('/').map(Number);
    const [diaB, mesB, anoB] = b.data.split('/').map(Number);
    const dateA = new Date(anoA, mesA - 1, diaA);
    const dateB = new Date(anoB, mesB - 1, diaB);
    return dateB - dateA;
  });

  // Início do JSX
  return (
    <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Registros de Ponto</h1>
      
      {/* Botão para forçar atualização da lista */}
      <div className="mb-4">
        <button
          onClick={() => {
            const latestFuncionarios = getLatestFuncionarios();
            setAllFuncionarios(latestFuncionarios);
            adicionarRegistrosParaTodosFuncionarios(latestFuncionarios);
            alert(`Lista atualizada! ${latestFuncionarios.length} funcionários encontrados.`);
          }}
          className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-md text-sm"
        >
          Atualizar Lista de Funcionários ({allFuncionarios.length})
        </button>
        <div className="text-xs text-purple-300 mt-1">
          Lista atualizada em: {new Date().toLocaleTimeString()}
        </div>
      </div>
      
      {/* Botões de ação */}
      <div className="mt-6 flex flex-wrap gap-4">
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Exportar Relatório
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notificar Todos com Pendências
        </button>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Gerar Espelho de Ponto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-purple-900 bg-opacity-40 rounded-lg p-4 mb-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm text-purple-300 mb-1">Data</label>
            <select
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              value={filtros.data}
              onChange={(e) => setFiltros({...filtros, data: e.target.value})}
            >
              <option value="">Todas as datas</option>
              {datas.map((data, index) => (
                <option key={index} value={data}>{data}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-purple-300 mb-1">
              Funcionário ({funcionarios.length} disponíveis)
            </label>
            <select
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              value={filtros.funcionario}
              onChange={(e) => setFiltros({...filtros, funcionario: e.target.value})}
            >
              <option value="">Todos os funcionários</option>
              {funcionarios.map((funcionario, index) => (
                <option key={index} value={funcionario}>{funcionario}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-purple-300 mb-1">Status</label>
            <select
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              value={filtros.status}
              onChange={(e) => setFiltros({...filtros, status: e.target.value})}
            >
              <option value="">Todos os status</option>
              <option value="regular">Regular</option>
              <option value="atrasado">Atrasado</option>
              <option value="hora extra">Hora Extra</option>
              <option value={STATUS_PENDENTE}>Pendente</option>
              <option value="falta justificada">Falta Justificada</option>
              <option value={STATUS_AJUSTADO}>Ajustado</option>
              <option value={STATUS_APROVADO}>Aprovado</option>
              <option value={STATUS_REJEITADO}>Rejeitado</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Tabela de Registros */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-purple-300 text-sm border-b border-purple-700">
              <th className="px-4 py-2 text-left">Funcionário</th>
              <th className="px-4 py-2 text-left">Data</th>
              <th className="px-4 py-2 text-left">Entrada 1</th>
              <th className="px-4 py-2 text-left">Saída 1</th>
              <th className="px-4 py-2 text-left">Entrada 2</th>
              <th className="px-4 py-2 text-left">Saída 2</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {registrosOrdenados.map((registro) => (
              <tr key={registro.id} className="border-b border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                <td className="px-4 py-3">{registro.funcionarioNome}</td>
                <td className="px-4 py-3">{registro.data}</td>
                {registro.registros.map((r, index) => (
                  <td key={index} className="px-4 py-3">
                    {editandoRegistro && editandoRegistro.registroId === registro.id && editandoRegistro.indiceRegistro === index ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="time"
                          defaultValue={r.hora !== '--:--' ? r.hora : ''}
                          className="bg-purple-800 border border-purple-600 rounded-md p-1 text-white w-24"
                          ref={el => horaInputRefs.current[`${registro.id}-${index}`] = el}
                        />
                        <div className="flex space-x-1">
                          <button
                            onClick={() => salvarEdicaoPonto(registro.id, index, STATUS_APROVADO)}
                            className="text-green-500 hover:text-green-400"
                            title="Aprovar registro"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                          <button
                            onClick={() => salvarEdicaoPonto(registro.id, index, STATUS_REJEITADO)}
                            className="text-red-500 hover:text-red-400"
                            title="Rejeitar registro"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                          <button
                            onClick={() => salvarEdicaoPonto(registro.id, index, STATUS_AJUSTADO)}
                            className="text-blue-500 hover:text-blue-400"
                            title="Ajustar registro"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={cancelarEdicaoPonto}
                            className="text-gray-400 hover:text-white"
                            title="Cancelar"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className={r.status === STATUS_PENDENTE || r.status === 'falta' ? 'text-red-400' : ''}>
                          {r.hora}
                        </span>
                        <div className="ml-2">{renderizarStatus(r.status)}</div>
                        <button
                          onClick={() => iniciarEdicaoPonto(registro.id, index)}
                          className="text-purple-300 hover:text-white ml-auto"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </td>
                ))}
                <td className="px-4 py-3">
                  <div className="flex space-x-2 items-center">
                    {registro.registros.some(r => r.status === STATUS_PENDENTE) && (
                      <button
                        onClick={() => notificarFuncionario(registro.funcionarioId, registro.funcionarioNome)}
                        className="bg-purple-600 hover:bg-purple-700 text-white rounded p-1 text-xs flex items-center"
                        title="Notificar funcionário"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Notificar
                      </button>
                    )}
                    {registro.registros.some(r => r.status === STATUS_PENDENTE) && (
                      <button
                        onClick={() => marcarFaltaJustificada(registro.id)}
                        className="bg-orange-600 hover:bg-orange-700 text-white rounded p-1 text-xs flex items-center"
                        title="Marcar falta como justificada"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Justificar
                      </button>
                    )}
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded p-1 text-xs flex items-center"
                      title="Exportar registro"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      Exportar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {registrosOrdenados.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-purple-300">
                  Nenhum registro encontrado com os filtros selecionados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PontoBatidoTab;