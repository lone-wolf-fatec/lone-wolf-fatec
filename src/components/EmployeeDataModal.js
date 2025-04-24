import React, { useState, useEffect } from 'react';

const EmployeeDataModal = ({ userData, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('ferias');
  const [feriasEntries, setFeriasEntries] = useState([]);
  const [folgasEntries, setFolgasEntries] = useState([]);
  const [bancoHoras, setBancoHoras] = useState(null);
  const [ausencias, setAusencias] = useState([]);
  const [jornada, setJornada] = useState(null);
  const [horasExtras, setHorasExtras] = useState(null);

  // Carregar dados
  useEffect(() => {
    // Carregar banco de horas
    const storedFuncionarios = localStorage.getItem('funcionarios');
    if (storedFuncionarios) {
      const funcionarios = JSON.parse(storedFuncionarios);
      const userInfo = funcionarios.find(item => item.id === userData.id);
      if (userInfo && userInfo.bancoHoras !== undefined) {
        setBancoHoras({
          saldo: userInfo.bancoHoras,
          ultimaAtualizacao: new Date().toLocaleDateString('pt-BR')
        });
      } else {
        // Dados padrão se não encontrar
        setBancoHoras({
          saldo: 12.5,
          ultimaAtualizacao: new Date().toLocaleDateString('pt-BR')
        });
      }
    }

    // Carregar férias
    const storedFerias = localStorage.getItem('feriasEntries');
    if (storedFerias) {
      const ferias = JSON.parse(storedFerias);
      const userFerias = ferias.filter(item => item.funcionarioId === userData.id);
      setFeriasEntries(userFerias);
    }

    // Carregar folgas
    const storedFolgas = localStorage.getItem('folgaEntries');
    if (storedFolgas) {
      const folgas = JSON.parse(storedFolgas);
      const userFolgas = folgas.filter(item => item.funcionarioId === userData.id);
      setFolgasEntries(userFolgas);
    }

    // Configurar dados de jornada (valores fictícios)
    setJornada({
      diaSemana: '08:00 - 17:00',
      almoco: '12:00 - 13:00',
      horasDiarias: 8,
      horasSemanais: 40,
      escala: 'Segunda a Sexta'
    });

    // Configurar dados de horas extras (valores fictícios)
    const dataAtual = new Date();
    const mesAtual = dataAtual.toLocaleDateString('pt-BR', { month: 'long' });
    setHorasExtras({
      mesAtual: mesAtual,
      total: 5.75,
      compensadas: 2.0,
      pendentes: 3.75
    });

    // Configurar dados de ausências (valores fictícios)
    setAusencias([
      {
        id: 1,
        data: '05/03/2025',
        tipo: 'Atestado Médico',
        status: 'aprovado',
        justificativa: 'Consulta médica'
      },
      {
        id: 2,
        data: '10/02/2025',
        tipo: 'Falta Justificada',
        status: 'aprovado',
        justificativa: 'Problemas familiares'
      }
    ]);
  }, [userData.id]);

  // Função para renderizar status
  const renderizarStatus = (status) => {
    switch(status) {
      case 'aprovado':
        return <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs">APROVADO</span>;
      case 'pendente':
        return <span className="px-2 py-1 bg-yellow-600 text-white rounded-full text-xs">PENDENTE</span>;
      case 'rejeitado':
        return <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs">REJEITADO</span>;
      default:
        return status;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">Dados do Colaborador</h2>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Perfil do Usuário */}
        <div className="bg-purple-800 bg-opacity-40 rounded-lg p-4 mb-6 flex items-center">
          <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mr-4">
            <span className="font-bold text-xl">{userData.initials}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold">{userData.name}</h3>
            <p className="text-purple-300">{userData.email}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex overflow-x-auto space-x-2 bg-purple-800 bg-opacity-30 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('ferias')}
              className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'ferias' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
            >
              Férias
            </button>
            <button
              onClick={() => setActiveTab('folgas')}
              className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'folgas' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
            >
              Folgas
            </button>
            <button
              onClick={() => setActiveTab('banco-horas')}
              className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'banco-horas' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
            >
              Banco de Horas
            </button>
            <button
              onClick={() => setActiveTab('ausencias')}
              className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'ausencias' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
            >
              Ausências
            </button>
            <button
              onClick={() => setActiveTab('jornada')}
              className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap ${activeTab === 'jornada' ? 'bg-purple-600' : 'hover:bg-purple-700'}`}
            >
              Jornada
            </button>
          </div>
        </div>

        {/* Conteúdo das Tabs */}
        <div className="bg-purple-800 bg-opacity-30 rounded-lg p-4">
          {activeTab === 'ferias' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Histórico de Férias</h3>
              {feriasEntries.length === 0 ? (
                <p className="text-center text-purple-300 py-4">Nenhum registro de férias encontrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-purple-300 border-b border-purple-700">
                        <th className="py-2 px-4">Período</th>
                        <th className="py-2 px-4">Dias</th>
                        <th className="py-2 px-4">Justificativa</th>
                        <th className="py-2 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feriasEntries.map(ferias => (
                        <tr key={ferias.id} className="border-b border-purple-800 hover:bg-purple-800 hover:bg-opacity-30">
                          <td className="py-3 px-4">{ferias.dataInicio} a {ferias.dataFim}</td>
                          <td className="py-3 px-4">{ferias.diasTotais} dias</td>
                          <td className="py-3 px-4">
                            <div className="truncate max-w-xs" title={ferias.justificativa}>
                              {ferias.justificativa}
                            </div>
                          </td>
                          <td className="py-3 px-4">{renderizarStatus(ferias.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'folgas' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Histórico de Folgas</h3>
              {folgasEntries.length === 0 ? (
                <p className="text-center text-purple-300 py-4">Nenhum registro de folga encontrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-purple-300 border-b border-purple-700">
                        <th className="py-2 px-4">Data</th>
                        <th className="py-2 px-4">Tipo</th>
                        <th className="py-2 px-4">Período</th>
                        <th className="py-2 px-4">Motivo</th>
                        <th className="py-2 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {folgasEntries.map(folga => (
                        <tr key={folga.id} className="border-b border-purple-800 hover:bg-purple-800 hover:bg-opacity-30">
                          <td className="py-3 px-4">{folga.data}</td>
                          <td className="py-3 px-4">{folga.tipo}</td>
                          <td className="py-3 px-4">{folga.periodo}</td>
                          <td className="py-3 px-4">
                            <div className="truncate max-w-xs" title={folga.motivo}>
                              {folga.motivo}
                            </div>
                          </td>
                          <td className="py-3 px-4">{renderizarStatus(folga.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'banco-horas' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Banco de Horas</h3>
              
              {bancoHoras && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-purple-900 bg-opacity-40 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-semibold text-purple-200 mb-2">Saldo Atual</h4>
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
                  
                  {horasExtras && (
                    <div className="bg-purple-900 bg-opacity-40 rounded-lg p-4">
                      <h4 className="text-lg font-semibold text-purple-200 mb-2">Horas Extras ({horasExtras.mesAtual})</h4>
                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between">
                          <span className="text-purple-300">Total:</span>
                          <span className="font-semibold">{horasExtras.total.toFixed(2)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">Compensadas:</span>
                          <span className="font-semibold">{horasExtras.compensadas.toFixed(2)}h</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">Pendentes:</span>
                          <span className="font-semibold">{horasExtras.pendentes.toFixed(2)}h</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="bg-purple-900 bg-opacity-40 rounded-lg p-4">
                <h4 className="text-lg font-semibold text-purple-200 mb-4">Histórico de Movimentação</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-purple-300 border-b border-purple-700">
                        <th className="py-2 px-4">Data</th>
                        <th className="py-2 px-4">Tipo</th>
                        <th className="py-2 px-4">Horas</th>
                        <th className="py-2 px-4">Descrição</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-purple-800">
                        <td className="py-3 px-4">12/03/2025</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs">CRÉDITO</span>
                        </td>
                        <td className="py-3 px-4">+1.5h</td>
                        <td className="py-3 px-4">Hora extra</td>
                      </tr>
                      <tr className="border-b border-purple-800">
                        <td className="py-3 px-4">10/03/2025</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs">DÉBITO</span>
                        </td>
                        <td className="py-3 px-4">-2.0h</td>
                        <td className="py-3 px-4">Compensação</td>
                      </tr>
                      <tr className="border-b border-purple-800">
                        <td className="py-3 px-4">05/03/2025</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-green-600 text-white rounded-full text-xs">CRÉDITO</span>
                        </td>
                        <td className="py-3 px-4">+2.5h</td>
                        <td className="py-3 px-4">Hora extra</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'ausencias' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Histórico de Ausências</h3>
              
              {ausencias.length === 0 ? (
                <p className="text-center text-purple-300 py-4">Nenhum registro de ausência encontrado.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-purple-300 border-b border-purple-700">
                        <th className="py-2 px-4">Data</th>
                        <th className="py-2 px-4">Tipo</th>
                        <th className="py-2 px-4">Justificativa</th>
                        <th className="py-2 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ausencias.map(ausencia => (
                        <tr key={ausencia.id} className="border-b border-purple-800 hover:bg-purple-800 hover:bg-opacity-30">
                          <td className="py-3 px-4">{ausencia.data}</td>
                          <td className="py-3 px-4">{ausencia.tipo}</td>
                          <td className="py-3 px-4">
                            <div className="truncate max-w-xs" title={ausencia.justificativa}>
                              {ausencia.justificativa}
                            </div>
                          </td>
                          <td className="py-3 px-4">{renderizarStatus(ausencia.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'jornada' && jornada && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Informações de Jornada</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-purple-900 bg-opacity-40 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-purple-200 mb-3">Horário de Trabalho</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-purple-300">Dia de Semana:</span>
                      <span className="font-semibold">{jornada.diaSemana}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Intervalo:</span>
                      <span className="font-semibold">{jornada.almoco}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Escala:</span>
                      <span className="font-semibold">{jornada.escala}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-900 bg-opacity-40 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-purple-200 mb-3">Carga Horária</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-purple-300">Horas Diárias:</span>
                      <span className="font-semibold">{jornada.horasDiarias}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Horas Semanais:</span>
                      <span className="font-semibold">{jornada.horasSemanais}h</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-300">Férias Disponíveis:</span>
                      <span className="font-semibold">30 dias</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDataModal;