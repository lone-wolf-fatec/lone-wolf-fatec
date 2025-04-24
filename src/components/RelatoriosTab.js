import React, { useState } from 'react';
import RelatorioGenerator from './RelatorioGenerator';
import FileViewer from './FileViewer';

// Componente principal RelatoriosTab
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
  
  // Estado para controlar a exibição do componente de geração de relatório
  const [mostrarRelatorio, setMostrarRelatorio] = useState(false);
  
  // Estado para controlar a exibição do modal de visualização de relatório
  const [relatorioVisualizado, setRelatorioVisualizado] = useState(null);
  
  // Estado para controlar a exibição do modal de novo agendamento
  const [mostrarNovoAgendamento, setMostrarNovoAgendamento] = useState(false);
  
  // Estado para controlar a exibição do modal de edição de agendamento
  const [agendamentoEditado, setAgendamentoEditado] = useState(null);
  
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
  
  // Relatórios recentes (simulação de dados)
  const [relatoriosRecentes] = useState([
    {
      id: 1001,
      nome: 'Espelho de Ponto - Março 2025',
      tipo: 'ESPELHO',
      data: '18/03/2025',
      geradoPor: 'Administrador',
      formato: 'PDF',
      corTipo: 'purple',
      corFormato: 'red',
      conteudo: {
        funcionario: 'João Silva',
        departamento: 'Tecnologia da Informação',
        periodo: '01/03/2025 a 31/03/2025',
        totalDias: 22,
        diasTrabalhados: 21,
        horasTrabalhadas: 168,
        registros: [
          { data: '01/03/2025', entrada: '08:00', saida: '17:00', intervalo: '12:00-13:00', horasExtras: '00:00', observacoes: 'Normal' },
          { data: '02/03/2025', entrada: '08:15', saida: '17:30', intervalo: '12:00-13:00', horasExtras: '00:30', observacoes: 'Hora extra autorizada' },
          { data: '03/03/2025', entrada: '08:00', saida: '16:30', intervalo: '12:00-13:00', horasExtras: '00:00', observacoes: 'Saída antecipada autorizada' },
          // Dados truncados para brevidade
        ]
      }
    },
    {
      id: 1002,
      nome: 'Banco de Horas - Fevereiro 2025',
      tipo: 'BANCO DE HORAS',
      data: '28/02/2025',
      geradoPor: 'Administrador',
      formato: 'EXCEL',
      corTipo: 'blue',
      corFormato: 'green',
      conteudo: {
        departamento: 'Todos',
        periodo: '01/02/2025 a 28/02/2025',
        registros: [
          { funcionario: 'João Silva', saldoAnterior: '12:30', creditosPeriodo: '08:45', debitosPeriodo: '04:00', saldoAtual: '17:15' },
          { funcionario: 'Maria Oliveira', saldoAnterior: '05:15', creditosPeriodo: '03:30', debitosPeriodo: '06:00', saldoAtual: '02:45' },
          { funcionario: 'Carlos Pereira', saldoAnterior: '00:00', creditosPeriodo: '07:15', debitosPeriodo: '02:00', saldoAtual: '05:15' },
          // Dados truncados para brevidade
        ]
      }
    },
    {
      id: 1003,
      nome: 'Ausências - Janeiro 2025',
      tipo: 'AUSÊNCIAS',
      data: '15/02/2025',
      geradoPor: 'Administrador',
      formato: 'CSV',
      corTipo: 'red',
      corFormato: 'yellow',
      conteudo: {
        departamento: 'Todos',
        periodo: '01/01/2025 a 31/01/2025',
        registros: [
          { funcionario: 'Ana Souza', departamento: 'Marketing', tipoAusencia: 'Atestado Médico', dataInicio: '10/01/2025', dataFim: '12/01/2025', totalDias: 3, justificado: 'Sim' },
          { funcionario: 'Pedro Santos', departamento: 'Vendas', tipoAusencia: 'Falta', dataInicio: '15/01/2025', dataFim: '15/01/2025', totalDias: 1, justificado: 'Não' },
          { funcionario: 'Maria Oliveira', departamento: 'RH', tipoAusencia: 'Licença', dataInicio: '20/01/2025', dataFim: '25/01/2025', totalDias: 6, justificado: 'Sim' },
          // Dados truncados para brevidade
        ]
      }
    }
  ]);
  
  // Relatórios agendados (simulação de dados)
  const [relatoriosAgendados, setRelatoriosAgendados] = useState([
    {
      id: 501,
      nome: 'Espelho de Ponto - Mensal',
      tipo: 'ESPELHO',
      frequencia: 'MENSAL',
      diaExecucao: 1,
      horario: '08:00',
      destinatarios: ['admin@empresa.com', 'rh@empresa.com'],
      ativo: true,
      departamentos: [],
      funcionarios: []
    },
    {
      id: 502,
      nome: 'Banco de Horas - Semanal',
      tipo: 'BANCO DE HORAS',
      frequencia: 'SEMANAL',
      diaExecucao: 5, // 5 = sexta-feira
      horario: '18:00',
      destinatarios: ['admin@empresa.com', 'rh@empresa.com', 'gerentes@empresa.com'],
      ativo: true,
      departamentos: [],
      funcionarios: []
    }
  ]);
  
  // Função para gerar relatório
  const gerarRelatorio = (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!filtros.dataInicio || !filtros.dataFim) {
      alert('Por favor, preencha as datas de início e fim.');
      return;
    }
    
    // Abrir o componente de geração de relatório
    setMostrarRelatorio(true);
  };
  
  // Função para visualizar relatório
  const visualizarRelatorio = (relatorio) => {
    setRelatorioVisualizado(relatorio);
  };
  
  // Função para fazer download de relatório (simulação)
  const downloadRelatorio = (relatorio) => {
    alert(`Download do relatório "${relatorio.nome}" iniciado.`);
  };
  
  // Função para adicionar novo agendamento
  const adicionarAgendamento = (novoAgendamento) => {
    setRelatoriosAgendados([...relatoriosAgendados, {
      ...novoAgendamento,
      id: Math.max(...relatoriosAgendados.map(a => a.id)) + 1,
      ativo: true
    }]);
    setMostrarNovoAgendamento(false);
  };
  
  // Função para atualizar agendamento existente
  const atualizarAgendamento = (agendamentoAtualizado) => {
    setRelatoriosAgendados(relatoriosAgendados.map(agendamento => 
      agendamento.id === agendamentoAtualizado.id ? agendamentoAtualizado : agendamento
    ));
    setAgendamentoEditado(null);
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
              {relatoriosRecentes.map(relatorio => (
                <tr key={relatorio.id} className="border-b border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                  <td className="px-4 py-3">{relatorio.nome}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs bg-${relatorio.corTipo}-600`}>
                      {relatorio.tipo}
                    </span>
                  </td>
                  <td className="px-4 py-3">{relatorio.data}</td>
                  <td className="px-4 py-3">{relatorio.geradoPor}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs bg-${relatorio.corFormato}-600`}>
                      {relatorio.formato}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      className="bg-purple-600 hover:bg-purple-700 text-white text-xs px-2 py-1 rounded-md mr-2"
                      onClick={() => downloadRelatorio(relatorio)}
                    >
                      Download
                    </button>
                    <button 
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded-md"
                      onClick={() => visualizarRelatorio(relatorio)}
                    >
                      Visualizar
                    </button>
                  </td>
                </tr>
              ))}
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
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-3 py-1 rounded-md flex items-center"
              onClick={() => setMostrarNovoAgendamento(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Novo Agendamento
            </button>
          </div>
          
          <div className="space-y-3">
            {relatoriosAgendados.map(agendamento => (
              <div key={agendamento.id} className="bg-purple-800 bg-opacity-40 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <p className="font-medium">{agendamento.nome}</p>
                  <p className="text-sm text-purple-300">
                    {agendamento.frequencia === 'MENSAL' 
                      ? `Todo dia ${agendamento.diaExecucao} às ${agendamento.horario}` 
                      : agendamento.frequencia === 'SEMANAL'
                        ? `Toda ${agendamento.diaExecucao === 1 ? 'segunda' : 
                            agendamento.diaExecucao === 2 ? 'terça' : 
                            agendamento.diaExecucao === 3 ? 'quarta' : 
                            agendamento.diaExecucao === 4 ? 'quinta' : 
                            agendamento.diaExecucao === 5 ? 'sexta' : 
                            agendamento.diaExecucao === 6 ? 'sábado' : 'domingo'}-feira às ${agendamento.horario}`
                        : `Todos os dias às ${agendamento.horario}`}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs bg-${agendamento.ativo ? 'green' : 'gray'}-600`}>
                    {agendamento.ativo ? 'ATIVO' : 'INATIVO'}
                  </span>
                  <button 
                    className="text-purple-300 hover:text-white"
                    onClick={() => setAgendamentoEditado(agendamento)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
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
      
      {/* Modal de visualização de relatório */}
      {relatorioVisualizado && (
        <VisualizadorRelatorio 
          relatorio={relatorioVisualizado} 
          onClose={() => setRelatorioVisualizado(null)}
        />
      )}
      
      {/* Modal de novo agendamento */}
      {mostrarNovoAgendamento && (
        <FormularioAgendamento 
          onSave={adicionarAgendamento}
          onCancel={() => setMostrarNovoAgendamento(false)}
          departamentos={departamentos}
          funcionarios={funcionarios}
        />
      )}
      
      {/* Modal de edição de agendamento */}
      {agendamentoEditado && (
        <FormularioAgendamento 
          agendamento={agendamentoEditado}
          onSave={atualizarAgendamento}
          onCancel={() => setAgendamentoEditado(null)}
          departamentos={departamentos}
          funcionarios={funcionarios}
        />
      )}
      
      {/* Modal de geração de relatório */}
      {mostrarRelatorio && (
        <RelatorioGenerator 
          tipoRelatorio={tipoRelatorio}
          filtros={filtros}
          funcionarios={funcionarios}
          departamentos={departamentos}
          onClose={() => setMostrarRelatorio(false)}
        />
      )}
    </div>
  );
};

// Componente de Visualização de Relatório
const VisualizadorRelatorio = ({ relatorio, onClose }) => {
  // Gera o conteúdo baseado no tipo de relatório
  const renderConteudoRelatorio = () => {
    switch(relatorio.tipo) {
      case 'ESPELHO':
        return renderEspelhoPonto();
      case 'BANCO DE HORAS':
        return renderBancoHoras();
      case 'AUSÊNCIAS':
        return renderAusencias();
      default:
        return <p className="text-center py-8">Conteúdo não disponível</p>;
    }
  };
  
  const renderEspelhoPonto = () => {
    const { conteudo } = relatorio;
    return (
      <div className="p-4">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-bold mb-2">Dados do Relatório</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p><span className="font-semibold">Funcionário:</span> {conteudo.funcionario}</p>
              <p><span className="font-semibold">Departamento:</span> {conteudo.departamento}</p>
            </div>
            <div>
              <p><span className="font-semibold">Período:</span> {conteudo.periodo}</p>
              <p><span className="font-semibold">Total dias trabalhados:</span> {conteudo.diasTrabalhados} de {conteudo.totalDias}</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-purple-900 bg-opacity-50">
                <th className="px-2 py-2 text-left">Data</th>
                <th className="px-2 py-2 text-left">Entrada</th>
                <th className="px-2 py-2 text-left">Saída</th>
                <th className="px-2 py-2 text-left">Intervalo</th>
                <th className="px-2 py-2 text-left">Horas Extras</th>
                <th className="px-2 py-2 text-left">Observações</th>
              </tr>
            </thead>
            <tbody>
              {conteudo.registros.map((registro, index) => (
                <tr key={index} className={`border-b border-purple-700 ${index % 2 === 0 ? 'bg-purple-900 bg-opacity-20' : ''}`}>
                  <td className="px-2 py-2">{registro.data}</td>
                  <td className="px-2 py-2">{registro.entrada}</td>
                  <td className="px-2 py-2">{registro.saida}</td>
                  <td className="px-2 py-2">{registro.intervalo}</td>
                  <td className="px-2 py-2">{registro.horasExtras}</td>
                  <td className="px-2 py-2">{registro.observacoes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex justify-end">
          <p className="font-bold">Total Horas Trabalhadas: {conteudo.horasTrabalhadas}h</p>
        </div>
      </div>
    );
  };
  
  const renderBancoHoras = () => {
    const { conteudo } = relatorio;
    return (
      <div className="p-4">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-bold mb-2">Dados do Relatório</h3>
          <div>
            <p><span className="font-semibold">Departamento:</span> {conteudo.departamento}</p>
            <p><span className="font-semibold">Período:</span> {conteudo.periodo}</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-purple-900 bg-opacity-50">
                <th className="px-2 py-2 text-left">Funcionário</th>
                <th className="px-2 py-2 text-left">Saldo Anterior</th>
                <th className="px-2 py-2 text-left">Créditos no Período</th>
                <th className="px-2 py-2 text-left">Débitos no Período</th>
                <th className="px-2 py-2 text-left">Saldo Atual</th>
              </tr>
            </thead>
            <tbody>
              {conteudo.registros.map((registro, index) => (
                <tr key={index} className={`border-b border-purple-700 ${index % 2 === 0 ? 'bg-purple-900 bg-opacity-20' : ''}`}>
                  <td className="px-2 py-2">{registro.funcionario}</td>
                  <td className="px-2 py-2">{registro.saldoAnterior}</td>
                  <td className="px-2 py-2">{registro.creditosPeriodo}</td>
                  <td className="px-2 py-2">{registro.debitosPeriodo}</td>
                  <td className="px-2 py-2 font-semibold">{registro.saldoAtual}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  const renderAusencias = () => {
    const { conteudo } = relatorio;
    return (
      <div className="p-4">
        <div className="bg-white bg-opacity-10 p-4 rounded-lg mb-4">
          <h3 className="text-lg font-bold mb-2">Dados do Relatório</h3>
          <div>
            <p><span className="font-semibold">Departamento:</span> {conteudo.departamento}</p>
            <p><span className="font-semibold">Período:</span> {conteudo.periodo}</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-purple-900 bg-opacity-50">
                <th className="px-2 py-2 text-left">Funcionário</th>
                <th className="px-2 py-2 text-left">Departamento</th>
                <th className="px-2 py-2 text-left">Tipo de Ausência</th>
                <th className="px-2 py-2 text-left">Data Início</th>
                <th className="px-2 py-2 text-left">Data Fim</th>
                <th className="px-2 py-2 text-left">Total de Dias</th>
                <th className="px-2 py-2 text-left">Justificado</th>
              </tr>
            </thead>
            <tbody>
              {conteudo.registros.map((registro, index) => (
                <tr key={index} className={`border-b border-purple-700 ${index % 2 === 0 ? 'bg-purple-900 bg-opacity-20' : ''}`}>
                  <td className="px-2 py-2">{registro.funcionario}</td>
                  <td className="px-2 py-2">{registro.departamento}</td>
                  <td className="px-2 py-2">{registro.tipoAusencia}</td>
                  <td className="px-2 py-2">{registro.dataInicio}</td>
                  <td className="px-2 py-2">{registro.dataFim}</td>
                  <td className="px-2 py-2">{registro.totalDias}</td>
                  <td className="px-2 py-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${registro.justificado === 'Sim' ? 'bg-green-600' : 'bg-red-600'}`}>
                      {registro.justificado}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-800 bg-opacity-95 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-purple-700">
          <div>
            <h2 className="text-xl font-bold">{relatorio.nome}</h2>
            <p className="text-sm text-purple-300">Gerado em {relatorio.data} por {relatorio.geradoPor}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-block px-2 py-1 rounded-full text-xs bg-${relatorio.corTipo}-600`}>{relatorio.tipo}</span>
            <span className={`inline-block px-2 py-1 rounded-full text-xs bg-${relatorio.corFormato}-600`}>{relatorio.formato}</span>
            <button 
              onClick={onClose}
              className="ml-4 text-purple-300 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderConteudoRelatorio()}
        </div>
        
        <div className="p-4 border-t border-purple-700 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md mr-2"
          >
            Fechar
          </button>
          <button 
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>
  );
};
// Componente de Formulário de Agendamento
const FormularioAgendamento = ({ agendamento = null, onSave, onCancel, departamentos, funcionarios }) => {
  const [formData, setFormData] = useState(agendamento || {
    nome: '',
    tipo: 'ESPELHO',
    frequencia: 'MENSAL',
    diaExecucao: 1,
    horario: '08:00',
    destinatarios: [''],
    ativo: true,
    departamentos: [],
    funcionarios: []
  });
  
  const [destinatarioTemp, setDestinatarioTemp] = useState('');
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleFrequenciaChange = (e) => {
    const frequencia = e.target.value;
    // Ajustar diaExecucao baseado na frequência
    let diaExecucao = formData.diaExecucao;
    if (frequencia === 'MENSAL' && diaExecucao > 28) {
      diaExecucao = 28;
    } else if (frequencia === 'SEMANAL' && diaExecucao > 7) {
      diaExecucao = 1;
    }
    
    setFormData({ ...formData, frequencia, diaExecucao });
  };
  
  const adicionarDestinatario = () => {
    if (destinatarioTemp && !formData.destinatarios.includes(destinatarioTemp)) {
      setFormData({
        ...formData,
        destinatarios: [...formData.destinatarios, destinatarioTemp]
      });
      setDestinatarioTemp('');
    }
  };
  
  const removerDestinatario = (index) => {
    const novosDestinatarios = [...formData.destinatarios];
    novosDestinatarios.splice(index, 1);
    setFormData({ ...formData, destinatarios: novosDestinatarios });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-800 bg-opacity-95 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-purple-700">
          <h2 className="text-xl font-bold">
            {agendamento ? 'Editar Agendamento' : 'Novo Agendamento de Relatório'}
          </h2>
          <button 
            onClick={onCancel}
            className="text-purple-300 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-150px)] p-4">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-purple-300 mb-1">Nome do Agendamento *</label>
                <input 
                  type="text" 
                  name="nome"
                  className="w-full bg-purple-900 border border-purple-700 rounded-md p-2 text-white"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Espelho de Ponto - Mensal"
                />
              </div>
              
              <div>
                <label className="block text-sm text-purple-300 mb-1">Tipo de Relatório *</label>
                <select 
                  name="tipo"
                  className="w-full bg-purple-900 border border-purple-700 rounded-md p-2 text-white"
                  value={formData.tipo}
                  onChange={handleChange}
                  required
                >
                  <option value="ESPELHO">Espelho de Ponto</option>
                  <option value="AUSÊNCIAS">Ausências</option>
                  <option value="MARCAÇÕES">Marcações por Dia</option>
                  <option value="BANCO DE HORAS">Banco de Horas</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-purple-300 mb-1">Frequência *</label>
                <select 
                  name="frequencia"
                  className="w-full bg-purple-900 border border-purple-700 rounded-md p-2 text-white"
                  value={formData.frequencia}
                  onChange={handleFrequenciaChange}
                  required
                >
                  <option value="DIÁRIO">Diário</option>
                  <option value="SEMANAL">Semanal</option>
                  <option value="MENSAL">Mensal</option>
                </select>
              </div>
              
              <div>
                {formData.frequencia === 'MENSAL' ? (
                  <>
                    <label className="block text-sm text-purple-300 mb-1">Dia do Mês *</label>
                    <select 
                      name="diaExecucao"
                      className="w-full bg-purple-900 border border-purple-700 rounded-md p-2 text-white"
                      value={formData.diaExecucao}
                      onChange={handleChange}
                    >
                      {[...Array(28)].map((_, i) => (
                        <option key={i+1} value={i+1}>{i+1}</option>
                      ))}
                    </select>
                  </>
                ) : formData.frequencia === 'SEMANAL' ? (
                  <>
                    <label className="block text-sm text-purple-300 mb-1">Dia da Semana *</label>
                    <select 
                      name="diaExecucao"
                      className="w-full bg-purple-900 border border-purple-700 rounded-md p-2 text-white"
                      value={formData.diaExecucao}
                      onChange={handleChange}
                    >
                      <option value="1">Segunda-feira</option>
                      <option value="2">Terça-feira</option>
                      <option value="3">Quarta-feira</option>
                      <option value="4">Quinta-feira</option>
                      <option value="5">Sexta-feira</option>
                      <option value="6">Sábado</option>
                      <option value="0">Domingo</option>
                    </select>
                  </>
                ) : (
                  <div className="flex items-center h-full">
                    <p className="text-purple-300">Execução diária</p>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm text-purple-300 mb-1">Horário *</label>
                <input 
                  type="time" 
                  name="horario"
                  className="w-full bg-purple-900 border border-purple-700 rounded-md p-2 text-white"
                  value={formData.horario}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm text-purple-300 mb-1">Status</label>
                <div className="flex space-x-4 mt-2">
                  <label className="inline-flex items-center">
                    <input 
                      type="radio" 
                      name="ativo" 
                      checked={formData.ativo}
                      onChange={() => setFormData({...formData, ativo: true})}
                      className="form-radio h-4 w-4 text-purple-600"
                    />
                    <span className="ml-2">Ativo</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input 
                      type="radio" 
                      name="ativo" 
                      checked={!formData.ativo}
                      onChange={() => setFormData({...formData, ativo: false})}
                      className="form-radio h-4 w-4 text-purple-600"
                    />
                    <span className="ml-2">Inativo</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-purple-300 mb-1">Destinatários *</label>
              <div className="flex space-x-2 mb-2">
                <input 
                  type="email" 
                  className="flex-1 bg-purple-900 border border-purple-700 rounded-md p-2 text-white"
                  value={destinatarioTemp}
                  onChange={(e) => setDestinatarioTemp(e.target.value)}
                  placeholder="email@exemplo.com"
                />
                <button 
                  type="button"
                  onClick={adicionarDestinatario}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-md"
                >
                  Adicionar
                </button>
              </div>
              
              <div className="bg-purple-900 bg-opacity-40 rounded-md p-2">
                {formData.destinatarios.length > 0 ? (
                  <div className="flex flex-wrap">
                    {formData.destinatarios.map((email, index) => (
                      <div key={index} className="flex items-center bg-purple-700 rounded-full px-3 py-1 text-sm text-white m-1">
                        <span>{email}</span>
                        <button 
                          type="button"
                          onClick={() => removerDestinatario(index)}
                          className="ml-2 text-purple-300 hover:text-white"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-purple-300 text-sm italic">Nenhum destinatário adicionado</p>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-purple-300 mb-1">Departamentos (opcional)</label>
                <select 
                  multiple
                  className="w-full bg-purple-900 border border-purple-700 rounded-md p-2 text-white h-28"
                  value={formData.departamentos}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({...formData, departamentos: selected});
                  }}
                >
                  {departamentos.map(departamento => (
                    <option key={departamento.id} value={departamento.id}>{departamento.nome}</option>
                  ))}
                </select>
                <p className="text-xs text-purple-300 mt-1">Ctrl+Click para selecionar múltiplos. Deixe em branco para todos.</p>
              </div>
              
              <div>
                <label className="block text-sm text-purple-300 mb-1">Funcionários (opcional)</label>
                <select 
                  multiple
                  className="w-full bg-purple-900 border border-purple-700 rounded-md p-2 text-white h-28"
                  value={formData.funcionarios}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({...formData, funcionarios: selected});
                  }}
                >
                  {funcionarios.map(funcionario => (
                    <option key={funcionario.id} value={funcionario.id}>{funcionario.nome}</option>
                  ))}
                </select>
                <p className="text-xs text-purple-300 mt-1">Ctrl+Click para selecionar múltiplos. Deixe em branco para todos.</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <button 
                type="button"
                onClick={onCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md"
              >
                {agendamento ? 'Atualizar' : 'Salvar'} Agendamento
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RelatoriosTab;