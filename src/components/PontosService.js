// Serviço para registrar e gerenciar registros de ponto
import FuncionariosService from './FuncionariosService';
import JornadasService from './JornadasService';

const PontoService = {
  // Obter todos os registros de ponto
  getTodosRegistros: () => {
    const storedRegistros = localStorage.getItem('registrosPonto');
    return storedRegistros ? JSON.parse(storedRegistros) : [];
  },
  
  // Registrar novo ponto (entrada ou saída)
  registrarPonto: (funcionarioId, tipo) => {
    const dataHora = new Date();
    const funcionario = FuncionariosService.getTodosFuncionarios().find(f => f.id === funcionarioId);
    
    if (!funcionario) {
      throw new Error('Funcionário não encontrado');
    }
    
    // Buscar a jornada do funcionário
    const funcionariosPorJornada = FuncionariosService.getFuncionariosPorJornada();
    let jornadaId = null;
    
    for (const [id, funcionarios] of Object.entries(funcionariosPorJornada)) {
      if (funcionarios.includes(funcionario.nome)) {
        jornadaId = parseInt(id);
        break;
      }
    }
    
    if (!jornadaId) {
      throw new Error('Funcionário não está atribuído a nenhuma jornada');
    }
    
    const jornada = JornadasService.getJornadaPorId(jornadaId);
    
    if (!jornada) {
      throw new Error('Jornada não encontrada');
    }
    
    if (!jornada.ativo) {
      throw new Error('Jornada inativa');
    }
    
    // Criar registro de ponto
    const novoPonto = {
      id: Date.now(),
      funcionarioId,
      funcionarioNome: funcionario.nome,
      jornadaId,
      jornadaNome: jornada.nome,
      tipo, // 'entrada' ou 'saida'
      dataHora: dataHora.toISOString(),
      data: dataHora.toLocaleDateString('pt-BR'),
      hora: dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    
    // Verificar tolerância conforme a jornada
    if (tipo === 'entrada') {
      // Verificar se está dentro da tolerância de entrada
      const horaJornada = jornada.horaInicio.split(':');
      const horaLimite = new Date();
      horaLimite.setHours(parseInt(horaJornada[0]), parseInt(horaJornada[1]) + jornada.toleranciaEntrada, 0, 0);
      
      novoPonto.dentroTolerancia = dataHora <= horaLimite;
    } else if (tipo === 'saida') {
      // Verificar se está dentro da tolerância de saída
      const horaJornada = jornada.horaFim.split(':');
      const horaLimite = new Date();
      horaLimite.setHours(parseInt(horaJornada[0]), parseInt(horaJornada[1]) - jornada.toleranciaSaida, 0, 0);
      
      novoPonto.dentroTolerancia = dataHora >= horaLimite;
    }
    
    // Salvar registro
    const registros = PontoService.getTodosRegistros();
    registros.push(novoPonto);
    localStorage.setItem('registrosPonto', JSON.stringify(registros));
    
    return novoPonto;
  },
  
  // Obter registros de ponto por funcionário
  getRegistrosPorFuncionario: (funcionarioId) => {
    const registros = PontoService.getTodosRegistros();
    return registros.filter(r => r.funcionarioId === funcionarioId);
  },
  
  // Obter registros de ponto por jornada
  getRegistrosPorJornada: (jornadaId) => {
    const registros = PontoService.getTodosRegistros();
    return registros.filter(r => r.jornadaId === jornadaId);
  },
  
  // Obter registros de ponto por data
  getRegistrosPorData: (data) => {
    const registros = PontoService.getTodosRegistros();
    return registros.filter(r => r.data === data);
  },
  
  // Verificar se funcionário está em uma jornada
  verificarJornadaFuncionario: (funcionarioNome) => {
    const funcionariosPorJornada = FuncionariosService.getFuncionariosPorJornada();
    
    for (const [jornadaId, funcionarios] of Object.entries(funcionariosPorJornada)) {
      if (funcionarios.includes(funcionarioNome)) {
        return parseInt(jornadaId);
      }
    }
    
    return null;
  },
  
  // Obter último registro de ponto de um funcionário
  getUltimoRegistro: (funcionarioId) => {
    const registros = PontoService.getRegistrosPorFuncionario(funcionarioId);
    
    if (registros.length === 0) {
      return null;
    }
    
    return registros.sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];
  }
};

export default PontoService;