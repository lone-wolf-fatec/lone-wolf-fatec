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
        case 'MARCAÇÕES':
          return renderMarcacoesPorDia();
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
  const renderMarcacoesPorDia = () => {
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
                <th className="px-2 py-2 text-left">Data</th>
                <th className="px-2 py-2 text-left">Total de Marcações</th>
                <th className="px-2 py-2 text-left">Horas de Pico</th>
                <th className="px-2 py-2 text-left">Média de Atrasos</th>
                <th className="px-2 py-2 text-left">Observações</th>
              </tr>
            </thead>
            <tbody>
              {conteudo.registros.map((registro, index) => (
                <tr key={index} className={`border-b border-purple-700 ${index % 2 === 0 ? 'bg-purple-900 bg-opacity-20' : ''}`}>
                  <td className="px-2 py-2">{registro.data}</td>
                  <td className="px-2 py-2">{registro.total}</td>
                  <td className="px-2 py-2">{registro.horasPico}</td>
                  <td className="px-2 py-2">{registro.mediaAtrasos}</td>
                  <td className="px-2 py-2">{registro.observacoes}</td>
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

export default VisualizadorRelatorio;