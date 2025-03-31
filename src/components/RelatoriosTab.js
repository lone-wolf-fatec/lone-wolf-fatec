import React, { useState } from 'react';

const RelatoriosTab = () => {
  // Estado para tipo de relatório selecionado
  const [tipoRelatorio, setTipoRelatorio] = useState('espelho');
  
  // Estado para filtros de relatório
  const [filtros, setFiltros] = useState({
    dataInicio: '',
    dataFim: '',
    funcionario: '',
    departamento: '',
    formato: 'pdf'
  });
  
  // Simulação de departamentos
  const departamentos = [
    { id: 1, nome: 'Recursos Humanos' },
    { id: 2, nome: 'Tecnologia da Informação' },
    { id: 3, nome: 'Financeiro' },
    { id: 4, nome: 'Marketing' },
    { id: 5, nome: 'Vendas' }
  ];
  
  // Lista de funcionários
  const [funcionarios] = useState(() => {
    const storedFuncionarios = localStorage.getItem('funcionarios');
    return storedFuncionarios ? JSON.parse(storedFuncionarios) : [
      { id: 101, nome: 'João Silva', departamentoId: 2 },
      { id: 102, nome: 'Maria Oliveira', departamentoId: 1 },
      { id: 103, nome: 'Carlos Pereira', departamentoId: 3 },
      { id: 104, nome: 'Ana Souza', departamentoId: 4 },
      { id: 105, nome: 'Pedro Santos', departamentoId: 5 }
    ];
  });
  
  // Função para gerar relatório
  const gerarRelatorio = (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!filtros.dataInicio || !filtros.dataFim) {
      alert('Por favor, preencha as datas de início e fim.');
      return;
    }
    
    // Simulação de geração de relatório
    alert(`Relatório de ${tipoRelatorio} gerado com sucesso no formato ${filtros.formato.toUpperCase()}!`);
  };
  
  return (
    <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-6">
      <h1 className="text-2xl font-bold mb-6">Relatórios</h1>
      
      {/* Seleção de tipo de relatório */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Selecione o Tipo de Relatório</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div 
            className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${tipoRelatorio === 'espelho' 
              ? 'bg-purple-600 shadow-lg' 
              : 'bg-purple-900 bg-opacity-40 hover:bg-opacity-60'}`}
            onClick={() => setTipoRelatorio('espelho')}
          >
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="font-medium">Espelho de Ponto</span>
            </div>
          </div>
          
          <div 
            className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${tipoRelatorio === 'ausencias' 
              ? 'bg-purple-600 shadow-lg' 
              : 'bg-purple-900 bg-opacity-40 hover:bg-opacity-60'}`}
            onClick={() => setTipoRelatorio('ausencias')}
          >
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Ausências</span>
            </div>
          </div>
          
          <div 
            className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${tipoRelatorio === 'marcacoes' 
              ? 'bg-purple-600 shadow-lg' 
              : 'bg-purple-900 bg-opacity-40 hover:bg-opacity-60'}`}
            onClick={() => setTipoRelatorio('marcacoes')}
          >
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="font-medium">Marcações por Dia</span>
            </div>
          </div>
          
          <div 
            className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${tipoRelatorio === 'bancoHoras' 
              ? 'bg-purple-600 shadow-lg' 
              : 'bg-purple-900 bg-opacity-40 hover:bg-opacity-60'}`}
            onClick={() => setTipoRelatorio('bancoHoras')}
          >
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Banco de Horas</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Formulário de filtros */}
      <div className="bg-purple-900 bg-opacity-40 rounded-lg p-4 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filtros para {
          tipoRelatorio === 'espelho' ? 'Espelho de Ponto' :
          tipoRelatorio === 'ausencias' ? 'Relatório de Ausências' :
          tipoRelatorio === 'marcacoes' ? 'Marcações por Dia' :
          'Relatório de Banco de Horas'
        }</h2>
        
        <form onSubmit={gerarRelatorio}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-purple-300 mb-1">Data Início *</label>
              <input 
                type="date" 
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                value={filtros.dataInicio}
                onChange={(e) => setFiltros({...filtros, dataInicio: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-purple-300 mb-1">Data Fim *</label>
              <input 
                type="date" 
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                value={filtros.dataFim}
                onChange={(e) => setFiltros({...filtros, dataFim: e.target.value})}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm text-purple-300 mb-1">Funcionário</label>
              <select 
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                value={filtros.funcionario}
                onChange={(e) => setFiltros({...filtros, funcionario: e.target.value})}
              >
                <option value="">Todos os funcionários</option>
                {funcionarios.map(funcionario => (
                  <option key={funcionario.id} value={funcionario.id}>{funcionario.nome}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-purple-300 mb-1">Departamento</label>
              <select 
                className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
                value={filtros.departamento}
                onChange={(e) => setFiltros({...filtros, departamento: e.target.value})}
              >
                <option value="">Todos os departamentos</option>
                {departamentos.map(departamento => (
                  <option key={departamento.id} value={departamento.id}>{departamento.nome}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-purple-300 mb-1">Formato de Saída</label>
              <div className="flex space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="formato" 
                    value="pdf" 
                    checked={filtros.formato === 'pdf'}
                    onChange={() => setFiltros({...filtros, formato: 'pdf'})}
                    className="form-radio h-4 w-4 text-purple-600"
                  />
                  <span className="ml-2">PDF</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="formato" 
                    value="excel" 
                    checked={filtros.formato === 'excel'}
                    onChange={() => setFiltros({...filtros, formato: 'excel'})}
                    className="form-radio h-4 w-4 text-purple-600"
                  />
                  <span className="ml-2">Excel</span>
                </label>
                <label className="inline-flex items-center">
                  <input 
                    type="radio" 
                    name="formato" 
                    value="csv" 
                    checked={filtros.formato === 'csv'}
                    onChange={() => setFiltros({...filtros, formato: 'csv'})}
                    className="form-radio h-4 w-4 text-purple-600"
                  />
                  <span className="ml-2">CSV</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button 
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Gerar Relatório
            </button>
          </div>
        </form>
      </div>
      
      {/* Relatórios Recentes */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Relatórios Recentes</h2>
        <div className="bg-purple-900 bg-opacity-30 rounded-lg overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-purple-300 text-sm border-b border-purple-700">
                <th className="px-4 py-2 text-left">Nome</th>
                <th className="px-4 py-2 text-left">Tipo</th>
                <th className="px-4 py-2 text-left">Gerado em</th>
                <th className="px-4 py-2 text-left">Gerado por</th>
                <th className="px-4 py-2 text-left">Formato</th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                <td className="px-4 py-3">Espelho de Ponto - Março 2025</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-purple-600">ESPELHO</span>
                </td>
                <td className="px-4 py-3">18/03/2025</td>
                <td className="px-4 py-3">Administrador</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-red-600">PDF</span>
                </td>
                <td className="px-4 py-3">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded-md mr-2">
                    Download
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded-md">
                    Visualizar
                  </button>
                </td>
              </tr>
              <tr className="border-b border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                <td className="px-4 py-3">Banco de Horas - Fevereiro 2025</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-blue-600">BANCO DE HORAS</span>
                </td>
                <td className="px-4 py-3">28/02/2025</td>
                <td className="px-4 py-3">Administrador</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-600">EXCEL</span>
                </td>
                <td className="px-4 py-3">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded-md mr-2">
                    Download
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded-md">
                    Visualizar
                  </button>
                </td>
              </tr>
              <tr className="border-b border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                <td className="px-4 py-3">Ausências - Janeiro 2025</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-red-600">AUSÊNCIAS</span>
                </td>
                <td className="px-4 py-3">15/02/2025</td>
                <td className="px-4 py-3">Administrador</td>
                <td className="px-4 py-3">
                  <span className="inline-block px-2 py-1 rounded-full text-xs bg-yellow-600">CSV</span>
                </td>
                <td className="px-4 py-3">
                  <button className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded-md mr-2">
                    Download
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded-md">
                    Visualizar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Relatórios Agendados */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Relatórios Agendados</h2>
        <div className="bg-purple-900 bg-opacity-40 rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-lg font-medium">Configurar Relatórios Automáticos</p>
            <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Agendamento
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="bg-purple-800 bg-opacity-40 p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium">Espelho de Ponto - Mensal</p>
                <p className="text-sm text-purple-300">Todo dia 1 às 08:00</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-600">ATIVO</span>
                <button className="text-purple-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="bg-purple-800 bg-opacity-40 p-3 rounded-lg flex justify-between items-center">
              <div>
                <p className="font-medium">Banco de Horas - Semanal</p>
                <p className="text-sm text-purple-300">Toda sexta-feira às 18:00</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-600">ATIVO</span>
                <button className="text-purple-300 hover:text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Dicas e informações */}
      <div className="mt-8 bg-blue-600 bg-opacity-20 border border-blue-500 rounded-lg p-4">
        <div className="flex items-start">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-400 mr-2 mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-medium text-blue-400">Dicas para geração de relatórios</h3>
            <ul className="mt-2 text-sm space-y-1 list-disc list-inside text-blue-300">
              <li>Para relatórios extensos, o formato PDF é mais adequado para impressão</li>
              <li>Relatórios em Excel são úteis quando você precisa realizar análises adicionais</li>
              <li>Use o formato CSV para integração com outros sistemas</li>
              <li>Para gerar um relatório de um único funcionário, selecione-o no filtro correspondente</li>
              <li>Os relatórios agendados são enviados automaticamente por e-mail para os destinatários configurados</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosTab;