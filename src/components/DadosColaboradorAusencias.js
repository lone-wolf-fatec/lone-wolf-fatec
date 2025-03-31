import React, { useState, useEffect } from 'react';

const DadosColaboradorAusencias = ({ employeeId }) => {
  // Estado para armazenar as ausências do funcionário
  const [ausencias, setAusencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employee, setEmployee] = useState(null);
  
  // Carregar dados do funcionário e suas ausências
  useEffect(() => {
    const carregarDados = () => {
      setLoading(true);
      
      // Buscar funcionário do localStorage
      const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      const foundEmployee = storedEmployees.find(emp => emp.id === employeeId);
      setEmployee(foundEmployee);
      
      // Buscar ausências do localStorage
      const storedAusencias = JSON.parse(localStorage.getItem('ausencias') || '[]');
      // Filtrar apenas as ausências do funcionário atual
      const ausenciasFuncionario = storedAusencias.filter(a => a.employeeId === employeeId);
      setAusencias(ausenciasFuncionario);
      
      setLoading(false);
    };
    
    carregarDados();
    
    // Atualizar quando houver mudanças no localStorage
    const handleStorageChange = () => {
      carregarDados();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Verificar atualizações a cada 5 segundos
    const interval = setInterval(() => {
      carregarDados();
    }, 5000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [employeeId]);
  
  // Função para obter a classe CSS do status
  const getStatusClass = (status) => {
    switch (status) {
      case 'aprovado':
        return 'bg-green-600';
      case 'pendente':
        return 'bg-yellow-600';
      case 'rejeitado':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };
  
  // Função para obter a classe CSS do tipo
  const getTipoClass = (tipo) => {
    switch (tipo) {
      case 'atestado':
        return 'bg-blue-600';
      case 'falta':
        return 'bg-orange-600';
      case 'férias':
        return 'bg-green-600';
      case 'licença':
        return 'bg-purple-600';
      default:
        return 'bg-gray-600';
    }
  };
  
  // Função para obter a justificativa da confirmação
  const getConfirmacaoMotivo = (ausencia) => {
    if (ausencia.status === 'pendente') {
      return 'Aguardando confirmação';
    }
    
    // Verificar se existe uma justificativa para a aprovação/rejeição
    if (ausencia.confirmacaoMotivo) {
      return ausencia.confirmacaoMotivo;
    }
    
    // Texto padrão se não houver justificativa específica
    return ausencia.status === 'aprovado' 
      ? 'Ausência aprovada pela gestão' 
      : 'Ausência rejeitada pela gestão';
  };
  
  if (loading) {
    return (
      <div className="p-4 text-center">
        <p>Carregando dados do colaborador...</p>
      </div>
    );
  }
  
  if (!employee) {
    return (
      <div className="p-4 text-center">
        <p>Funcionário não encontrado. ID: {employeeId}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-purple-800 bg-opacity-20 rounded-lg shadow-lg mt-4">
      <div className="p-4 border-b border-purple-700">
        <h2 className="text-xl font-semibold">Histórico de Ausências</h2>
        <p className="text-purple-300 text-sm">Detalhes das ausências de {employee.name}</p>
      </div>
      
      {ausencias.length === 0 ? (
        <div className="p-4 text-center">
          <p>Nenhuma ausência registrada para este colaborador.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-purple-300 text-sm">
                <th className="text-left p-4">Período</th>
                <th className="text-left p-4">Tipo</th>
                <th className="text-left p-4">Motivo</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Data da Confirmação</th>
                <th className="text-left p-4">Justificativa da Confirmação</th>
              </tr>
            </thead>
            <tbody>
              {ausencias.map(ausencia => (
                <tr key={ausencia.id} className="border-t border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                  <td className="p-4">
                    {ausencia.dataInicio === ausencia.dataFim 
                      ? ausencia.dataInicio 
                      : `${ausencia.dataInicio} - ${ausencia.dataFim}`}
                  </td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getTipoClass(ausencia.tipo)}`}>
                      {ausencia.tipo.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">{ausencia.motivo}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusClass(ausencia.status)}`}>
                      {ausencia.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    {ausencia.status !== 'pendente' 
                      ? (ausencia.dataConfirmacao || 'Não disponível') 
                      : '-'}
                  </td>
                  <td className="p-4">
                    {getConfirmacaoMotivo(ausencia)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DadosColaboradorAusencias;