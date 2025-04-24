import React, { useState, useEffect } from 'react';
import FileViewer from './FileViewer';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

const RelatorioGenerator = ({
  tipoRelatorio,
  filtros,
  funcionarios,
  departamentos,
  onClose
}) => {
  // Estado para controlar o progresso da geração do relatório
  const [progresso, setProgresso] = useState(0);
  const [gerando, setGerando] = useState(true);
  const [relatorioInfo, setRelatorioInfo] = useState(null);
  // Estado para controlar a exibição do visualizador de arquivo
  const [fileViewerState, setFileViewerState] = useState({
    isOpen: false,
    fileType: filtros.formato,
    fileName: '',
    fileUrl: ''
  });

  // Função para formatar o tipo de relatório para exibição
  const formatarTipoRelatorio = () => {
    switch(tipoRelatorio) {
      case 'espelho':
        return 'Espelho de Ponto';
      case 'ausencias':
        return 'Relatório de Ausências';
      case 'marcacoes':
        return 'Marcações por Dia';
      case 'bancoHoras':
        return 'Banco de Horas';
      default:
        return 'Relatório';
    }
  };

  // Prepara os dados do relatório baseado nos filtros
  const prepararDadosRelatorio = () => {
    // Busca o funcionário selecionado, se houver
    let funcionarioSelecionado = null;
    if (filtros.funcionario) {
      funcionarioSelecionado = funcionarios.find(f => f.id.toString() === filtros.funcionario.toString());
    }
    // Busca o departamento selecionado, se houver
    let departamentoSelecionado = null;
    if (filtros.departamento) {
      departamentoSelecionado = departamentos.find(d => d.id.toString() === filtros.departamento.toString());
    }
    // Função para formatar data
    const formatarData = (data) => {
      return data.toLocaleDateString('pt-BR');
    };
    // Definir dias de férias e feriados
    const diasFeriados = [
      '2025-01-01', // Ano Novo
      '2025-04-21', // Tiradentes
      '2025-05-01' // Dia do Trabalho
    ];
    const diasFerias = [
      {
        funcionario: 'João Silva',
        inicio: '2025-01-15',
        fim: '2025-01-30'
      },
      {
        funcionario: 'Maria Oliveira',
        inicio: '2025-02-10',
        fim: '2025-02-25'
      }
    ];
    // Gerar registros de trabalho
    const registros = [];
    const dataInicial = new Date(filtros.dataInicio);
    const dataFinal = new Date(filtros.dataFim);
    let currentDate = new Date(dataInicial);
    // Definir variações de horários
    const variacoesEntrada = [
      { hora: '07:45', tipo: 'Entrada antecipada' },
      { hora: '08:00', tipo: 'Entrada normal' },
      { hora: '08:15', tipo: 'Atraso leve' }
    ];
    const variacoesSaida = [
      { hora: '16:45', tipo: 'Saída antecipada' },
      { hora: '17:00', tipo: 'Saída normal' },
      { hora: '17:30', tipo: 'Hora extra' }
    ];
    while (currentDate <= dataFinal) {
      const dataFormatada = currentDate.toISOString().split('T')[0];
      const diaSemana = currentDate.getDay();
      // Pular fins de semana
      if (diaSemana !== 0 && diaSemana !== 6) {
        // Verificar se é feriado
        if (diasFeriados.includes(dataFormatada)) {
          registros.push({
            data: formatarData(currentDate),
            entrada: '-',
            saida: '-',
            intervaloAlmoco: '-',
            intervaloLanche: '-',
            horasExtras: '00:00',
            observacoes: 'Feriado'
          });
        }
        // Verificar se está em período de férias
        else if (diasFerias.some(f =>
          dataFormatada >= f.inicio &&
          dataFormatada <= f.fim
        )) {
          registros.push({
            data: formatarData(currentDate),
            entrada: '-',
            saida: '-',
            intervaloAlmoco: '-',
            intervaloLanche: '-',
            horasExtras: '00:00',
            observacoes: 'Férias'
          });
        }
        // Dia de trabalho normal
        else {
          // Selecionar variações de horário aleatoriamente
          const entradaEscolhida = variacoesEntrada[Math.floor(Math.random() * variacoesEntrada.length)];
          const saidaEscolhida = variacoesSaida[Math.floor(Math.random() * variacoesSaida.length)];
          registros.push({
            data: formatarData(currentDate),
            entrada: entradaEscolhida.hora,
            saida: saidaEscolhida.hora,
            intervaloAlmoco: '12:00-13:00',
            intervaloLanche: '10:30-10:45',
            horasExtras: saidaEscolhida.tipo === 'Hora extra' ? '00:30' : '00:00',
            observacoes: `${entradaEscolhida.tipo}, ${saidaEscolhida.tipo}`
          });
        }
      }
      // Avançar para o próximo dia
      currentDate.setDate(currentDate.getDate() + 1);
    }
    // Retorna informações adicionais para o relatório
    return {
      funcionario: funcionarioSelecionado ? funcionarioSelecionado.nome : "Todos os funcionários",
      departamento: departamentoSelecionado ? departamentoSelecionado.nome : "Todos os departamentos",
      periodo: `${dataInicial.toLocaleDateString('pt-BR')} a ${dataFinal.toLocaleDateString('pt-BR')}`,
      totalDias: registros.length,
      diasTrabalhados: registros.filter(r => r.observacoes !== 'Feriado' && r.observacoes !== 'Férias').length,
      horasTrabalhadas: registros.filter(r => r.observacoes !== 'Feriado' && r.observacoes !== 'Férias').length * 8,
      registros: registros
    };
  };

  // Função de download de relatórios
  const downloadRelatorio = () => {
    if (!relatorioInfo) return;
    const dadosRelatorio = relatorioInfo.dadosAdicionais;
    const nomeArquivo = relatorioInfo.nome.replace(/\s+/g, '_');
    switch(filtros.formato.toLowerCase()) {
      case 'pdf':
        gerarPDF(dadosRelatorio, nomeArquivo);
        break;
      case 'excel':
        gerarExcel(dadosRelatorio, nomeArquivo);
        break;
      case 'csv':
        gerarCSV(dadosRelatorio, nomeArquivo);
        break;
      default:
        alert('Formato não suportado');
    }
  };

 // Gerador de PDF
const gerarPDF = (dadosRelatorio, nomeArquivo) => {
    const doc = new jsPDF('landscape'); // Formato paisagem para melhor visualização
    
    // Cabeçalho do relatório
    doc.setFontSize(16);
    doc.text(nomeArquivo, 14, 20);
    
    // Detalhes do relatório
    doc.setFontSize(10);
    doc.text(`Funcionário: ${dadosRelatorio.funcionario}`, 14, 30);
    doc.text(`Departamento: ${dadosRelatorio.departamento}`, 14, 36);
    doc.text(`Período: ${dadosRelatorio.periodo}`, 14, 42);
    
    // Tabela de registros
    const colunas = ['Data', 'Entrada', 'Saída', 'Intervalo Almoço', 'Lanche', 'Horas Extras', 'Observações'];
    const dados = dadosRelatorio.registros.map(registro => [
      registro.data,
      registro.entrada,
      registro.saida,
      registro.intervaloAlmoco,
      registro.intervaloLanche,
      registro.horasExtras,
      registro.observacoes
    ]);
    
    // Inicializa posição Y para a tabela
    let posY = 50;
    
    // Usar autoTable
    autoTable(doc, {
      startY: posY,
      head: [colunas],
      body: dados,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 20 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 40 }
      },
      didDrawPage: function(data) {
        // Atualiza a posição Y após desenhar a tabela
        posY = data.cursor.y + 20;
      }
    });
    
    // Usar a posição Y atualizada para adicionar rodapé com totais
    doc.text(`Total de Dias: ${dadosRelatorio.totalDias}`, 14, posY);
    doc.text(`Dias Trabalhados: ${dadosRelatorio.diasTrabalhados}`, 14, posY + 6);
    doc.text(`Horas Trabalhadas: ${dadosRelatorio.horasTrabalhadas}h`, 14, posY + 12);
    
    // Salvar o PDF
    doc.save(`${nomeArquivo}.pdf`);
  };
  
  // Gerador de Excel
  const gerarExcel = (dadosRelatorio, nomeArquivo) => {
    const colunas = ['Data', 'Entrada', 'Saída', 'Intervalo Almoço', 'Lanche', 'Horas Extras', 'Observações'];
    const dados = dadosRelatorio.registros.map(registro => [
      registro.data,
      registro.entrada,
      registro.saida,
      registro.intervaloAlmoco,
      registro.intervaloLanche,
      registro.horasExtras,
      registro.observacoes
    ]);
    
    // Adicionar informações no cabeçalho
    const infoLinhas = [
      ['Relatório de Ponto'],
      [''],
      ['Funcionário:', dadosRelatorio.funcionario],
      ['Departamento:', dadosRelatorio.departamento],
      ['Período:', dadosRelatorio.periodo],
      [''],
      colunas
    ];
    
    const todos = [...infoLinhas, ...dados, [''], 
      ['Total de Dias:', dadosRelatorio.totalDias],
      ['Dias Trabalhados:', dadosRelatorio.diasTrabalhados],
      ['Horas Trabalhadas:', `${dadosRelatorio.horasTrabalhadas}h`]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(todos);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    
    // Gerar arquivo e download
    XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
  };

  // Gerador de CSV
  const gerarCSV = (dadosRelatorio, nomeArquivo) => {
    const colunas = ['Data', 'Entrada', 'Saída', 'Intervalo Almoço', 'Lanche', 'Horas Extras', 'Observações'];
    const dados = dadosRelatorio.registros.map(registro => ({
      Data: registro.data,
      Entrada: registro.entrada,
      Saída: registro.saida,
      'Intervalo Almoço': registro.intervaloAlmoco,
      Lanche: registro.intervaloLanche,
      'Horas Extras': registro.horasExtras,
      Observações: registro.observacoes
    }));
    
    const csv = Papa.unparse(dados);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Criar link e forçar download
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${nomeArquivo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Efeito para simular a geração do relatório
  useEffect(() => {
    // Simular processamento com um intervalo
    let intervalo = setInterval(() => {
      setProgresso(prev => {
        if (prev >= 100) {
          clearInterval(intervalo);
          setGerando(false);
          
          // Preparar dados do relatório
          const dadosRelatorio = prepararDadosRelatorio();
          
          // Gerar URL para o arquivo (simulado)
          const dataAtual = new Date().toLocaleDateString('pt-BR');
          const horaAtual = new Date().toLocaleTimeString('pt-BR');
          
          setRelatorioInfo({
            nome: `${formatarTipoRelatorio()}_${filtros.dataInicio}_a_${filtros.dataFim}`,
            url: '#', // URL simulada
            data: `${dataAtual} ${horaAtual}`,
            dadosAdicionais: dadosRelatorio
          });
          
          return 100;
        }
        return prev + 5;
      });
    }, 200);
    
    // Limpeza do intervalo quando o componente for desmontado
    return () => clearInterval(intervalo);
  }, []);

  // Abre o visualizador de arquivo quando o relatório é gerado
  useEffect(() => {
    if (relatorioInfo && !gerando) {
      // Abre o visualizador automaticamente após gerar o relatório
      setFileViewerState({
        isOpen: true,
        fileType: filtros.formato,
        fileName: relatorioInfo.nome,
        fileUrl: relatorioInfo.url,
        relatorioData: relatorioInfo.dadosAdicionais
      });
    }
  }, [relatorioInfo, gerando]);

  // Função para abrir o visualizador de arquivo manualmente
  const abrirVisualizador = () => {
    if (!relatorioInfo) return;
    setFileViewerState({
      isOpen: true,
      fileType: filtros.formato,
      fileName: relatorioInfo.nome,
      fileUrl: relatorioInfo.url,
      relatorioData: relatorioInfo.dadosAdicionais
    });
  };

  // Função para fechar o visualizador de arquivo
  const fecharVisualizador = () => {
    setFileViewerState({
      ...fileViewerState,
      isOpen: false
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40">
      <div className="bg-purple-900 rounded-lg shadow-lg w-11/12 max-w-xl p-6">
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">{gerando ? 'Gerando Relatório' : 'Relatório Gerado'}</h2>
          <button
            onClick={onClose}
            className="text-purple-300 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {gerando ? (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-4 bg-purple-800 rounded-full mb-4">
                {tipoRelatorio === 'espelho' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {tipoRelatorio === 'ausencias' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {tipoRelatorio === 'marcacoes' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {tipoRelatorio === 'bancoHoras' && (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-medium mb-2">Processando seu {formatarTipoRelatorio()}</h3>
              <p className="text-purple-300 mb-4">Isso pode levar alguns instantes...</p>
            </div>
            <div className="mb-6">
              <div className="w-full bg-purple-800 rounded-full h-4 mb-2">
                <div
                  className="bg-purple-500 h-4 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progresso}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-purple-300">
                <span>Processando dados...</span>
                <span>{progresso}%</span>
              </div>
            </div>
            <div className="text-sm text-purple-300 italic">
              <p>Período: {filtros.dataInicio} a {filtros.dataFim}</p>
              <p>Formato: {filtros.formato.toUpperCase()}</p>
              {filtros.funcionario && (
                <p>Funcionário: {funcionarios.find(f => f.id.toString() === filtros.funcionario.toString())?.nome}</p>
              )}
              {filtros.departamento && (
                <p>Departamento: {departamentos.find(d => d.id.toString() === filtros.departamento.toString())?.nome}</p>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="bg-purple-800 bg-opacity-50 rounded-lg p-4 mb-6">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-green-600 p-2 mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-lg font-medium">Relatório gerado com sucesso!</span>
              </div>
              <div className="flex flex-col space-y-2 text-sm text-purple-300">
                <p><strong>Nome:</strong> {relatorioInfo?.nome}</p>
                <p><strong>Tipo:</strong> {formatarTipoRelatorio()}</p>
                <p><strong>Período:</strong> {filtros.dataInicio} a {filtros.dataFim}</p>
                <p><strong>Formato:</strong> {filtros.formato.toUpperCase()}</p>
                <p><strong>Data Geração:</strong> {relatorioInfo?.data}</p>
                {filtros.funcionario && (
                  <p><strong>Funcionário:</strong> {funcionarios.find(f => f.id.toString() === filtros.funcionario.toString())?.nome}</p>
                )}
                {filtros.departamento && (
                  <p><strong>Departamento:</strong> {departamentos.find(d => d.id.toString() === filtros.departamento.toString())?.nome}</p>
                )}
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              <button
                onClick={abrirVisualizador}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Visualizar
              </button>
              <button
                onClick={downloadRelatorio}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Visualizador de arquivo */}
      {fileViewerState.isOpen && (
        <FileViewer
          fileType={fileViewerState.fileType}
          fileName={fileViewerState.fileName}
          fileUrl={fileViewerState.fileUrl}
          relatorioData={fileViewerState.relatorioData}
          onClose={fecharVisualizador}
        />
      )}
    </div>
  );
};

export default RelatorioGenerator;
