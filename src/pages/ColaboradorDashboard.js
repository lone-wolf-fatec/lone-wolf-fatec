import React, { useState, useEffect } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import HorasExtrasTab from '../components/HorasExtrasTab';
import FeriasTab from '../components/FeriasTab';
import FolgaTab from '..components/FolgaTab';
import BancoHorasTab from '../components/BancoHorasTab';
import AusenciasTab from '../components/AusenciasTab';
import JornadasTab from '../components/JornadaTab';

const ColaboradorDashboard = ({ userData, setLastAction, setNotifications, notifications }) => {
  // Estado para dados de contestação
  const [contestacaoData, setContestacaoData] = useState({
    tipo: '',
    motivo: '',
    detalhes: ''
  });
  
  // Estados para modal de dados do colaborador
  const [showEmployeeDataModal, setShowEmployeeDataModal] = useState(false);
  const [employeeData, setEmployeeData] = useState({
    horasExtras: [],
    ferias: { 
      disponivel: 30, 
      proximas: { inicio: '', fim: '' }, 
      historico: [] 
    },
    folgas: [],
    bancoHoras: { saldo: '0h 0min', entradas: [], saidas: [] },
    ausencias: [],
    jornada: userData.jornadaTrabalho || {
      inicio: '08:00',
      fimManha: '12:00',
      inicioTarde: '13:00',
      fim: '17:00',
      toleranciaAtraso: 10
    }
  });
  const [activeEmployeeTab, setActiveEmployeeTab] = useState('horasExtras');

  // Função para carregar dados do colaborador
  const carregarDadosColaborador = () => {
    // Carregar horas extras
    const horasExtras = JSON.parse(localStorage.getItem('horasExtras') || '[]')
      .filter(he => he.funcionarioId === userData.id)
      .sort((a, b) => {
        const [diaA, mesA, anoA] = a.data.split('/').map(Number);
        const [diaB, mesB, anoB] = b.data.split('/').map(Number);
        
        const dataA = new Date(anoA, mesA - 1, diaA);
        const dataB = new Date(anoB, mesB - 1, diaB);
        
        return dataB - dataA; // Ordenar da mais recente para a mais antiga
      });
    
    // Carregar férias
    const ferias = JSON.parse(localStorage.getItem('ferias') || '{}')[userData.id] || {
      disponivel: 30,
      proximas: { inicio: '', fim: '' },
      historico: []
    };
    
    // Carregar folgas
    const folgas = JSON.parse(localStorage.getItem('solicitacoesFolga') || '[]')
      .filter(folga => folga.funcionarioId === userData.id && folga.status === 'aprovado')
      .sort((a, b) => {
        const [diaA, mesA, anoA] = a.data.split('/').map(Number);
        const [diaB, mesB, anoB] = b.data.split('/').map(Number);
        
        const dataA = new Date(anoA, mesA - 1, diaA);
        const dataB = new Date(anoB, mesB - 1, diaB);
        
        return dataA - dataB; // Ordenar da mais antiga para a mais recente
      });
      // Carregar banco de horas
    const bancoHoras = JSON.parse(localStorage.getItem('bancoHoras') || '{}')[userData.id] || {
        saldo: '0h 0min',
        entradas: [],
        saidas: []
      };
      
      // Carregar ausências
      const ausencias = JSON.parse(localStorage.getItem('ausencias') || '[]')
        .filter(ausencia => ausencia.funcionarioId === userData.id)
        .sort((a, b) => {
          const [diaA, mesA, anoA] = a.data.split('/').map(Number);
          const [diaB, mesB, anoB] = b.data.split('/').map(Number);
          
          const dataA = new Date(anoA, mesA - 1, diaA);
          const dataB = new Date(anoB, mesB - 1, diaB);
          
          return dataB - dataA; // Ordenar da mais recente para a mais antiga
        });
      
      // Atualizar estado com os dados carregados
      setEmployeeData({
        horasExtras,
        ferias,
        folgas,
        bancoHoras,
        ausencias,
        jornada: userData.jornadaTrabalho
      });
      
      // Mostrar modal
      setShowEmployeeDataModal(true);
    };
  
    // Função para enviar contestação
    const enviarContestacao = () => {
      if (!contestacaoData.tipo || !contestacaoData.motivo) {
        alert('Por favor, preencha o tipo e motivo da contestação');
        return;
      }
      
      const novaContestacao = {
        id: Date.now(),
        funcionarioId: userData.id,
        funcionarioNome: userData.name,
        tipo: contestacaoData.tipo,
        motivo: contestacaoData.motivo,
        detalhes: contestacaoData.detalhes,
        dataContestacao: new Date().toLocaleDateString('pt-BR'),
        status: 'pendente'
      };
      
      const contestacoes = JSON.parse(localStorage.getItem('contestacoes') || '[]');
      contestacoes.push(novaContestacao);
      localStorage.setItem('contestacoes', JSON.stringify(contestacoes));
      
      // Notificar admin
      const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
      adminNotifications.push({
        id: Date.now(),
        type: 'contestacao',
        message: `Contestação de ${novaContestacao.tipo} por ${novaContestacao.funcionarioNome}: ${novaContestacao.motivo}`,
        read: false
      });
      localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
      
      // Limpar form
      setContestacaoData({
        tipo: '',
        motivo: '',
        detalhes: ''
      });
      
      setLastAction('Contestação enviada com sucesso!');
      
      alert('Contestação registrada. Em breve a administração irá analisar.');
    };
  
    // Render do componente
    return (
      <div>
        {/* Seus outros componentes aqui... */}
        
        {/* Botão para abrir modal de dados do colaborador */}
        <button
          onClick={carregarDadosColaborador}
          className="w-full sm:w-64 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 text-white font-bold py-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Dados do Colaborador
        </button>
        {/* Modal de Dados do Colaborador */}
      {showEmployeeDataModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Dados do Colaborador - {userData.name}</h3>
              <button
                onClick={() => setShowEmployeeDataModal(false)}
                className="text-purple-300 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Tabs para Dados do Colaborador */}
            <div className="mb-6">
              <div className="flex overflow-x-auto space-x-2 bg-purple-800 bg-opacity-30 p-1 rounded-lg">
                <Link
                  to="horasExtras"
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeEmployeeTab === 'horasExtras' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
                >
                  Horas Extras
                </Link>
                <Link
                  to="ferias"
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeEmployeeTab === 'ferias' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
                >
                  Férias
                </Link>
                <Link
                  to="folgas"
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeEmployeeTab === 'folgas' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
                >
                  Folgas
                </Link>
                <Link
                  to="bancoHoras"
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeEmployeeTab === 'bancoHoras' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
                >
                  Banco de Horas
                </Link>
                <Link
                  to="ausencias"
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeEmployeeTab === 'ausencias' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
                >
                  Ausências
                </Link>
                <Link
                  to="jornada"
                  className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeEmployeeTab === 'jornada' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
                >
                  Jornada
                </Link>
              </div>
            </div>
            
            {/* Conteúdo das abas */}
            <Routes>
              <Route path="horasExtras" element={<HorasExtrasTab employeeData={employeeData} />} />
              <Route path="ferias" element={<FeriasTab employeeData={employeeData} />} />
              <Route path="folgas" element={<FolgaTab employeeData={employeeData} />} />
              <Route path="bancoHoras" element={<BancoHorasTab employeeData={employeeData} />} />
              <Route path="ausencias" element={<AusenciasTab employeeData={employeeData} />} />
              <Route path="jornada" element={<JornadasTab employeeData={employeeData} />} />
            </Routes>
            
            {/* Formulário de contestação */}
            <div className="mt-6">
              <h4 className="text-lg font-medium mb-3">Contestar Dados</h4>
              
              <div className="mb-4">
                <label className="block text-sm text-purple-300 mb-1">Tipo de Contestação</label>
                <select
                  value={contestacaoData.tipo}
                  onChange={(e) => setContestacaoData({...contestacaoData, tipo: e.target.value})}
                  className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                >
                  <option value="">Selecione</option>
                  <option value="horasExtras">Horas Extras</option>
                  <option value="ferias">Férias</option>
                  <option value="folgas">Folgas</option>
                  <option value="bancoHoras">Banco de Horas</option>
                  <option value="ausencias">Ausências</option>
                  <option value="jornada">Jornada de Trabalho</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm text-purple-300 mb-1">Motivo da Contestação</label>
                <textarea
                  value={contestacaoData.motivo}
                  onChange={(e) => setContestacaoData({...contestacaoData, motivo: e.target.value})}
                  className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white min-h-[80px]"
                  placeholder="Explique o motivo da contestação"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm text-purple-300 mb-1">Detalhes Adicionais</label>
                <textarea
                  value={contestacaoData.detalhes}
                  onChange={(e) => setContestacaoData({...contestacaoData, detalhes: e.target.value})}
                  className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white min-h-[120px]"
                  placeholder="Forneça detalhes adicionais sobre a contestação, se necessário"
                />
              </div>
              
              <button
                onClick={enviarContestacao}
                disabled={!contestacaoData.tipo || !contestacaoData.motivo}
                className={`px-4 py-2 rounded-md ${(contestacaoData.tipo && contestacaoData.motivo) ? 'bg-purple-600 hover:bg-purple-500' : 'bg-purple-900 opacity-50 cursor-not-allowed'}`}
              >
                Enviar Contestação
              </button>
            </div>
            
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setShowEmployeeDataModal(false)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md"
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

export default ColaboradorDashboard;