import React, { useState, useEffect } from 'react';

// Componente FileViewer - Visualizador de Arquivos
const FileViewer = ({ fileType, fileName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [fileData, setFileData] = useState(null);
  
  // Inicia download automaticamente ao abrir o componente
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + Math.floor(Math.random() * 10);
        if (newProgress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setFileData(true);
            setLoading(false);
          }, 500);
          return 100;
        }
        return newProgress;
      });
    }, 200);
    
    return () => clearInterval(interval);
  }, []);
  
  // Função para download direto
  const handleDirectDownload = () => {
    alert(`Download iniciado: ${fileName}`);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-purple-900 rounded-lg shadow-lg w-11/12 max-w-4xl max-h-5/6 flex flex-col">
        <div className="p-4 border-b border-purple-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">{fileName}</h2>
          <button 
            onClick={onClose}
            className="text-purple-300 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-full max-w-md bg-purple-800 rounded-full h-4 mb-4">
                <div 
                  className="bg-purple-500 h-4 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-center text-purple-300">Carregando {progress}%</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {fileType === 'pdf' && (
                <div className="flex flex-col flex-1">
                  <div className="bg-white rounded-lg p-4 flex-1 min-h-64 mb-4 flex flex-col">
                    <div className="h-8 bg-gray-200 rounded-t mb-2 flex items-center px-2">
                      <div className="flex space-x-1">
                        <div className="h-3 w-3 rounded-full bg-red-500"></div>
                        <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                        <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      </div>
                      <div className="text-center flex-1 text-gray-700 text-sm font-medium">
                        {fileName} - Visualização PDF
                      </div>
                    </div>
                    
                    <div className="flex-1 border border-gray-300 rounded-b overflow-hidden relative">
                      <div className="absolute inset-0 p-4 overflow-auto">
                        <div className="bg-gray-100 p-4 font-serif">
                          <h1 className="text-xl font-bold text-gray-900 mb-4 text-center">{fileName}</h1>
                          
                          <div className="space-y-4">
                            <div className="flex justify-between border-b border-gray-300 pb-2">
                              <span className="font-medium">Data do relatório:</span>
                              <span>{new Date().toLocaleDateString()}</span>
                            </div>
                            
                            <div className="border-b border-gray-300 pb-2">
                              <h2 className="font-medium mb-2">Resumo</h2>
                              <p className="text-gray-700 text-sm">
                                Este relatório contém informações referentes ao período especificado. 
                                Os dados apresentados foram processados conforme as configurações do sistema.
                              </p>
                            </div>
                            
                            <div className="border-b border-gray-300 pb-2">
                              <h2 className="font-medium mb-2">Detalhes</h2>
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-gray-200">
                                    <th className="p-1 text-left">Data</th>
                                    <th className="p-1 text-left">Entrada</th>
                                    <th className="p-1 text-left">Saída</th>
                                    <th className="p-1 text-left">Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr>
                                    <td className="p-1 border-b">10/04/2025</td>
                                    <td className="p-1 border-b">08:00</td>
                                    <td className="p-1 border-b">17:00</td>
                                    <td className="p-1 border-b">8h00</td>
                                  </tr>
                                  <tr>
                                    <td className="p-1 border-b">11/04/2025</td>
                                    <td className="p-1 border-b">08:15</td>
                                    <td className="p-1 border-b">17:30</td>
                                    <td className="p-1 border-b">8h15</td>
                                  </tr>
                                  <tr>
                                    <td className="p-1 border-b">12/04/2025</td>
                                    <td className="p-1 border-b">08:05</td>
                                    <td className="p-1 border-b">17:10</td>
                                    <td className="p-1 border-b">8h05</td>
                                  </tr>
                                </tbody>
                                <tfoot>
                                  <tr className="bg-gray-100">
                                    <td className="p-1 font-medium" colSpan="3">Total do período:</td>
                                    <td className="p-1 font-medium">24h20</td>
                                  </tr>
                                </tfoot>
                              </table>
                            </div>
                            
                            <div>
                              <h2 className="font-medium mb-2">Observações</h2>
                              <p className="text-gray-700 text-sm">
                                Este documento é uma simulação de relatório e não contém dados reais.
                                Para mais informações, entre em contato com o departamento de recursos humanos.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 flex justify-center">
                    <button 
                      onClick={handleDirectDownload}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Baixar Arquivo
                    </button>
                  </div>
                </div>
              )}
              
              {fileType === 'excel' && (
                <div className="bg-green-800 bg-opacity-30 p-8 rounded-lg text-center min-h-64 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-bold mb-2 text-white">Arquivo Excel Pronto</h3>
                  <p className="text-green-300 mb-4">O arquivo Excel não pode ser exibido diretamente no navegador.</p>
                </div>
              )}
              
              {fileType === 'csv' && (
                <div className="bg-yellow-800 bg-opacity-30 p-8 rounded-lg text-center min-h-64 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-xl font-bold mb-2 text-white">Arquivo CSV Pronto</h3>
                  <p className="text-yellow-300 mb-4">O arquivo CSV não pode ser exibido diretamente no navegador.</p>
                </div>
              )}
              
              <div className="mt-4 flex justify-center">
                <button 
                  onClick={handleDirectDownload}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Baixar Arquivo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de Demonstração
const Demo = () => {
  const [mostrarVisualizador, setMostrarVisualizador] = useState(false);
  const [formatoSelecionado, setFormatoSelecionado] = useState('pdf');
  
  const tiposRelatorio = [
    { id: 'espelho', nome: 'Espelho de Ponto' },
    { id: 'bancoHoras', nome: 'Banco de Horas' },
    { id: 'ausencias', nome: 'Ausências' }
  ];
  
  const formatoSaida = [
    { id: 'pdf', nome: 'PDF', cor: 'bg-red-600' },
    { id: 'excel', nome: 'Excel', cor: 'bg-green-600' },
    { id: 'csv', nome: 'CSV', cor: 'bg-yellow-600' }
  ];
  
  return (
    <div className="bg-purple-800 bg-opacity-40 p-6 rounded-lg text-white">
      <h1 className="text-2xl font-bold mb-6">Sistema de Relatórios</h1>
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Formato de Visualização</h2>
        <div className="flex space-x-4">
          {formatoSaida.map(formato => (
            <label key={formato.id} className="inline-flex items-center cursor-pointer">
              <input 
                type="radio" 
                name="formato" 
                value={formato.id} 
                checked={formatoSelecionado === formato.id}
                onChange={() => setFormatoSelecionado(formato.id)}
                className="form-radio h-5 w-5 text-purple-600"
              />
              <span className="ml-2">{formato.nome}</span>
            </label>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <button 
          onClick={() => setMostrarVisualizador(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Visualizar Relatório
        </button>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-3">Relatórios Recentes</h2>
        <div className="bg-purple-900 bg-opacity-30 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-purple-300 text-sm border-b border-purple-700">
                <th className="px-4 py-2 text-left">Relatório</th>
                <th className="px-4 py-2 text-left">Data</th>
                <th className="px-4 py-2 text-left">Formato</th>
                <th className="px-4 py-2 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {tiposRelatorio.map((tipo, index) => (
                <tr key={tipo.id} className="border-b border-purple-700 hover:bg-purple-700 hover:bg-opacity-30">
                  <td className="px-4 py-3">{tipo.nome} - Abril 2025</td>
                  <td className="px-4 py-3">15/04/2025</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${formatoSaida[index % 3].cor}`}>
                      {formatoSaida[index % 3].nome}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => setMostrarVisualizador(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded-md"
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
      
      {mostrarVisualizador && (
        <FileViewer 
          fileType={formatoSelecionado}
          fileName={`Relatório - ${new Date().toLocaleDateString()}`}
          onClose={() => setMostrarVisualizador(false)}
        />
      )}
    </div>
  );
};

export default Demo;