// Funções utilitárias para gerar e baixar relatórios em diferentes formatos
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import ExcelJS from 'exceljs';
import Papa from 'papaparse';

// Função genérica de download
export const downloadFile = (data, fileName, type) => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Função para baixar em PDF
export const downloadPDF = (relatorio) => {
  const doc = new jsPDF();
  
  // Adicionar título
  doc.setFontSize(16);
  doc.text(relatorio.nome, 14, 20);
  
  // Adicionar metadados
  doc.setFontSize(10);
  doc.text(`Gerado em: ${relatorio.data} por ${relatorio.geradoPor}`, 14, 30);
  doc.text(`Tipo: ${relatorio.tipo}`, 14, 35);
  
  // Gerar conteúdo baseado no tipo
  if (relatorio.tipo === 'ESPELHO') {
    // Adicionar detalhes do relatório
    doc.text(`Funcionário: ${relatorio.conteudo.funcionario}`, 14, 45);
    doc.text(`Departamento: ${relatorio.conteudo.departamento}`, 14, 50);
    doc.text(`Período: ${relatorio.conteudo.periodo}`, 14, 55);
    doc.text(`Dias Trabalhados: ${relatorio.conteudo.diasTrabalhados} de ${relatorio.conteudo.totalDias}`, 14, 60);
    
    // Criar tabela
    const headers = [['Data', 'Entrada', 'Saída', 'Intervalo', 'Horas Extras', 'Observações']];
    const data = relatorio.conteudo.registros.map(registro => [
      registro.data,
      registro.entrada,
      registro.saida,
      registro.intervalo,
      registro.horasExtras,
      registro.observacoes
    ]);
    
    doc.autoTable({
      head: headers,
      body: data,
      startY: 70,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [100, 50, 150] }
    });
    
    // Adicionar horas totais
    const finalY = doc.autoTable.previous.finalY;
    doc.text(`Total Horas Trabalhadas: ${relatorio.conteudo.horasTrabalhadas}h`, 14, finalY + 10);
  } 
  else if (relatorio.tipo === 'BANCO DE HORAS') {
    // Adicionar detalhes do relatório
    doc.text(`Departamento: ${relatorio.conteudo.departamento}`, 14, 45);
    doc.text(`Período: ${relatorio.conteudo.periodo}`, 14, 50);
    
    // Criar tabela
    const headers = [['Funcionário', 'Saldo Anterior', 'Créditos', 'Débitos', 'Saldo Atual']];
    const data = relatorio.conteudo.registros.map(registro => [
      registro.funcionario,
      registro.saldoAnterior,
      registro.creditosPeriodo,
      registro.debitosPeriodo,
      registro.saldoAtual
    ]);
    
    doc.autoTable({
      head: headers,
      body: data,
      startY: 60,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [50, 50, 150] }
    });
  }
  else if (relatorio.tipo === 'AUSÊNCIAS') {
    // Adicionar detalhes do relatório
    doc.text(`Departamento: ${relatorio.conteudo.departamento}`, 14, 45);
    doc.text(`Período: ${relatorio.conteudo.periodo}`, 14, 50);
    
    // Criar tabela
    const headers = [['Funcionário', 'Departamento', 'Tipo', 'Data Início', 'Data Fim', 'Total Dias', 'Justificado']];
    const data = relatorio.conteudo.registros.map(registro => [
      registro.funcionario,
      registro.departamento,
      registro.tipoAusencia,
      registro.dataInicio,
      registro.dataFim,
      registro.totalDias,
      registro.justificado
    ]);
    
    doc.autoTable({
      head: headers,
      body: data,
      startY: 60,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [150, 50, 50] }
    });
  }
  
  // Salvar o PDF
  return doc.output('blob');
};

