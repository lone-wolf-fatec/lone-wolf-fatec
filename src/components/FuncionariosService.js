// FuncionariosService.js
const STORAGE_KEYS = {
    FUNCIONARIOS: 'funcionarios',
    FUNCIONARIOS_POR_JORNADA: 'funcionariosPorJornada'
  };
  
  const FuncionariosService = {
    // Obter todos os funcionários
    getTodosFuncionarios: () => {
      const storedFuncionarios = localStorage.getItem(STORAGE_KEYS.FUNCIONARIOS);
      return storedFuncionarios 
        ? JSON.parse(storedFuncionarios) 
        : [
            { id: 1, nome: 'João Silva', email: 'joao.silva@empresa.com', jornada: null },
            { id: 2, nome: 'Maria Oliveira', email: 'maria.oliveira@empresa.com', jornada: null },
            { id: 3, nome: 'Pedro Santos', email: 'pedro.santos@empresa.com', jornada: null },
            { id: 4, nome: 'Ana Souza', email: 'ana.souza@empresa.com', jornada: null },
            { id: 5, nome: 'Carlos Pereira', email: 'carlos.pereira@empresa.com', jornada: null }
          ];
    },
  
    // Obter funcionários por jornada
    getFuncionariosPorJornada: () => {
      const storedFuncionariosPorJornada = localStorage.getItem(STORAGE_KEYS.FUNCIONARIOS_POR_JORNADA);
      return storedFuncionariosPorJornada 
        ? JSON.parse(storedFuncionariosPorJornada) 
        : {};
    },
  
    // Adicionar funcionário a uma jornada
    adicionarFuncionarioNaJornada: (funcionarioId, jornadaId, funcionariosPorJornada) => {
      const novoFuncionariosPorJornada = { ...funcionariosPorJornada };
      
      // Remover funcionário de qualquer jornada anterior
      Object.keys(novoFuncionariosPorJornada).forEach(key => {
        novoFuncionariosPorJornada[key] = 
          novoFuncionariosPorJornada[key].filter(id => id !== funcionarioId);
      });
  
      // Adicionar funcionário à nova jornada
      if (!novoFuncionariosPorJornada[jornadaId]) {
        novoFuncionariosPorJornada[jornadaId] = [];
      }
      
      if (!novoFuncionariosPorJornada[jornadaId].includes(funcionarioId)) {
        novoFuncionariosPorJornada[jornadaId].push(funcionarioId);
      }
  
      return novoFuncionariosPorJornada;
    },
  
    // Remover funcionário de uma jornada
    removerFuncionarioDaJornada: (funcionarioId, jornadaId, funcionariosPorJornada) => {
      const novoFuncionariosPorJornada = { ...funcionariosPorJornada };
      
      if (novoFuncionariosPorJornada[jornadaId]) {
        novoFuncionariosPorJornada[jornadaId] = 
          novoFuncionariosPorJornada[jornadaId].filter(id => id !== funcionarioId);
      }
  
      return novoFuncionariosPorJornada;
    },
  
    // Atualizar lista de funcionários
    atualizarFuncionarios: (funcionarios) => {
      localStorage.setItem(STORAGE_KEYS.FUNCIONARIOS, JSON.stringify(funcionarios));
    },
  
    // Atualizar funcionários por jornada
    atualizarFuncionariosPorJornada: (funcionariosPorJornada) => {
      localStorage.setItem(STORAGE_KEYS.FUNCIONARIOS_POR_JORNADA, JSON.stringify(funcionariosPorJornada));
    },
  
    // Obter funcionários de uma jornada específica
    getFuncionariosDaJornada: (jornadaId, funcionariosPorJornada, todosFuncionarios) => {
      const funcionariosIds = funcionariosPorJornada[jornadaId] || [];
      return todosFuncionarios.filter(funcionario => 
        funcionariosIds.includes(funcionario.id)
      );
    }
  };
  
  export default FuncionariosService;