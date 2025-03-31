import React, { useState, useEffect } from 'react';

const JornadasTab = () => {
  // Estado para as jornadas de trabalho
  const [jornadas, setJornadas] = useState(() => {
    const storedJornadas = localStorage.getItem('jornadas');
    return storedJornadas ? JSON.parse(storedJornadas) : [
      {
        id: 1,
        nome: 'Padrão',
        descricao: 'Jornada padrão de 8 horas diárias',
        horaInicio: '08:00',
        horaFim: '17:00',
        intervaloInicio: '12:00',
        intervaloFim: '13:00',
        diasTrabalho: [1, 2, 3, 4, 5], // Segunda a sexta
        cargaHorariaSemanal: 40,
        toleranciaEntrada: 10, // minutos
        toleranciaSaida: 10, // minutos
        ativo: true
      },
      {
        id: 2,
        nome: 'Meio período - Manhã',
        descricao: 'Jornada de meio período matutino',
        horaInicio: '08:00',
        horaFim: '12:00',
        intervaloInicio: null,
        intervaloFim: null,
        diasTrabalho: [1, 2, 3, 4, 5], // Segunda a sexta
        cargaHorariaSemanal: 20,
        toleranciaEntrada: 10,
        toleranciaSaida: 10,
        ativo: true
      },
      {
        id: 3,
        nome: 'Meio período - Tarde',
        descricao: 'Jornada de meio período vespertino',
        horaInicio: '13:00',
        horaFim: '17:00',
        intervaloInicio: null,
        intervaloFim: null,
        diasTrabalho: [1, 2, 3, 4, 5], // Segunda a sexta
        cargaHorariaSemanal: 20,
        toleranciaEntrada: 10,
        toleranciaSaida: 10,
        ativo: true
      },
      {
        id: 4,
        nome: 'Escala 6x1',
        descricao: 'Trabalho de segunda a sábado',
        horaInicio: '08:00',
        horaFim: '16:20',
        intervaloInicio: '12:00',
        intervaloFim: '13:00',
        diasTrabalho: [1, 2, 3, 4, 5, 6], // Segunda a sábado
        cargaHorariaSemanal: 44,
        toleranciaEntrada: 10,
        toleranciaSaida: 10,
        ativo: true
      },
      {
        id: 5,
        nome: 'Escala 12x36',
        descricao: 'Trabalho 12 horas e folga 36 horas',
        horaInicio: '07:00',
        horaFim: '19:00',
        intervaloInicio: '12:00',
        intervaloFim: '13:00',
        diasTrabalho: [], // Escala especial
        cargaHorariaSemanal: 36,
        toleranciaEntrada: 15,
        toleranciaSaida: 15,
        ativo: true,
        escalaEspecial: true
      },
    ];
  });
  
  // Estado para nova jornada
  const [novaJornada, setNovaJornada] = useState({
    nome: '',
    descricao: '',
    horaInicio: '',
    horaFim: '',
    intervaloInicio: '',
    intervaloFim: '',
    diasTrabalho: [],
    cargaHorariaSemanal: 0,
    toleranciaEntrada: 10,
    toleranciaSaida: 10,
    ativo: true,
    escalaEspecial: false
  });
  
  // Estado para jornada em edição
  const [jornadaEmEdicao, setJornadaEmEdicao] = useState(null);
  
  // Estado para modal de confirmação de exclusão
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [jornadaParaExcluir, setJornadaParaExcluir] = useState(null);
  
  // Estado para modal de edição/criação
  const [modalJornadaAberto, setModalJornadaAberto] = useState(false);
  
  // Estado para funcionários por jornada
  const [funcionariosPorJornada, setFuncionariosPorJornada] = useState(() => {
    const storedFuncionarios = localStorage.getItem('funcionariosPorJornada');
    return storedFuncionarios ? JSON.parse(storedFuncionarios) : {
      1: ['João Silva', 'Maria Oliveira', 'Pedro Santos'],
      2: ['Ana Souza'],
      3: ['Carlos Pereira'],
      4: ['Fernanda Lima', 'Rafael Gomes'],
      5: ['Juliana Costa', 'Roberto Alves']
    };
  });
  
  // Novos estados para gerenciamento de funcionários
  const [modalGerenciarFuncionariosAberto, setModalGerenciarFuncionariosAberto] = useState(false);
  const [jornadaEmGestao, setJornadaEmGestao] = useState(null);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  
  // IMPORTANTE: Salvar jornadas no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('jornadas', JSON.stringify(jornadas));
  }, [jornadas]);
  
  // IMPORTANTE: Salvar funcionários por jornada no localStorage quando mudar
  useEffect(() => {
    localStorage.setItem('funcionariosPorJornada', JSON.stringify(funcionariosPorJornada));
  }, [funcionariosPorJornada]);
  
  // Função para abrir modal de criação de jornada
  const abrirModalCriarJornada = () => {
    setJornadaEmEdicao(null);
    setNovaJornada({
      nome: '',
      descricao: '',
      horaInicio: '',
      horaFim: '',
      intervaloInicio: '',
      intervaloFim: '',
      diasTrabalho: [],
      cargaHorariaSemanal: 0,
      toleranciaEntrada: 10,
      toleranciaSaida: 10,
      ativo: true,
      escalaEspecial: false
    });
    setModalJornadaAberto(true);
  };
  
  // Função para abrir modal de edição de jornada
  const abrirModalEditarJornada = (jornada) => {
    setJornadaEmEdicao(jornada.id);
    setNovaJornada({
      ...jornada,
      diasTrabalho: [...jornada.diasTrabalho]
    });
    setModalJornadaAberto(true);
  };
  
  // Função para abrir modal de gerenciamento de funcionários
  const abrirModalGerenciarFuncionarios = (jornada, funcionarioSelecionado = null) => {
    setJornadaEmGestao(jornada);
    setFuncionarioSelecionado(funcionarioSelecionado);
    setModalGerenciarFuncionariosAberto(true);
  };
  
  // Função para adicionar/remover funcionários da jornada
  const gerenciarFuncionarioNaJornada = (jornada, funcionario) => {
    const funcionariosAtuais = funcionariosPorJornada[jornada.id] || [];
    
    // Verificar se o funcionário já está associado a esta jornada
    const jaAssociado = funcionariosAtuais.includes(funcionario);
    
    let novosFuncionarios;
    if (jaAssociado) {
      // Remover funcionário
      novosFuncionarios = funcionariosAtuais.filter(f => f !== funcionario);
    } else {
      // Adicionar funcionário
      novosFuncionarios = [...funcionariosAtuais, funcionario];
    }
    
    // Atualizar o estado
    setFuncionariosPorJornada({
      ...funcionariosPorJornada,
      [jornada.id]: novosFuncionarios
    });
    
    // Opcional: fechar modal se estiver lidando com funcionário selecionado
    if (funcionarioSelecionado === funcionario) {
      setFuncionarioSelecionado(null);
    }
  };
  
  // Função para salvar jornada (criar ou editar)
  const salvarJornada = (e) => {
    e.preventDefault();
    
    if (!novaJornada.nome || !novaJornada.horaInicio || !novaJornada.horaFim) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }
    
    if (!novaJornada.escalaEspecial && novaJornada.diasTrabalho.length === 0) {
      alert('Por favor, selecione pelo menos um dia de trabalho.');
      return;
    }
    
    // Calcular carga horária diária
    const calcularHorasDiarias = () => {
      const inicio = novaJornada.horaInicio.split(':');
      const fim = novaJornada.horaFim.split(':');
      
      let horasInicio = parseInt(inicio[0]);
      let minutosInicio = parseInt(inicio[1]);
      let horasFim = parseInt(fim[0]);
      let minutosFim = parseInt(fim[1]);
      
      // Converter para minutos totais
      const inicioMinutos = horasInicio * 60 + minutosInicio;
      const fimMinutos = horasFim * 60 + minutosFim;
      
      // Calcular diferença em minutos
      let diferencaMinutos = fimMinutos - inicioMinutos;
      
      // Se fim < início, assumimos que passou da meia-noite
      if (diferencaMinutos < 0) {
        diferencaMinutos += 24 * 60;
      }
      
      // Subtrair intervalo se existir
      if (novaJornada.intervaloInicio && novaJornada.intervaloFim) {
        const inicioIntervalo = novaJornada.intervaloInicio.split(':');
        const fimIntervalo = novaJornada.intervaloFim.split(':');
        
        const intervaloInicio = parseInt(inicioIntervalo[0]) * 60 + parseInt(inicioIntervalo[1]);
        const intervaloFim = parseInt(fimIntervalo[0]) * 60 + parseInt(fimIntervalo[1]);
        
        diferencaMinutos -= (intervaloFim - intervaloInicio);
      }
      
      // Retornar horas em formato decimal
      return diferencaMinutos / 60;
    };
    
    const horasDiarias = calcularHorasDiarias();
    
    // Calcular carga horária semanal se não for escala especial
    const cargaHorariaSemanal = novaJornada.escalaEspecial 
      ? novaJornada.cargaHorariaSemanal 
      : Math.round(horasDiarias * novaJornada.diasTrabalho.length * 100) / 100;
    
    // Criar nova jornada ou atualizar existente
    if (jornadaEmEdicao) {
      // Atualizar jornada existente
      const jornadasAtualizadas = jornadas.map(j => 
        j.id === jornadaEmEdicao ? { ...novaJornada, cargaHorariaSemanal } : j
      );
      
      setJornadas(jornadasAtualizadas);
    } else {
      // Criar nova jornada
      const novaJornadaCompleta = {
        ...novaJornada,
        id: Date.now(),
        cargaHorariaSemanal
      };
      
      setJornadas([...jornadas, novaJornadaCompleta]);
      
      // Inicializar lista vazia de funcionários para esta jornada
      setFuncionariosPorJornada({
        ...funcionariosPorJornada,
        [novaJornadaCompleta.id]: []
      });
    }
    
    // Fechar modal
    setModalJornadaAberto(false);
    setJornadaEmEdicao(null);
  };
  
  // Função para alternar dia de trabalho
  const alternarDiaTrabalho = (dia) => {
    const diasAtuais = [...novaJornada.diasTrabalho];
    
    if (diasAtuais.includes(dia)) {
      // Remover dia
      const novosDias = diasAtuais.filter(d => d !== dia);
      setNovaJornada({ ...novaJornada, diasTrabalho: novosDias });
    } else {
      // Adicionar dia
      const novosDias = [...diasAtuais, dia].sort((a, b) => a - b);
      setNovaJornada({ ...novaJornada, diasTrabalho: novosDias });
    }
  };
  
  // Função para confirmar exclusão de jornada
  const confirmarExclusaoJornada = (jornada) => {
    setJornadaParaExcluir(jornada);
    setModalExclusaoAberto(true);
  };
  
  // Função para excluir jornada
  const excluirJornada = () => {
    if (!jornadaParaExcluir) return;
    
    // Verificar se há funcionários usando esta jornada
    if (funcionariosPorJornada[jornadaParaExcluir.id]?.length > 0) {
      alert('Não é possível excluir uma jornada com funcionários associados.');
      setModalExclusaoAberto(false);
      setJornadaParaExcluir(null);
      return;
    }
    
    const jornadasAtualizadas = jornadas.filter(j => j.id !== jornadaParaExcluir.id);
    setJornadas(jornadasAtualizadas);
    
    // Remover da lista de funcionários por jornada
    const novaFuncionariosPorJornada = { ...funcionariosPorJornada };
    delete novaFuncionariosPorJornada[jornadaParaExcluir.id];
    setFuncionariosPorJornada(novaFuncionariosPorJornada);
    
    setModalExclusaoAberto(false);
    setJornadaParaExcluir(null);
  };
  
  // Função para alternar status ativo da jornada
  const alternarStatusJornada = (id) => {
    const jornadasAtualizadas = jornadas.map(jornada =>
      jornada.id === id ? { ...jornada, ativo: !jornada.ativo } : jornada
    );
    
    setJornadas(jornadasAtualizadas);
  };
  
  // Função para renderizar os dias da semana
  const renderizarDiasTrabalho = (dias) => {
    const nomeDias = {
      0: 'Dom',
      1: 'Seg',
      2: 'Ter',
      3: 'Qua',
      4: 'Qui',
      5: 'Sex',
      6: 'Sáb'
    };
    
    if (dias.length === 0) return 'Escala especial';
    if (dias.length === 7) return 'Todos os dias';
    
    if (dias.length === 5 && dias.includes(1) && dias.includes(2) && 
        dias.includes(3) && dias.includes(4) && dias.includes(5)) {
      return 'Segunda a Sexta';
    }
    
    if (dias.length === 6 && dias.includes(1) && dias.includes(2) && 
        dias.includes(3) && dias.includes(4) && dias.includes(5) && dias.includes(6)) {
      return 'Segunda a Sábado';
    }
    
    return dias.map(dia => nomeDias[dia]).join(', ');
  };
  
  return (
    <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Jornadas de Trabalho</h1>
        <button 
          onClick={abrirModalCriarJornada}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nova Jornada
        </button>
      </div>
      
      {/* Lista de Jornadas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jornadas.map(jornada => (
          <div 
            key={jornada.id} 
            className={`bg-purple-900 bg-opacity-40 rounded-lg p-4 shadow ${!jornada.ativo ? 'opacity-70' : ''}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{jornada.nome}</h3>
              <div className="flex space-x-2">
                <button 
                  onClick={() => alternarStatusJornada(jornada.id)}
                  className={`p-1 rounded ${jornada.ativo ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'}`}
                  title={jornada.ativo ? 'Desativar Jornada' : 'Ativar Jornada'}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button 
                  onClick={() => abrirModalEditarJornada(jornada)}
                  className="bg-blue-600 hover:bg-blue-700 p-1 rounded"
                  title="Editar Jornada"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button 
                  onClick={() => confirmarExclusaoJornada(jornada)}
                  className="bg-red-600 hover:bg-red-700 p-1 rounded"
                  title="Excluir Jornada"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-purple-300 text-sm mb-3">{jornada.descricao}</p>
            
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
              <div>
                <span className="text-purple-300 text-xs">Horário:</span>
                <p>{jornada.horaInicio} - {jornada.horaFim}</p>
              </div>
              <div>
                <span className="text-purple-300 text-xs">Intervalo:</span>
                <p>
                  {jornada.intervaloInicio && jornada.intervaloFim 
                    ? `${jornada.intervaloInicio} - ${jornada.intervaloFim}` 
                    : 'Sem intervalo'}
                </p>
              </div>
              <div>
                <span className="text-purple-300 text-xs">Dias:</span>
                <p className="truncate" title={renderizarDiasTrabalho(jornada.diasTrabalho)}>
                  {renderizarDiasTrabalho(jornada.diasTrabalho)}
                </p>
              </div>
              <div>
                <span className="text-purple-300 text-xs">Carga Semanal:</span>
                <p>{jornada.cargaHorariaSemanal}h</p>
              </div>
              <div>
                <span className="text-purple-300 text-xs">Tolerância:</span>
                <p>{jornada.toleranciaEntrada}min / {jornada.toleranciaSaida}min</p>
              </div>
              <div>
                <span className="text-purple-300 text-xs">Status:</span>
                <p>
                  {jornada.ativo 
                    ? <span className="text-green-400">Ativa</span> 
                    : <span className="text-red-400">Inativa</span>}
                </p>
              </div>
            </div>
            
            {/* Funcionários nesta jornada - MODIFICADO */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-purple-300 text-xs">
                  Funcionários ({funcionariosPorJornada[jornada.id]?.length || 0}):
                </span>
                <button
                  onClick={() => abrirModalGerenciarFuncionarios(jornada)}
                  className="text-purple-300 hover:text-white text-xs underline"
                >
                  Gerenciar
                </button>
              </div>
              <div className="mt-1 flex flex-wrap gap-1">
                {funcionariosPorJornada[jornada.id]?.map((funcionario, index) => (
                  <span 
                    key={index} 
                    className="bg-purple-700 text-xs px-2 py-1 rounded-full"
                    title={funcionario}
                  >
                    {funcionario}
                  </span>
                ))}
                {(!funcionariosPorJornada[jornada.id] || funcionariosPorJornada[jornada.id].length === 0) && (
                  <span className="text-purple-400 text-xs">Nenhum funcionário atribuído</span>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {jornadas.length === 0 && (
          <div className="col-span-2 text-center py-8 text-purple-300">
            Nenhuma jornada de trabalho cadastrada. Clique em "Nova Jornada" para criar.
          </div>
        )}
      </div>
      
      {/* Modal de Edição/Criação de Jornada */}
      {modalJornadaAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-800 rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {jornadaEmEdicao ? 'Editar Jornada' : 'Nova Jornada'}
            </h3>
            
            <form onSubmit={salvarJornada}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="md:col-span-2">
                  <label className="block text-sm text-purple-300 mb-1">Nome *</label>
                  <input 
                    type="text" 
                    className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                    value={novaJornada.nome}
                    onChange={(e) => setNovaJornada({...novaJornada, nome: e.target.value})}
                    required
                    placeholder="Nome da jornada"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm text-purple-300 mb-1">Descrição</label>
                  <input 
                    type="text" 
                    className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                    value={novaJornada.descricao}
                    onChange={(e) => setNovaJornada({...novaJornada, descricao: e.target.value})}
                    placeholder="Descrição da jornada"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Hora Início *</label>
                  <input 
                    type="time" 
                    className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                    value={novaJornada.horaInicio}
                    onChange={(e) => setNovaJornada({...novaJornada, horaInicio: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Hora Fim *</label>
                  <input 
                    type="time" 
                    className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                    value={novaJornada.horaFim}
                    onChange={(e) => setNovaJornada({...novaJornada, horaFim: e.target.value})}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Intervalo Início</label>
                  <input 
                    type="time" 
                    className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                    value={novaJornada.intervaloInicio || ''}
                    onChange={(e) => setNovaJornada({...novaJornada, intervaloInicio: e.target.value || null})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Intervalo Fim</label>
                  <input 
                    type="time" 
                    className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                    value={novaJornada.intervaloFim || ''}
                    onChange={(e) => setNovaJornada({...novaJornada, intervaloFim: e.target.value || null})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Tolerância Entrada (min)</label>
                  <input 
                    type="number" 
                    className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                    value={novaJornada.toleranciaEntrada}
                    onChange={(e) => setNovaJornada({...novaJornada, toleranciaEntrada: parseInt(e.target.value) || 0})}
                    min="0"
                    max="60"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-purple-300 mb-1">Tolerância Saída (min)</label>
                  <input 
                    type="number" 
                    className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                    value={novaJornada.toleranciaSaida}
                    onChange={(e) => setNovaJornada({...novaJornada, toleranciaSaida: parseInt(e.target.value) || 0})}
                    min="0"
                    max="60"
                  />
                </div>
                
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="checkAtivo"
                    className="mr-2"
                    checked={novaJornada.ativo}
                    onChange={() => setNovaJornada({...novaJornada, ativo: !novaJornada.ativo})}
                  />
                  <label htmlFor="checkAtivo" className="text-sm">Jornada Ativa</label>
                </div>
                
                <div className="flex items-center">
                <input 
                    type="checkbox" 
                    id="checkEscalaEspecial"
                    className="mr-2"
                    checked={novaJornada.escalaEspecial}
                    onChange={() => setNovaJornada({...novaJornada, escalaEspecial: !novaJornada.escalaEspecial})}
                  />
                  <label htmlFor="checkEscalaEspecial" className="text-sm">Escala Especial</label>
                </div>
                
                {novaJornada.escalaEspecial && (
                  <div className="md:col-span-2">
                    <label className="block text-sm text-purple-300 mb-1">Carga Horária Semanal *</label>
                    <input 
                      type="number" 
                      className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
                      value={novaJornada.cargaHorariaSemanal}
                      onChange={(e) => setNovaJornada({...novaJornada, cargaHorariaSemanal: parseFloat(e.target.value) || 0})}
                      step="0.5"
                      min="0"
                      required={novaJornada.escalaEspecial}
                    />
                  </div>
                )}
                
                {!novaJornada.escalaEspecial && (
                  <div className="md:col-span-2">
                    <label className="block text-sm text-purple-300 mb-2">Dias de Trabalho *</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 0, nome: 'Dom' },
                        { id: 1, nome: 'Seg' },
                        { id: 2, nome: 'Ter' },
                        { id: 3, nome: 'Qua' },
                        { id: 4, nome: 'Qui' },
                        { id: 5, nome: 'Sex' },
                        { id: 6, nome: 'Sáb' }
                      ].map(dia => (
                        <button
                          key={dia.id}
                          type="button"
                          className={`px-3 py-1 rounded-full text-sm ${
                            novaJornada.diasTrabalho.includes(dia.id)
                              ? 'bg-purple-600 hover:bg-purple-700'
                              : 'bg-purple-900 hover:bg-purple-800'
                          }`}
                          onClick={() => alternarDiaTrabalho(dia.id)}
                        >
                          {dia.nome}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2 mt-4">
                <button 
                  type="button"
                  onClick={() => setModalJornadaAberto(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
                >
                  {jornadaEmEdicao ? 'Atualizar' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Modal de Confirmação de Exclusão */}
      {modalExclusaoAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Confirmar Exclusão</h3>
            <p className="mb-6">
              Tem certeza que deseja excluir a jornada <strong>{jornadaParaExcluir?.nome}</strong>?
              {funcionariosPorJornada[jornadaParaExcluir?.id]?.length > 0 && (
                <span className="block text-red-400 mt-2">
                  Atenção: Esta jornada possui {funcionariosPorJornada[jornadaParaExcluir?.id]?.length} funcionários associados. 
                  É necessário remover os funcionários antes de excluir.
                </span>
              )}
            </p>
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => setModalExclusaoAberto(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded"
              >
                Cancelar
              </button>
              <button 
                onClick={excluirJornada}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded"
                disabled={funcionariosPorJornada[jornadaParaExcluir?.id]?.length > 0}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Gerenciamento de Funcionários */}
      {modalGerenciarFuncionariosAberto && jornadaEmGestao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-800 rounded-lg shadow-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              Gerenciar Funcionários - {jornadaEmGestao.nome}
            </h3>
            
            {/* Lista de todos os funcionários */}
            <div className="mb-6">
              <h4 className="text-lg mb-2">Funcionários Disponíveis</h4>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-purple-900 bg-opacity-50 rounded">
                {Object.values(funcionariosPorJornada)
                  .flat()
                  .filter((f, i, arr) => arr.indexOf(f) === i) // Remover duplicados
                  .sort()
                  .map((funcionario, index) => {
                    const estaNaJornada = funcionariosPorJornada[jornadaEmGestao.id]?.includes(funcionario);
                    return (
                      <div 
                        key={index}
                        className={`p-2 rounded cursor-pointer ${
                          estaNaJornada ? 'bg-purple-600' : 'bg-purple-900 hover:bg-purple-700'
                        }`}
                        onClick={() => gerenciarFuncionarioNaJornada(jornadaEmGestao, funcionario)}
                      >
                        <span className="text-sm">{funcionario}</span>
                        {estaNaJornada && (
                          <span className="ml-2 text-green-400">✓</span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
            
            {/* Adicionar novo funcionário */}
            <div className="mb-6">
              <h4 className="text-lg mb-2">Adicionar Novo Funcionário</h4>
              <div className="flex">
                <input 
                  type="text" 
                  className="flex-1 bg-purple-700 border border-purple-600 rounded-l-md p-2 text-white"
                  placeholder="Nome do funcionário"
                  value={funcionarioSelecionado || ''}
                  onChange={(e) => setFuncionarioSelecionado(e.target.value)}
                />
                <button 
                  className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-r-md"
                  onClick={() => {
                    if (funcionarioSelecionado && funcionarioSelecionado.trim()) {
                      gerenciarFuncionarioNaJornada(jornadaEmGestao, funcionarioSelecionado.trim());
                      setFuncionarioSelecionado('');
                    }
                  }}
                >
                  Adicionar
                </button>
              </div>
            </div>
            
            {/* Funcionários na jornada */}
            <div className="mb-6">
              <h4 className="text-lg mb-2">
                Funcionários nesta Jornada ({funcionariosPorJornada[jornadaEmGestao.id]?.length || 0})
              </h4>
              <div className="max-h-40 overflow-y-auto p-2 bg-purple-900 bg-opacity-50 rounded">
                {funcionariosPorJornada[jornadaEmGestao.id]?.length > 0 ? (
                  funcionariosPorJornada[jornadaEmGestao.id].map((funcionario, index) => (
                    <div 
                      key={index}
                      className="flex justify-between items-center p-2 rounded mb-1 bg-purple-700"
                    >
                      <span className="text-sm">{funcionario}</span>
                      <button 
                        className="text-red-400 hover:text-red-300"
                        onClick={() => gerenciarFuncionarioNaJornada(jornadaEmGestao, funcionario)}
                      >
                        Remover
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-purple-400 text-sm p-2">Nenhum funcionário atribuído</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button 
                onClick={() => {
                  setModalGerenciarFuncionariosAberto(false);
                  setJornadaEmGestao(null);
                  setFuncionarioSelecionado(null);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JornadasTab;