import React, { useState, useEffect } from 'react';
import ApprovedDataComponent from './ApprovedDataComponent';
import SolicitacaoTab from './SolicitacaoTab';
import PendentesTab from './PendentesTab';
import AdminAprovacaoTab from './AdminAprovacaoTab';

const EmployeeDashboard = () => {
  // Estados para dados do usuário e solicitações
  const [userData, setUserData] = useState(() => {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    return {
      id: storedUser.id || 1,
      name: storedUser.name || 'Usuário',
      email: storedUser.email || ''
    };
  });

  // Estados para dados específicos
  const [bancoHoras, setBancoHoras] = useState(null);
  const [feriasEntries, setFeriasEntries] = useState([]);
  const [folgasEntries, setFolgasEntries] = useState([]);

  // Estados para modais e navegação
  const [showDadosAprovados, setShowDadosAprovados] = useState(false);
  const [activeTab, setActiveTab] = useState('ferias');
  const [showSolicitacaoModal, setShowSolicitacaoModal] = useState(false);
  const [currentSolicitacaoTipo, setCurrentSolicitacaoTipo] = useState('ferias');

  // Carregar dados ao montar o componente
  useEffect(() => {
    // Carregar Banco de Horas
    const storedFuncionarios = localStorage.getItem('funcionarios');
    if (storedFuncionarios) {
      const funcionarios = JSON.parse(storedFuncionarios);
      const userInfo = funcionarios.find(item => item.id === userData.id);
      if (userInfo && userInfo.bancoHoras !== undefined) {
        setBancoHoras({
          saldo: userInfo.bancoHoras,
          ultimaAtualizacao: new Date().toLocaleDateString('pt-BR')
        });
      }
    }

    // Carregar Férias
    const storedFerias = localStorage.getItem('feriasEntries');
    if (storedFerias) {
      const ferias = JSON.parse(storedFerias);
      const userFerias = ferias.filter(item => 
        item.funcionarioId === userData.id && 
        (item.status === 'pendente' || item.status === 'aprovado')
      );
      setFeriasEntries(userFerias);
    }

    // Carregar Folgas
    const storedFolgas = localStorage.getItem('folgaEntries');
    if (storedFolgas) {
      const folgas = JSON.parse(storedFolgas);
      const userFolgas = folgas.filter(item => 
        item.funcionarioId === userData.id && 
        (item.status === 'pendente' || item.status === 'aprovado')
      );
      setFolgasEntries(userFolgas);
    }
  }, [userData.id]);

  // Funções para manipular solicitações
  const handleSolicitacaoEnviada = (newEntry, tipo) => {
    if (tipo === 'ferias') {
      setFeriasEntries(prev => [...prev, newEntry]);
    } else {
      setFolgasEntries(prev => [...prev, newEntry]);
    }
    setShowSolicitacaoModal(false);
  };

  // Abrir modal de solicitação
  const openSolicitacaoModal = (tipo) => {
    setCurrentSolicitacaoTipo(tipo);
    setShowSolicitacaoModal(true);
  };

  // Abrir modal de dados aprovados
  const openDadosAprovadosModal = () => {
    setShowDadosAprovados(true);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dados do Colaborador (Admin View) */}
        <div>
          <AdminAprovacaoTab 
            tipoSolicitacao="ferias"
            userData={userData}
          />
          <AdminAprovacaoTab 
            tipoSolicitacao="folgas"
            userData={userData}
          />
        </div>

        {/* Meus Dados Aprovados (Employee View) */}
        <div>
          {/* Banco de Horas */}
          {bancoHoras && (
            <div className="bg-purple-900 bg-opacity-40 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-purple-200 mb-2">Banco de Horas</h4>
                  <p className={`text-3xl font-bold ${bancoHoras.saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {bancoHoras.saldo.toFixed(1)}h
                  </p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs text-purple-300 mt-2">
                Última atualização: {bancoHoras.ultimaAtualizacao}
              </p>
            </div>
          )}

          {/* Botões de Solicitação */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => openSolicitacaoModal('ferias')}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Solicitar Férias
            </button>

            <button
              onClick={() => openSolicitacaoModal('folgas')}
              className="w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-bold py-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Solicitar Folga
            </button>
          </div>

          {/* Botão Meus Dados Aprovados */}
          <button
            onClick={openDadosAprovadosModal}
            className="w-full mb-6 bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-bold py-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Meus Dados Aprovados
          </button>

          {/* Tabs de Férias e Folgas Pendentes */}
          <div className="bg-purple-900 bg-opacity-40 rounded-lg">
            <div className="flex border-b border-purple-700">
              <button
                onClick={() => setActiveTab('ferias')}
                className={`w-1/2 py-3 text-center font-semibold ${
                  activeTab === 'ferias' 
                    ? 'bg-purple-700 text-white' 
                    : 'text-purple-300 hover:bg-purple-800'
                }`}
              >
                Férias
              </button>
              <button
                onClick={() => setActiveTab('folgas')}
                className={`w-1/2 py-3 text-center font-semibold ${
                  activeTab === 'folgas' 
                    ? 'bg-purple-700 text-white' 
                    : 'text-purple-300 hover:bg-purple-800'
                }`}
              >
                Folgas
              </button>
            </div>

            <div className="p-4">
              {activeTab === 'ferias' ? (
                <PendentesTab 
                  tipoSolicitacao="ferias" 
                  solicitacoesPendentes={feriasEntries} 
                />
              ) : (
                <PendentesTab 
                  tipoSolicitacao="folgas" 
                  solicitacoesPendentes={folgasEntries} 
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Solicitação */}
      {showSolicitacaoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <SolicitacaoTab 
              tipoSolicitacao={currentSolicitacaoTipo}
              userData={userData}
              bancoHoras={bancoHoras}
              onSolicitacaoEnviada={handleSolicitacaoEnviada}
              closeModal={() => setShowSolicitacaoModal(false)}
            />
          </div>
        </div>
      )}

      {/* Modal de Dados Aprovados */}
      {showDadosAprovados && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <ApprovedDataComponent 
            userData={userData}
            feriasEntries={feriasEntries}
            folgasEntries={folgasEntries}
            closeModal={() => setShowDadosAprovados(false)}
          />
        </div>
      )}
    </div>
  );
};

export default EmployeeDashboard;