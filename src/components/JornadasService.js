// Serviço para gerenciar jornadas de trabalho
const JornadasService = {
  // Obter todas as jornadas
  getTodasJornadas: () => {
    const storedJornadas = localStorage.getItem('jornadas');
    if (storedJornadas) {
      return JSON.parse(storedJornadas);
    }
    
    // Dados iniciais se não houver no localStorage
    const jornadasIniciais = [
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
      }
    ];
    
    localStorage.setItem('jornadas', JSON.stringify(jornadasIniciais));
    return jornadasIniciais;
  },
  
  // Criar nova jornada
  criarJornada: (jornada) => {
    const jornadas = JornadasService.getTodasJornadas();
    
    // Gerar ID único baseado no timestamp
    const novaJornada = {
      ...jornada,
      id: Date.now()
    };
    
    const jornadasAtualizadas = [...jornadas, novaJornada];
    localStorage.setItem('jornadas', JSON.stringify(jornadasAtualizadas));
    
    return novaJornada;
  },
  
  // Atualizar jornada existente
  atualizarJornada: (jornada) => {
    const jornadas = JornadasService.getTodasJornadas();
    
    const jornadasAtualizadas = jornadas.map(j => 
      j.id === jornada.id ? jornada : j
    );
    
    localStorage.setItem('jornadas', JSON.stringify(jornadasAtualizadas));
    
    return jornada;
  },
  
  // Excluir jornada
  excluirJornada: (jornadaId) => {
    const jornadas = JornadasService.getTodasJornadas();
    
    const jornadasAtualizadas = jornadas.filter(j => j.id !== jornadaId);
    localStorage.setItem('jornadas', JSON.stringify(jornadasAtualizadas));
    
    return jornadasAtualizadas;
  },
  
  // Ativar/desativar jornada
  alternarStatusJornada: (jornadaId) => {
    const jornadas = JornadasService.getTodasJornadas();
    
    const jornadasAtualizadas = jornadas.map(jornada => {
      if (jornada.id === jornadaId) {
        return { ...jornada, ativo: !jornada.ativo };
      }
      return jornada;
    });
    
    localStorage.setItem('jornadas', JSON.stringify(jornadasAtualizadas));
    
    return jornadasAtualizadas;
  },
  
  // Obter jornada pelo ID
  getJornadaPorId: (jornadaId) => {
    const jornadas = JornadasService.getTodasJornadas();
    return jornadas.find(j => j.id === jornadaId);
  },
  
  // Verificar se jornada tem funcionários
  jornadaTemFuncionarios: (jornadaId) => {
    const funcionariosPorJornada = JSON.parse(localStorage.getItem('funcionariosPorJornada') || '{}');
    return funcionariosPorJornada[jornadaId] && funcionariosPorJornada[jornadaId].length > 0;
  },
  
  // Formatar dias de trabalho para exibição amigável
  formatarDiasTrabalho: (dias) => {
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
  },
  
  // Calcular carga horária diária
  calcularHorasDiarias: (jornada) => {
    const inicio = jornada.horaInicio.split(':');
    const fim = jornada.horaFim.split(':');
    
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
    if (jornada.intervaloInicio && jornada.intervaloFim) {
      const inicioIntervalo = jornada.intervaloInicio.split(':');
      const fimIntervalo = jornada.intervaloFim.split(':');
      
      const intervaloInicio = parseInt(inicioIntervalo[0]) * 60 + parseInt(inicioIntervalo[1]);
      const intervaloFim = parseInt(fimIntervalo[0]) * 60 + parseInt(fimIntervalo[1]);
      
      diferencaMinutos -= (intervaloFim - intervaloInicio);
    }
    
    // Retornar horas em formato decimal
    return diferencaMinutos / 60;
  },
  
  // Calcular carga horária semanal
  calcularCargaHorariaSemanal: (jornada) => {
    if (jornada.escalaEspecial) {
      return jornada.cargaHorariaSemanal;
    }
    
    const horasDiarias = JornadasService.calcularHorasDiarias(jornada);
    return Math.round(horasDiarias * jornada.diasTrabalho.length * 100) / 100;
  },
  
  // Verificar se o dia atual é dia de trabalho para a jornada
  ehDiaDeTrabalho: (jornada) => {
    if (jornada.escalaEspecial) {
      // Para escalas especiais, seria necessário um algoritmo específico
      // Vamos assumir que sim para simplificar
      return true;
    }
    
    const hoje = new Date().getDay(); // 0-6 (Domingo-Sábado)
    return jornada.diasTrabalho.includes(hoje);
  },
  
  // Verificar tolerância de entrada
  verificarToleranciaEntrada: (jornada, horario = new Date()) => {
    if (!jornada.ativo) return false;
    
    const [horaJornada, minutoJornada] = jornada.horaInicio.split(':').map(Number);
    
    // Criar data com horário de início da jornada
    const horaInicio = new Date();
    horaInicio.setHours(horaJornada, minutoJornada, 0, 0);
    
    // Adicionar tolerância
    const horaLimite = new Date(horaInicio);
    horaLimite.setMinutes(horaLimite.getMinutes() + jornada.toleranciaEntrada);
    
    // Verificar se o horário está dentro da tolerância
    return horario <= horaLimite;
  },
  
  // Verificar tolerância de saída
  verificarToleranciaSaida: (jornada, horario = new Date()) => {
    if (!jornada.ativo) return false;
    
    const [horaJornada, minutoJornada] = jornada.horaFim.split(':').map(Number);
    
    // Criar data com horário de fim da jornada
    const horaFim = new Date();
    horaFim.setHours(horaJornada, minutoJornada, 0, 0);
    
    // Subtrair tolerância
    const horaLimite = new Date(horaFim);
    horaLimite.setMinutes(horaLimite.getMinutes() - jornada.toleranciaSaida);
    
    // Verificar se o horário está dentro da tolerância
    return horario >= horaLimite;
  }
};

export default JornadasService;