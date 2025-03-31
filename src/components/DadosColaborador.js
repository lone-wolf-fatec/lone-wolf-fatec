import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DadosColaboradorAusencias from './DadosColaboradorAusencias';

const DadosColaborador = () => {
  const { id } = useParams(); // Pegar o ID do funcionário da URL
  const employeeId = parseInt(id, 10); // Converter para número
  const navigate = useNavigate();
  
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('informacoes');
  
  // Buscar dados do funcionário
  useEffect(() => {
    const fetchEmployee = () => {
      setLoading(true);
      // Buscar do localStorage
      const storedEmployees = JSON.parse(localStorage.getItem('employees') || '[]');
      const foundEmployee = storedEmployees.find(emp => emp.id === employeeId);
      
      if (foundEmployee) {
        setEmployee(foundEmployee);
      }
      
      setLoading(false);
    };
    
    fetchEmployee();
    
    // Atualizar quando houver mudanças
    const handleStorageChange = () => {
      fetchEmployee();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [employeeId]);
  
  const handleGoBack = () => {
    navigate('/admin/ausencias');
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Carregando dados do colaborador...</p>
      </div>
    );
  }
  
  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="mb-4">Colaborador não encontrado.</p>
          <button 
            onClick={handleGoBack}
            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-1">{employee.name}</h1>
          <p className="text-purple-300">{employee.department}</p>
        </div>
        <button 
          onClick={handleGoBack}
          className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded"
        >
          Voltar para Ausências
        </button>
      </div>
      
      {/* Tabs de navegação */}
      <div className="bg-purple-800 bg-opacity-40 rounded-lg p-1 flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('informacoes')}
          className={`px-4 py-2 rounded-md ${activeTab === 'informacoes' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Informações Pessoais
        </button>
        <button
          onClick={() => setActiveTab('ausencias')}
          className={`px-4 py-2 rounded-md ${activeTab === 'ausencias' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Ausências
        </button>
        <button
          onClick={() => setActiveTab('ferias')}
          className={`px-4 py-2 rounded-md ${activeTab === 'ferias' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Férias
        </button>
        <button
          onClick={() => setActiveTab('desempenho')}
          className={`px-4 py-2 rounded-md ${activeTab === 'desempenho' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
        >
          Desempenho
        </button>
      </div>
      
      {/* Conteúdo das tabs */}
      {activeTab === 'informacoes' && (
        <div className="bg-purple-800 bg-opacity-20 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Informações Pessoais</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-purple-300 mb-1">Nome Completo</p>
              <p className="font-medium">{employee.name}</p>
            </div>
            
            <div>
              <p className="text-purple-300 mb-1">E-mail</p>
              <p className="font-medium">{employee.email}</p>
            </div>
            
            <div>
              <p className="text-purple-300 mb-1">Departamento</p>
              <p className="font-medium">{employee.department}</p>
            </div>
            
            <div>
              <p className="text-purple-300 mb-1">Cargo</p>
              <p className="font-medium">{employee.role || 'Não informado'}</p>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'ausencias' && (
        <DadosColaboradorAusencias employeeId={employeeId} />
      )}
      
      {activeTab === 'ferias' && (
        <div className="bg-purple-800 bg-opacity-20 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Férias</h2>
          <p>Histórico e agendamento de férias do colaborador.</p>
          {/* Conteúdo da aba de férias */}
        </div>
      )}
      
      {activeTab === 'desempenho' && (
        <div className="bg-purple-800 bg-opacity-20 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Desempenho</h2>
          <p>Avaliações e métricas de desempenho do colaborador.</p>
          {/* Conteúdo da aba de desempenho */}
        </div>
      )}
    </div>
  );
};

export default DadosColaborador;