// Função para baixar em Excel
export const downloadExcel = (relatorio) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(relatorio.tipo);
  
  // Adicionar título
  worksheet.mergeCells('A1:F1');
  const titleCell = worksheet.getCell('A1');
  titleCell.value = relatorio.nome;
  titleCell.font = { size: 16, bold: true };
  titleCell.alignment = { horizontal: 'center' };
  
  // Adicionar metadados
  worksheet.mergeCells('A2:F2');
  const metaCell = worksheet.getCell('A2');
  metaCell.value = `Gerado em: ${relatorio.data} por ${relatorio.geradoPor}`;
  metaCell.font = { size: 10, italic: true };
  
  // Gerar conteúdo baseado no tipo
  if (relatorio.tipo === 'ESPELHO') {
    // Adicionar detalhes do relatório
    worksheet.getCell('A4').value = 'Funcionário:';
    worksheet.getCell('B4').value = relatorio.conteudo.funcionario;
    worksheet.getCell('A5').value = 'Departamento:';
    worksheet.getCell('B5').value = relatorio.conteudo.departamento;
    worksheet.getCell('A6').value = 'Período:';
    worksheet.getCell('B6').value = relatorio.conteudo.periodo;
    
    // Adicionar cabeçalhos da tabela
    const headers = ['Data', 'Entrada', 'Saída', 'Intervalo', 'Horas Extras', 'Observações'];
    worksheet.addRow([]);
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '8A2BE2' }
      };
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    });
    
    // Adicionar dados
    relatorio.conteudo.registros.forEach(registro => {
      worksheet.addRow([
        registro.data,
        registro.entrada,
        registro.saida,
        registro.intervalo,
        registro.horasExtras,
        registro.observacoes
      ]);
    });
    
    // Adicionar total
    worksheet.addRow([]);
    const totalRow = worksheet.addRow(['Total Horas Trabalhadas:', relatorio.conteudo.horasTrabalhadas + 'h']);
    totalRow.getCell(1).font = { bold: true };
  } 
  else if (relatorio.tipo === 'BANCO DE HORAS') {
    // Adicionar detalhes do relatório
    worksheet.getCell('A4').value = 'Departamento:';
    worksheet.getCell('B4').value = relatorio.conteudo.departamento;
    worksheet.getCell('A5').value = 'Período:';
    worksheet.getCell('B5').value = relatorio.conteudo.periodo;
    
    // Adicionar cabeçalhos da tabela
    const headers = ['Funcionário', 'Saldo Anterior', 'Créditos', 'Débitos', 'Saldo Atual'];
    worksheet.addRow([]);
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: '4040A0' }
      };
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    });
    
    // Adicionar dados
    relatorio.conteudo.registros.forEach(registro => {
      worksheet.addRow([
        registro.funcionario,
        registro.saldoAnterior,
        registro.creditosPeriodo,
        registro.debitosPeriodo,
        registro.saldoAtual
      ]);
    });
  }
  else if (relatorio.tipo === 'AUSÊNCIAS') {
    // Adicionar detalhes do relatório
    worksheet.getCell('A4').value = 'Departamento:';
    worksheet.getCell('B4').value = relatorio.conteudo.departamento;
    worksheet.getCell('A5').value = 'Período:';
    worksheet.getCell('B5').value = relatorio.conteudo.periodo;
    
    // Adicionar cabeçalhos da tabela
    const headers = ['Funcionário', 'Departamento', 'Tipo de Ausência', 'Data Início', 'Data Fim', 'Total Dias', 'Justificado'];
    worksheet.addRow([]);
    const headerRow = worksheet.addRow(headers);
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'A04040' }
      };
      cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    });
    
    // Adicionar dados
    relatorio.conteudo.registros.forEach(registro => {
      worksheet.addRow([
        registro.funcionario,
        registro.departamento,
        registro.tipoAusencia,
        registro.dataInicio,
        registro.dataFim,
        registro.totalDias,
        registro.justificado
      ]);
    });
  }
  
  // Ajustar largura das colunas
  worksheet.columns.forEach(column => {
    column.width = 20;
  });
  
  // Retornar o blob do Excel
  return workbook.xlsx.writeBuffer();
};

// Função para baixar CSV
export const downloadCSV = (relatorio) => {
  let data = [];
  let fields = [];
  
  // Preparar dados baseado no tipo de relatório
  if (relatorio.tipo === 'ESPELHO') {
    fields = ['Data', 'Entrada', 'Saída', 'Intervalo', 'Horas Extras', 'Observações'];
    data = relatorio.conteudo.registros.map(registro => ({
      Data: registro.data,
      Entrada: registro.entrada,
      Saída: registro.saida,
      Intervalo: registro.intervalo,
      'Horas Extras': registro.horasExtras,
      Observações: registro.observacoes
    }));
  } 
  else if (relatorio.tipo === 'BANCO DE HORAS') {
    fields = ['Funcionário', 'Saldo Anterior', 'Créditos', 'Débitos', 'Saldo Atual'];
    data = relatorio.conteudo.registros.map(registro => ({
      Funcionário: registro.funcionario,
      'Saldo Anterior': registro.saldoAnterior,
      Créditos: registro.creditosPeriodo,
      Débitos: registro.debitosPeriodo,
      'Saldo Atual': registro.saldoAtual
    }));
  }
  else if (relatorio.tipo === 'AUSÊNCIAS') {
    fields = ['Funcionário', 'Departamento', 'Tipo de Ausência', 'Data Início', 'Data Fim', 'Total Dias', 'Justificado'];
    data = relatorio.conteudo.registros.map(registro => ({
      Funcionário: registro.funcionario,
      Departamento: registro.departamento,
      'Tipo de Ausência': registro.tipoAusencia,
      'Data Início': registro.dataInicio,
      'Data Fim': registro.dataFim,
      'Total Dias': registro.totalDias,
      Justificado: registro.justificado
    }));
  }
  
  // Usar o PapaParse para converter para CSV
  return Papa.unparse({
    fields,
    data
  });
};

// Função principal para iniciar o download
export const iniciarDownload = (relatorio) => {
  try {
    let data;
    let fileName = `${relatorio.nome.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}`;
    let type;
    
    if (relatorio.formato === 'PDF') {
      data = downloadPDF(relatorio);
      fileName += '.pdf';
      type = 'application/pdf';
      
      // Para PDF, que retorna um blob
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } 
    else if (relatorio.formato === 'EXCEL') {
      data = downloadExcel(relatorio);
      fileName += '.xlsx';
      type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      // Para Excel, que retorna uma Promise
      data.then(buffer => {
        const blob = new Blob([buffer], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      });
      
      return true;
    }
    else if (relatorio.formato === 'CSV') {
      data = downloadCSV(relatorio);
      fileName += '.csv';
      type = 'text/csv;charset=utf-8;';
      
      // Para CSV, que retorna uma string
      downloadFile(data, fileName, type);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erro ao gerar relatório:', error);
    alert('Ocorreu um erro ao gerar o relatório. Por favor, tente novamente.');
    return false;
  }
};