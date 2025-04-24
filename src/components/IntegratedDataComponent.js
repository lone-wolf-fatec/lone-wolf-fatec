import React, { useState, useEffect } from 'react';
import ApprovedDataComponent from './ApprovedDataComponent';

const IntegratedDataComponent = () => {
  // Estados e funções anteriores mantidos...

  // Função para verificar e sincronizar dados entre componentes
  const sincronizarDados = () => {
    const userId = JSON.parse(localStorage.getItem('user') || '{}').id || 1;

    // Sincronizar horas extras
    const horasExtras = JSON.parse(localStorage.getItem('overtimeEntries') || '[]')
      .filter(he => he.funcionarioId === userId);

    // Sincronizar férias
    const ferias = JSON.parse(localStorage.getItem('feriasEntries') || '[]')
      .filter(f => f.funcionarioId === userId);

    // Sincronizar folgas
    const folgas = JSON.parse(localStorage.getItem('folgaEntries') || '[]')
      .filter(f => f.funcionarioId === userId);

    // Atualizar banco de horas
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
    const userInfo = funcionarios.find(f => f.id === userId);

    const bancoHoras = userInfo ? {
      saldo: userInfo.bancoHoras || 0,
      ultimaAtualizacao: new Date().toLocaleDateString('pt-BR')
    } : null;

    // Atualizar ausências
    const ausencias = JSON.parse(localStorage.getItem('ausencias') || '[]')
      .filter(a => a.funcionarioId === userId);

    // Atualizar jornada
    const jornadas = JSON.parse(localStorage.getItem('jornadas') || '[]');
    const jornada = jornadas.find(j => j.employeeId === userId);

    // Retornar dados sincronizados
    return {
      horasExtras,
      ferias,
      folgas,
      bancoHoras,
      ausencias,
      jornada
    };
  };

  // Estado para dados sincronizados
  const [dadosSincronizados, setDadosSincronizados] = useState(sincronizarDados());

  // UseEffect para monitorar mudanças nos dados
  useEffect(() => {
    const interval = setInterval(() => {
      const novosDados = sincronizarDados();
      
      // Verificar se houve mudanças
      const dadosModificados = JSON.stringify(novosDados) !== JSON.stringify(dadosSincronizados);
      
      if (dadosModificados) {
        setDadosSincronizados(novosDados);
      }
    }, 60000); // Verificar a cada minuto

    return () => clearInterval(interval);
  }, [dadosSincronizados]);

  return (
    <ApprovedDataComponent 
      contestacoesEnviadas={contestacoesEnviadas}
      adicionarContestacao={adicionarContestacao}
      dadosSincronizados={dadosSincronizados}
    />
  );
};

export default IntegratedDataComponent;