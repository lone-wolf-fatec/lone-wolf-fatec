import React, { useState, useEffect } from 'react';

// Componente de Formulário de Agendamento
const FormularioAgendamento = ({ agendamento = null, onSave, onCancel, departamentos, funcionarios }) => {
  const [formData, setFormData] = useState(agendamento || {
    nome: '',
    tipo: 'ESPELHO',
    frequencia: 'MENSAL',
    diaExecucao: 1,
    horario: '08:00',
    destinatarios: [],
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
      {/* Conteúdo do formulário vai aqui */}
    </div>
  );
};

// Componente de geração de relatório
const RelatorioGenerator = ({ tipoRelatorio, filtros, funcionarios, departamentos, onClose }) => {
  const [progresso, setProgresso] = useState(0);
  const [relatorioGerado, setRelatorioGerado] = useState(false);
  const [status, setStatus] = useState('Iniciando geração do relatório...');
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [relatorioFinal, setRelatorioFinal] = useState(null);

  useEffect(() => {
    let dataInicio = new Date(filtros.dataInicio);
    let mes = dataInicio.getMonth() + 1;
    let ano = dataInicio.getFullYear();
    let nomeFormatado = '';

    switch (tipoRelatorio) {
      case 'espelho':
        nomeFormatado = `Espelho_de_Ponto_${mes}_${ano}`;
        break;
      case 'ausencias':
        nomeFormatado = `Relatorio_de_Ausencias_${mes}_${ano}`;
        break;
      case 'marcacoes':
        nomeFormatado = `Marcacoes_por_Dia_${mes}_${ano}`;
        break;
      case 'bancoHoras':
        nomeFormatado = `Banco_de_Horas_${mes}_${ano}`;
        break;
      default:
        nomeFormatado = `Relatorio_${mes}_${ano}`;
    }

    setNomeArquivo(nomeFormatado);
    setStatus('Processando dados...');
    // Simulação do progresso da geração
    const interval = setInterval(() => {
      setProgresso((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setRelatorioGerado(true);
          setStatus('Relatório gerado com sucesso!');
          setRelatorioFinal({ nome: nomeFormatado, conteudo: 'Relatório simulado' });
          return 100;
        }
        return prev + 20;
      });
    }, 500);

    return () => clearInterval(interval);
  }, [tipoRelatorio, filtros]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      {/* Conteúdo do relatório aqui */}
      <div className="bg-white p-4 rounded w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">Gerando Relatório</h2>
        <p>{status}</p>
        <div className="w-full bg-gray-200 h-4 my-4 rounded">
          <div className="bg-green-500 h-4 rounded" style={{ width: `${progresso}%` }}></div>
        </div>
        {relatorioGerado && (
          <div className="mt-4">
            <p>Nome do arquivo: <strong>{nomeArquivo}</strong></p>
            <button className="mt-2 bg-blue-500 text-white px-4 py-2 rounded" onClick={onClose}>Fechar</button>
          </div>
        )}
      </div>
    </div>
  );
};

export { FormularioAgendamento, RelatorioGenerator };
