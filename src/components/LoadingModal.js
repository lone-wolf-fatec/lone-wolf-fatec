import React, { useState, useEffect } from 'react';

// Modal de Carregamento
export const LoadingModal = ({ progress, onComplete }) => {
  const [currentProgress, setCurrentProgress] = useState(0);
  
  useEffect(() => {
    if (progress >= 100) {
      const timer = setTimeout(() => {
        onComplete();
      }, 500);
      return () => clearTimeout(timer);
    }
    setCurrentProgress(progress);
  }, [progress, onComplete]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-800 bg-opacity-95 rounded-lg shadow-xl w-full max-w-md p-6 text-center">
        <div className="flex justify-center mb-4">
          <svg className="animate-spin h-12 w-12 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-4">Gerando Relatório</h2>
        <div className="relative w-full h-4 bg-purple-900 bg-opacity-40 rounded-full mb-2">
          <div 
            className="absolute top-0 left-0 h-4 bg-purple-500 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${currentProgress}%` }}
          ></div>
        </div>
        <p className="text-purple-300">{currentProgress}% concluído</p>
      </div>
    </div>
  );
};

// Modal de Relatório Gerado
export const RelatorioGeradoModal = ({ relatorio, onClose, onDownload }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-800 bg-opacity-95 rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-center mb-4">
          <div className="bg-green-500 rounded-full p-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h2 className="text-xl font-bold text-center mb-4">Relatório Gerado</h2>
        <p className="text-center text-green-400 mb-4 font-medium">Relatório gerado com sucesso!</p>
        
        <div className="bg-purple-900 bg-opacity-40 p-4 rounded-lg mb-4">
          <p><span className="font-semibold">Nome:</span> {relatorio.nome}</p>
          <p><span className="font-semibold">Tipo:</span> {relatorio.tipo}</p>
          <p><span className="font-semibold">Período:</span> {relatorio.periodo}</p>
          <p><span className="font-semibold">Formato:</span> {relatorio.formato.toUpperCase()}</p>
          <p><span className="font-semibold">Data Geração:</span> {relatorio.dataGeracao}</p>
        </div>
        
        <div className="flex justify-center space-x-4">
          <button 
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md"
          >
            Fechar
          </button>
          <button 
            onClick={onDownload}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar {relatorio.formato.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal de Visualização Prévia do PDF
export const PDFPreviewModal = ({ relatorio, onClose, onDownload }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-800 bg-opacity-95 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-purple-700">
          <h2 className="text-xl font-bold">{relatorio.nome} - Visualização</h2>
          <button 
            onClick={onClose}
            className="text-purple-300 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-grow overflow-auto p-4 bg-white">
          {/* Simulação da visualização de PDF */}
          <div className="bg-white text-black p-8 min-h-[600px] rounded shadow-inner">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold mb-2">{relatorio.nome}</h1>
              <p className="text-gray-600">Gerado em {relatorio.dataGeracao}</p>
            </div>
            
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p><span className="font-semibold">Tipo:</span> {relatorio.tipo}</p>
                  <p><span className="font-semibold">Período:</span> {relatorio.periodo}</p>
                </div>
                <div>
                  <p><span className="font-semibold">Formato:</span> {relatorio.formato.toUpperCase()}</p>
                  <p><span className="font-semibold">Gerado por:</span> Administrador</p>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3 border-b border-gray-300 pb-2">Conteúdo do Relatório</h2>
              
              {relatorio.tipoRelatorio === 'espelho' && (
                <>
                  <table className="w-full border-collapse mb-4">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 px-4 py-2 text-left">Data</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Entrada</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Saída</th>
                        <th className="border border-gray-300 px-4 py-2 text-left">Horas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorio.periodo.split(' a ').map((data, idx) => (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-gray-50' : ''}>
                          <td className="border border-gray-300 px-4 py-2">{data}</td>
                          <td className="border border-gray-300 px-4 py-2">{idx === 0 ? '08:00' : '08:15'}</td>
                          <td className="border border-gray-300 px-4 py-2">{idx === 0 ? '17:00' : '17:15'}</td>
                          <td className="border border-gray-300 px-4 py-2">{idx === 0 ? '8h' : '8h15'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="text-right font-semibold">Total de Horas: 16h15</p>
                </>
              )}
              
              {relatorio.tipoRelatorio === 'bancoHoras' && (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Funcionário</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Saldo Anterior</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Créditos</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Débitos</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Saldo Atual</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">João Silva</td>
                      <td className="border border-gray-300 px-4 py-2">12:30</td>
                      <td className="border border-gray-300 px-4 py-2">08:45</td>
                      <td className="border border-gray-300 px-4 py-2">04:00</td>
                      <td className="border border-gray-300 px-4 py-2">17:15</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Maria Oliveira</td>
                      <td className="border border-gray-300 px-4 py-2">05:15</td>
                      <td className="border border-gray-300 px-4 py-2">03:30</td>
                      <td className="border border-gray-300 px-4 py-2">06:00</td>
                      <td className="border border-gray-300 px-4 py-2">02:45</td>
                    </tr>
                  </tbody>
                </table>
              )}
              
              {(relatorio.tipoRelatorio === 'ausencias' || relatorio.tipoRelatorio === 'marcacoes') && (
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left">Funcionário</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Departamento</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Data Início</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Data Fim</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Ana Souza</td>
                      <td className="border border-gray-300 px-4 py-2">Marketing</td>
                      <td className="border border-gray-300 px-4 py-2">Atestado Médico</td>
                      <td className="border border-gray-300 px-4 py-2">{relatorio.periodo.split(' a ')[0]}</td>
                      <td className="border border-gray-300 px-4 py-2">{relatorio.periodo.split(' a ')[1]}</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-purple-700 flex justify-center">
          <button 
            onClick={onDownload}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar {relatorio.formato.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente para escolher o formato
export const RelatorioGenerator = ({ tipoRelatorio, filtros, funcionarios, departamentos, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [relatorioGerado, setRelatorioGerado] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const formatoTipoRelatorio = 
    tipoRelatorio === 'espelho' ? 'Espelho de Ponto' :
    tipoRelatorio === 'ausencias' ? 'Relatório de Ausências' :
    tipoRelatorio === 'marcacoes' ? 'Marcações por Dia' :
    'Relatório de Banco de Horas';
    
  const formatoTexto = filtros.formato === 'pdf' ? 'PDF' : 
                      filtros.formato === 'excel' ? 'Excel' : 'CSV';
  
  // Simulação de geração de relatório com progresso
  useEffect(() => {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    
    let simulatedProgress = 0;
    const interval = setInterval(() => {
      simulatedProgress += Math.floor(Math.random() * 10) + 1;
      if (simulatedProgress > 100) simulatedProgress = 100;
      setProgress(simulatedProgress);
      
      if (simulatedProgress === 100) {
        clearInterval(interval);
        
        // Criar objeto de relatório
        const relatorio = {
          nome: `${formatoTipoRelatorio} - ${formattedDate}`,
          tipo: formatoTipoRelatorio,
          periodo: `${filtros.dataInicio} a ${filtros.dataFim}`,
          formato: filtros.formato,
          dataGeracao: formattedDate,
          tipoRelatorio: tipoRelatorio
        };
        
        setTimeout(() => {
          setRelatorioGerado(relatorio);
          setLoading(false);
        }, 500);
      }
    }, 300);
    
    return () => clearInterval(interval);
  }, [tipoRelatorio, filtros]);
  
  const handleLoadingComplete = () => {
    // Este método é chamado quando o carregamento estiver concluído
  };
  
  const handleDownload = () => {
    if (!relatorioGerado) return;
    
    const { formato } = relatorioGerado;
    
    // Simulação de download baseado no formato
    if (formato === 'pdf') {
      alert(`Download do relatório em PDF iniciado.`);
    } else if (formato === 'excel') {
      alert(`Download do relatório em Excel iniciado.`);
    } else if (formato === 'csv') {
      alert(`Download do relatório em CSV iniciado.`);
    }
    
    // Após o download, mostrar visualização para PDF
    if (formato === 'pdf') {
      setShowPreview(true);
    }
  };
  
  const handleClosePreview = () => {
    setShowPreview(false);
  };
  
  return (
    <>
      {loading && (
        <LoadingModal progress={progress} onComplete={handleLoadingComplete} />
      )}
      
      {!loading && relatorioGerado && !showPreview && (
        <RelatorioGeradoModal 
          relatorio={relatorioGerado}
          onClose={onClose}
          onDownload={handleDownload}
        />
      )}
      
      {showPreview && (
        <PDFPreviewModal 
          relatorio={relatorioGerado}
          onClose={handleClosePreview}
          onDownload={handleDownload}
        />
      )}
    </>
  );
};