import React from 'react';

const FileViewer = ({ fileType, fileName, relatorioData, onClose }) => {
  const renderFileContent = () => {
    switch (fileType) {
      case 'pdf':
        return (
          <div className="bg-white text-black p-6 rounded-lg">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">{fileName}</h1>
              <p className="text-gray-600">Formato: PDF</p>
            </div>
            
            <div className="border-b border-gray-300 pb-4 mb-4">
              <h2 className="text-xl font-bold mb-2">Dados do Relatório</h2>
              <div className="grid grid-cols-2 gap-2">
                <p><strong>Funcionário:</strong> {relatorioData.funcionario}</p>
                <p><strong>Departamento:</strong> {relatorioData.departamento}</p>
                <p><strong>Período:</strong> {relatorioData.periodo}</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-left">Data</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Entrada</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Saída</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Intervalo</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Horas Extras</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorioData.registros.map((registro, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="border border-gray-300 px-4 py-2">{registro.data}</td>
                      <td className="border border-gray-300 px-4 py-2">{registro.entrada}</td>
                      <td className="border border-gray-300 px-4 py-2">{registro.saida}</td>
                      <td className="border border-gray-300 px-4 py-2">{registro.intervalo}</td>
                      <td className="border border-gray-300 px-4 py-2">{registro.horasExtras}</td>
                      <td className="border border-gray-300 px-4 py-2">{registro.observacoes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'excel':
        return (
          <div className="bg-green-50 text-black p-6 rounded-lg">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">{fileName}</h1>
              <p className="text-green-700">Formato: Excel</p>
            </div>
            
            <div className="border-b border-green-300 pb-4 mb-4">
              <h2 className="text-xl font-bold mb-2">Planilha Excel</h2>
              <div className="grid grid-cols-2 gap-2">
                <p><strong>Funcionário:</strong> {relatorioData.funcionario}</p>
                <p><strong>Departamento:</strong> {relatorioData.departamento}</p>
                <p><strong>Período:</strong> {relatorioData.periodo}</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-green-200">
                    <th className="border border-green-400 px-4 py-2 text-left">Data</th>
                    <th className="border border-green-400 px-4 py-2 text-left">Entrada</th>
                    <th className="border border-green-400 px-4 py-2 text-left">Saída</th>
                    <th className="border border-green-400 px-4 py-2 text-left">Intervalo</th>
                    <th className="border border-green-400 px-4 py-2 text-left">Horas Extras</th>
                    <th className="border border-green-400 px-4 py-2 text-left">Observações</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorioData.registros.map((registro, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-green-100' : 'bg-white'}>
                      <td className="border border-green-400 px-4 py-2">{registro.data}</td>
                      <td className="border border-green-400 px-4 py-2">{registro.entrada}</td>
                      <td className="border border-green-400 px-4 py-2">{registro.saida}</td>
                      <td className="border border-green-400 px-4 py-2">{registro.intervalo}</td>
                      <td className="border border-green-400 px-4 py-2">{registro.horasExtras}</td>
                      <td className="border border-green-400 px-4 py-2">{registro.observacoes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
        
      case 'csv':
        return (
          <div className="bg-yellow-50 text-black p-6 rounded-lg font-mono">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold">{fileName}</h1>
              <p className="text-yellow-700">Formato: CSV</p>
            </div>
            
            <div className="overflow-x-auto bg-white p-4 border border-yellow-300 rounded">
              <p>Data,Entrada,Saída,Intervalo,Horas Extras,Observações</p>
              {relatorioData.registros.map((registro, index) => (
                <p key={index}>
                  {registro.data},{registro.entrada},{registro.saida},{registro.intervalo},{registro.horasExtras},"{registro.observacoes}"
                </p>
              ))}
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p>Funcionário: {relatorioData.funcionario}</p>
              <p>Departamento: {relatorioData.departamento}</p>
              <p>Período: {relatorioData.periodo}</p>
            </div>
          </div>
        );
        
      default:
        return <p className="text-center py-8">Formato não suportado</p>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-800 bg-opacity-95 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-purple-700">
          <h2 className="text-xl font-bold">{fileName}</h2>
          <button 
            onClick={onClose}
            className="text-purple-300 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderFileContent()}
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

export default FileViewer;