import React, { useState, useEffect } from 'react';

const SolicitacaoTab = ({ 
  tipoSolicitacao, // 'ferias' ou 'folgas'
  userData,  
  bancoHoras, 
  onSolicitacaoEnviada, 
  closeModal 
}) => {
  // Estados para nova solicitação
  const [novaSolicitacao, setNovaSolicitacao] = useState(
    tipoSolicitacao === 'ferias' 
      ? {
          dataInicio: '',
          dataFim: '',
          observacao: ''
        } 
      : {
          data: '',
          tipo: 'abono',
          periodo: 'dia',
          motivo: ''
        }
  );
  
  // Estado para calcular dias de férias
  const [diasSolicitados, setDiasSolicitados] = useState(0);
  
  // Calcular dias de férias quando as datas mudarem
  useEffect(() => {
    if (tipoSolicitacao === 'ferias' && novaSolicitacao.dataInicio && novaSolicitacao.dataFim) {
      const inicio = new Date(novaSolicitacao.dataInicio);
      const fim = new Date(novaSolicitacao.dataFim);
      
      // Verificar se as datas são válidas
      if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
        setDiasSolicitados(0);
        return;
      }
      
      // Adicionar 1 para incluir o último dia
      const diffTime = Math.abs(fim - inicio);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      setDiasSolicitados(diffDays);
    } else {
      setDiasSolicitados(0);
    }
  }, [novaSolicitacao.dataInicio, novaSolicitacao.dataFim, tipoSolicitacao]);
  
  // Função auxiliar para formatar data para formato BR DD/MM/YYYY
  const formatDateBR = (inputDate) => {
    if (!inputDate) return '';
    
    // Se já estiver no formato DD/MM/YYYY, retorna como está
    if (inputDate.includes('/') && inputDate.split('/')[0].length <= 2) {
      return inputDate;
    }
    
    try {
      // Converter de YYYY-MM-DD para DD/MM/YYYY
      if (inputDate.includes('-')) {
        const [ano, mes, dia] = inputDate.split('-');
        return `${dia}/${mes}/${ano}`;
      }
      
      // Caso seja um objeto Date
      const date = new Date(inputDate);
      const dia = String(date.getDate()).padStart(2, '0');
      const mes = String(date.getMonth() + 1).padStart(2, '0');
      const ano = date.getFullYear();
      
      return `${dia}/${mes}/${ano}`;
    } catch (error) {
      console.error('Erro ao formatar data para formato brasileiro:', error);
      return '';
    }
  };
  
  // Função para enviar a solicitação
  const handleSubmit = () => {
    if (tipoSolicitacao === 'ferias') {
      handleSolicitarFerias();
    } else {
      handleSolicitarFolga();
    }
  };
  
  // Função para solicitar férias
  const handleSolicitarFerias = () => {
    if (!novaSolicitacao.dataInicio || !novaSolicitacao.dataFim) {
      alert('Por favor, preencha as datas de início e fim das férias');
      return;
    }
    
    // Verificar se a data de início é anterior à data de fim
    const dataInicio = new Date(novaSolicitacao.dataInicio);
    const dataFim = new Date(novaSolicitacao.dataFim);
    
    if (dataInicio > dataFim) {
      alert('A data de início não pode ser posterior à data de fim');
      return;
    }
    
    // Criar objeto de férias
    const ferias = {
      id: Date.now(),
      funcionarioId: userData.id,
      funcionarioNome: userData.name,
      dataInicio: formatDateBR(novaSolicitacao.dataInicio),
      dataFim: formatDateBR(novaSolicitacao.dataFim),
      diasTotais: diasSolicitados,
      observacao: novaSolicitacao.observacao,
      status: 'pendente',
      dataSolicitacao: new Date().toLocaleDateString('pt-BR')
    };
    
    // Obter solicitações existentes
    const feriasEntries = JSON.parse(localStorage.getItem('feriasEntries') || '[]');
    
    // Verificar se há sobreposição com férias existentes
    const feriasUsuario = feriasEntries.filter(
      f => f.funcionarioId === userData.id && 
      (f.status === 'aprovado' || f.status === 'pendente')
    );
    
    const dataInicioNova = new Date(novaSolicitacao.dataInicio);
    const dataFimNova = new Date(novaSolicitacao.dataFim);
    
    const sobreposicao = feriasUsuario.some(f => {
      const dataInicio = new Date(f.dataInicio.split('/').reverse().join('-'));
      const dataFim = new Date(f.dataFim.split('/').reverse().join('-'));
      
      return (dataInicioNova <= dataFim && dataFimNova >= dataInicio);
    });
    
    if (sobreposicao) {
      alert('Há sobreposição com férias já solicitadas ou aprovadas');
      return;
    }
    
    // Adicionar nova solicitação
    const updatedFeriasEntries = [...feriasEntries, ferias];
    localStorage.setItem('feriasEntries', JSON.stringify(updatedFeriasEntries));
    
    // Notificar admin
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    adminNotifications.push({
      id: Date.now(),
      type: 'ferias',
      message: `${userData.name} solicitou férias de ${ferias.dataInicio} a ${ferias.dataFim}`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false,
      funcionarioId: userData.id,
      feriasId: ferias.id
    });
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
    
    // Notificar componente pai
    if (onSolicitacaoEnviada) {
      onSolicitacaoEnviada(ferias, 'ferias');
    }
    
    // Fechar modal e limpar formulário
    if (closeModal) {
      closeModal();
    }
    
    alert('Solicitação de férias enviada com sucesso!');
  };
  
  // Função para solicitar folga
  const handleSolicitarFolga = () => {
    if (!novaSolicitacao.data || !novaSolicitacao.motivo) {
      alert('Por favor, preencha todos os campos obrigatórios');
      return;
    }
    
    // Criar objeto de folga
    const folga = {
      id: Date.now(),
      funcionarioId: userData.id,
      funcionarioNome: userData.name,
      data: formatDateBR(novaSolicitacao.data),
      tipo: novaSolicitacao.tipo,
      periodo: novaSolicitacao.periodo,
      motivo: novaSolicitacao.motivo,
      status: 'pendente',
      dataSolicitacao: new Date().toLocaleDateString('pt-BR')
    };
    
    // Obter solicitações existentes
    const folgaEntries = JSON.parse(localStorage.getItem('folgaEntries') || '[]');
    
    // Verificar se já existe folga para este dia
    const folgaExistente = folgaEntries.find(
      f => f.funcionarioId === userData.id && 
           f.data === folga.data && 
           (f.status === 'aprovado' || f.status === 'pendente')
    );
    
    if (folgaExistente) {
      alert('Você já possui uma folga registrada para esta data');
      return;
    }
    
    // Verificar disponibilidade de banco de horas, se necessário
    if (folga.tipo === 'banco de horas' && bancoHoras) {
      const horasNecessarias = folga.periodo === 'dia' ? 8 : 4;
      if (bancoHoras.saldo < horasNecessarias) {
        alert(`Você não possui horas suficientes no banco de horas (${bancoHoras.saldo.toFixed(1)}h disponíveis, ${horasNecessarias}h necessárias)`);
        return;
      }
    }
    
    // Adicionar nova solicitação
    const updatedFolgaEntries = [...folgaEntries, folga];
    localStorage.setItem('folgaEntries', JSON.stringify(updatedFolgaEntries));
    
    // Notificar admin
    const adminNotifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    adminNotifications.push({
      id: Date.now(),
      type: 'folga',
      message: `${userData.name} solicitou folga para ${folga.data} (${folga.periodo})`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false,
      funcionarioId: userData.id,
      folgaId: folga.id
    });
    localStorage.setItem('adminNotifications', JSON.stringify(adminNotifications));
    
    // Notificar componente pai
    if (onSolicitacaoEnviada) {
      onSolicitacaoEnviada(folga, 'folgas');
    }
    
    // Fechar modal e limpar formulário
    if (closeModal) {
      closeModal();
    }
    
    alert('Solicitação de folga enviada com sucesso!');
  };
  
  return (
    <div className="p-4">
      <h3 className="text-xl font-bold mb-4">
        Solicitar {tipoSolicitacao === 'ferias' ? 'Férias' : 'Folga'}
      </h3>
      
      {tipoSolicitacao === 'ferias' ? (
        // Formulário de Férias
        <>
          <div className="mb-4">
            <label className="block text-sm text-purple-300 mb-1">Data de Início*</label>
            <input 
              type="date" 
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              value={novaSolicitacao.dataInicio}
              onChange={(e) => setNovaSolicitacao({...novaSolicitacao, dataInicio: e.target.value})}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-purple-300 mb-1">Data de Fim*</label>
            <input 
              type="date" 
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              value={novaSolicitacao.dataFim}
              onChange={(e) => setNovaSolicitacao({...novaSolicitacao, dataFim: e.target.value})}
              required
            />
          </div>
          
          {diasSolicitados > 0 && (
            <div className="bg-purple-800 bg-opacity-50 p-3 rounded-md mb-4">
              <p className="text-sm">
                Total de dias solicitados: <strong>{diasSolicitados} dias</strong>
              </p>
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm text-purple-300 mb-1">Observação</label>
            <textarea 
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              rows="3"
              value={novaSolicitacao.observacao}
              onChange={(e) => setNovaSolicitacao({...novaSolicitacao, observacao: e.target.value})}
              placeholder="Observações ou justificativa (opcional)"
            ></textarea>
          </div>
        </>
      ) : (
        // Formulário de Folga
        <>
          <div className="mb-4">
            <label className="block text-sm text-purple-300 mb-1">Data*</label>
            <input 
              type="date" 
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              value={novaSolicitacao.data}
              onChange={(e) => setNovaSolicitacao({...novaSolicitacao, data: e.target.value})}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-purple-300 mb-1">Tipo de Folga*</label>
            <select 
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              value={novaSolicitacao.tipo}
              onChange={(e) => setNovaSolicitacao({...novaSolicitacao, tipo: e.target.value})}
              required
            >
              <option value="abono">Abono</option>
              <option value="banco de horas">Banco de Horas</option>
              <option value="compensação">Compensação</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-purple-300 mb-1">Período*</label>
            <select 
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              value={novaSolicitacao.periodo}
              onChange={(e) => setNovaSolicitacao({...novaSolicitacao, periodo: e.target.value})}
              required
            >
              <option value="dia">Dia inteiro</option>
              <option value="manhã">Manhã</option>
              <option value="tarde">Tarde</option>
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-purple-300 mb-1">Justificativa*</label>
            <textarea 
              className="w-full bg-purple-800 border border-purple-700 rounded-md p-2 text-white"
              rows="3"
              value={novaSolicitacao.motivo}
              onChange={(e) => setNovaSolicitacao({...novaSolicitacao, motivo: e.target.value})}
              placeholder="Informe o motivo da folga"
              required
            ></textarea>
          </div>
          
          {novaSolicitacao.tipo === 'banco de horas' && bancoHoras && (
            <div className="bg-purple-800 bg-opacity-50 p-3 rounded-md mb-4">
              <p className="text-sm">
                Horas a serem utilizadas: <strong>{novaSolicitacao.periodo === 'dia' ? '8 horas' : '4 horas'}</strong>
              </p>
              <p className="text-sm mt-1">
                Saldo atual: <strong>{bancoHoras.saldo.toFixed(1)} horas</strong>
              </p>
            </div>
          )}
        </>
      )}
      
      <div className="flex justify-end space-x-2 mt-6">
        <button
          onClick={closeModal}
          className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
          disabled={
            tipoSolicitacao === 'ferias' 
              ? (!novaSolicitacao.dataInicio || !novaSolicitacao.dataFim)
              : (!novaSolicitacao.data || !novaSolicitacao.motivo)
          }
        >
          Solicitar {tipoSolicitacao === 'ferias' ? 'Férias' : 'Folga'}
        </button>
      </div>
    </div>
  );
};

export default SolicitacaoTab;