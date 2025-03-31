import React, { useState } from 'react';
import HorasExtrasTab from './HorasExtrasTab';
import FeriasTab from './FeriasTab';
import FolgaTab from './FolgaTab';

const GerenciamentoFuncionarios = () => {
  // Estado para controlar qual aba está ativa
  const [activeTab, setActiveTab] = useState('horas-extras');

  // Função para renderizar a aba ativa
  const renderActiveTab = () => {
    switch(activeTab) {
      case 'horas-extras':
        return <HorasExtrasTab />;
      case 'ferias':
        return <FeriasTab />;
      case 'folgas':
        return <FolgaTab />;
      default:
        return <HorasExtrasTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 to-indigo-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8 text-center">
          Sistema de Gerenciamento de Funcionários
        </h1>
        
        {/* Abas de navegação */}
        <div className="flex flex-wrap mb-6">
          <button 
            className={`py-3 px-6 rounded-t-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'horas-extras' 
                ? 'bg-purple-800 bg-opacity-40 backdrop-blur-sm text-white' 
                : 'bg-purple-900 bg-opacity-20 backdrop-blur-sm text-purple-300 hover:bg-opacity-30'
            }`}
            onClick={() => setActiveTab('horas-extras')}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Horas Extras
            </div>
          </button>
          
          <button 
            className={`py-3 px-6 rounded-t-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'ferias' 
                ? 'bg-purple-800 bg-opacity-40 backdrop-blur-sm text-white' 
                : 'bg-purple-900 bg-opacity-20 backdrop-blur-sm text-purple-300 hover:bg-opacity-30'
            }`}
            onClick={() => setActiveTab('ferias')}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Férias
            </div>
          </button>
          
          <button 
            className={`py-3 px-6 rounded-t-lg font-medium text-sm transition-all duration-200 ${
              activeTab === 'folgas' 
                ? 'bg-purple-800 bg-opacity-40 backdrop-blur-sm text-white' 
                : 'bg-purple-900 bg-opacity-20 backdrop-blur-sm text-purple-300 hover:bg-opacity-30'
            }`}
            onClick={() => setActiveTab('folgas')}
          >
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Folgas
            </div>
          </button>
        </div>
        
        {/* Conteúdo da aba ativa */}
        {renderActiveTab()}
        
        {/* Rodapé */}
        <div className="mt-8 text-center text-purple-300 text-sm">
          <p>© 2025 Sistema de Gerenciamento de Funcionários · Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
};

export default GerenciamentoFuncionarios;