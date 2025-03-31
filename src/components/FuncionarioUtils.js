// Utilitário para importar funcionários do UserDashboard
const FuncionariosUtils = {
    // Obter funcionários do UserDashboard
    getFuncionariosFromUserDashboard: () => {
      try {
        const timeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
        const userFuncionarios = [];
        const uniqueNames = new Set();
        
        // Extrair funcionários dos registros de ponto
        if (timeEntries && timeEntries.length > 0) {
          timeEntries.forEach(entry => {
            if (entry.employeeName && !uniqueNames.has(entry.employeeName)) {
              uniqueNames.add(entry.employeeName);
              userFuncionarios.push({
                id: entry.employeeId || Date.now() + Math.random(),
                nome: entry.employeeName,
                cargo: entry.cargo || 'Funcionário',
                departamento: entry.departamento || 'Empresa'
              });
            }
          });
        }
        
        // Também tenta obter o usuário atual do localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (currentUser && currentUser.name) {
          const nameExists = userFuncionarios.some(f => f.nome === currentUser.name);
          if (!nameExists) {
            userFuncionarios.push({
              id: currentUser.id || Date.now() + Math.random(),
              nome: currentUser.name,
              cargo: currentUser.role || 'Funcionário',
              departamento: currentUser.department || 'Empresa'
            });
          }
        }
        
        return userFuncionarios;
      } catch (error) {
        console.error('Erro ao carregar funcionários do UserDashboard:', error);
        return [];
      }
    },
    
    // Salvar funcionário no UserDashboard
    saveUserDashboardFuncionario: (funcionario) => {
      try {
        // Criar um registro de entrada para o funcionário
        // Isso garante que ele apareça no timeEntries
        const now = new Date();
        const newEntry = {
          employeeId: funcionario.id,
          employeeName: funcionario.nome,
          registeredBy: 'Sistema',
          cargo: funcionario.cargo,
          departamento: funcionario.departamento,
          type: 'cadastro',
          time: now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          date: now.toLocaleDateString('pt-BR'),
          status: 'aprovado'
        };
        
        const timeEntries = JSON.parse(localStorage.getItem('timeEntries') || '[]');
        timeEntries.unshift(newEntry);
        localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
        
        return {
          success: true,
          funcionario
        };
      } catch (error) {
        console.error('Erro ao salvar funcionário no UserDashboard:', error);
        return {
          success: false,
          error
        };
      }
    },
    
    // Combinar funcionários do sistema com os do UserDashboard
    combinarFuncionarios: (funcionariosSistema, funcionariosUserDashboard) => {
      const todosFuncionarios = [...funcionariosSistema];
      
      // Adicionar funcionários do UserDashboard que não existem na lista principal
      funcionariosUserDashboard.forEach(userFunc => {
        const exists = todosFuncionarios.some(f => f.nome === userFunc.nome);
        if (!exists) {
          todosFuncionarios.push(userFunc);
        }
      });
      
      return todosFuncionarios;
    },
    
    // Verificar se um funcionário está em uma jornada
    funcionarioEstaEmJornada: (funcionarioNome, funcionariosPorJornada) => {
      for (const jornadaId in funcionariosPorJornada) {
        if (funcionariosPorJornada[jornadaId].includes(funcionarioNome)) {
          return {
            emJornada: true,
            jornadaId
          };
        }
      }
      
      return {
        emJornada: false,
        jornadaId: null
      };
    },
    
    // Obter a jornada atual de um funcionário
    getJornadaFuncionario: (funcionarioNome, funcionariosPorJornada, jornadas) => {
      const { emJornada, jornadaId } = FuncionariosUtils.funcionarioEstaEmJornada(
        funcionarioNome, 
        funcionariosPorJornada
      );
      
      if (emJornada && jornadaId) {
        // Encontrar a jornada completa
        const jornada = jornadas.find(j => j.id === parseInt(jornadaId));
        return jornada || null;
      }
      
      return null;
    },
    
    // Formatar nome do funcionário (primeira letra maiúscula, resto minúscula)
    formatarNomeFuncionario: (nome) => {
      if (!nome) return '';
      
      return nome.split(' ')
        .map(parte => parte.charAt(0).toUpperCase() + parte.slice(1).toLowerCase())
        .join(' ');
    },
    
    // Extrair iniciais do nome
    getIniciaisNome: (nome) => {
      if (!nome) return '';
      
      const partes = nome.split(' ').filter(p => p.length > 0);
      if (partes.length === 0) return '';
      if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
      
      return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
    }
  };
  
  export default FuncionariosUtils;