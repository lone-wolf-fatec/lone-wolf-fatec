import React, { useState, useEffect } from 'react';
import { CSVLink } from 'react-csv';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import timeUtils from '../utils/timeUtils';

const AnaliseRegistrosPonto = ({ isAdmin = false }) => {
  // Estados
  const [registrosPonto, setRegistrosPonto] = useState([]);
  const [funcionarios, setFuncionarios] = useState([]);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState('');
  const [dataInicio, setDataInicio] = useState(null);
  const [dataFim, setDataFim] = useState(null);
  const [filteredRegistros, setFilteredRegistros] = useState([]);
  const [pontosFaltantes, setPontosFaltantes] = useState([]);
  const [notificacaoTexto, setNotificacaoTexto] = useState('');
  const [showNotificacaoModal, setShowNotificacaoModal] = useState(false);
  const [funcionarioParaNotificar, setFuncionarioParaNotificar] = useState(null);
  const [motivoNotificacao, setMotivoNotificacao] = useState('');
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  const [showVisualizacaoModal, setShowVisualizacaoModal] = useState(false);
  const [modoVisualizacao, setModoVisualizacao] = useState('listaRegistros'); // listaRegistros, pontosFaltantes
  
  // Para carregar dados do localStorage
  useEffect(() => {
    // Carregar registros de ponto
    const registrosArmazenados = JSON.parse(localStorage.getItem('timeEntries') || '[]');
    setRegistrosPonto(registrosArmazenados);
    
    // Carregar lista de funcionários
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    if (users.length === 0) {
      // Criar alguns funcionários de exemplo se não existirem
      const defaultUsers = [
        { id: 1, name: 'João Silva', email: 'joao@example.com', isAdmin: false },
        { id: 2, name: 'Maria Oliveira', email: 'maria@example.com', isAdmin: false },
        { id: 3, name: 'Carlos Pereira', email: 'carlos@example.com', isAdmin: false }
      ];
      
      localStorage.setItem('users', JSON.stringify(defaultUsers));
      setFuncionarios(defaultUsers);
    } else {
      // Filtrar apenas funcionários (não administradores) se o usuário for admin
      const funcionariosFiltrados = isAdmin 
        ? users.filter(user => !user.isAdmin)
        : users;
      
      setFuncionarios(funcionariosFiltrados);
    }
    
    // Definir data inicial e final para o último mês
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);
    
    setDataInicio(inicioMes);
    setDataFim(fimMes);
  }, [isAdmin]);

  // Efeito para filtrar registros quando mudam as seleções
  useEffect(() => {
    if (!dataInicio || !dataFim) return;
    
    // Filtrar registros pelo período e funcionário selecionado
    const filtered = registrosPonto.filter(registro => {
      // Converter data do registro para objeto Date
      const [dia, mes, ano] = registro.date.split('/').map(Number);
      const dataRegistro = new Date(ano, mes - 1, dia);
      
      // Verificar se está dentro do período
      const dentroDoIntervalo = dataRegistro >= dataInicio && dataRegistro <= dataFim;
      
      // Verificar funcionário (se um foi selecionado)
      const funcionarioCorreto = !funcionarioSelecionado || 
        registro.employeeId.toString() === funcionarioSelecionado;
      
      return dentroDoIntervalo && funcionarioCorreto;
    });
    
    // Ordenar por data (mais recente primeiro) e então por hora
    filtered.sort((a, b) => {
      // Comparar datas
      const [diaA, mesA, anoA] = a.date.split('/').map(Number);
      const [diaB, mesB, anoB] = b.date.split('/').map(Number);
      
      const dataA = new Date(anoA, mesA - 1, diaA);
      const dataB = new Date(anoB, mesB - 1, diaB);
      
      if (dataA.getTime() !== dataB.getTime()) {
        return dataB.getTime() - dataA.getTime();
      }
      
      // Se mesma data, comparar hora
      const [horaA, minutoA] = a.time.split(':').map(Number);
      const [horaB, minutoB] = b.time.split(':').map(Number);
      
      if (horaA !== horaB) {
        return horaA - horaB;
      }
      
      return minutoA - minutoB;
    });
    
    setFilteredRegistros(filtered);
    
    // Verificar pontos faltantes se for admin
    if (isAdmin) {
      verificarPontosFaltantes();
    }
  }, [dataInicio, dataFim, funcionarioSelecionado, registrosPonto, isAdmin]);
  
  // Função para verificar pontos faltantes
  const verificarPontosFaltantes = () => {
    if (!dataInicio || !dataFim || !funcionarioSelecionado) {
      setPontosFaltantes([]);
      return;
    }
    
    // Obter jornada de trabalho do funcionário
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const funcionario = users.find(user => user.id.toString() === funcionarioSelecionado);
    
    if (!funcionario) {
      setPontosFaltantes([]);
      return;
    }
    
    const jornadaTrabalho = funcionario.jornadaTrabalho || {
      inicio: '08:00',
      fimManha: '12:00',
      inicioTarde: '13:00',
      fim: '17:00'
    };
    
    // Coletar todos os dias úteis no período selecionado
    const diasUteis = [];
    const dataIterator = new Date(dataInicio);
    
    while (dataIterator <= dataFim) {
      // Verificar se é dia útil (segunda a sexta)
      if (dataIterator.getDay() !== 0 && dataIterator.getDay() !== 6) {
        // Verificar se não é um feriado
        // Poderia ser implementado uma verificação de feriados aqui
        
        diasUteis.push(new Date(dataIterator));
      }
      
      // Avançar para o próximo dia
      dataIterator.setDate(dataIterator.getDate() + 1);
    }
    
    // Para cada dia útil, verificar se existem os 4 registros necessários
    const faltantes = [];
    
    diasUteis.forEach(dia => {
      const diaFormatado = dia.toLocaleDateString('pt-BR');
      
      // Filtrar registros deste dia para o funcionário selecionado
      const registrosDoDia = registrosPonto.filter(registro => 
        registro.date === diaFormatado && 
        registro.employeeId.toString() === funcionarioSelecionado
      );
      
      // Verificar entradas
      const entrada = registrosDoDia.find(r => 
        r.type === 'entrada' && 
        new Date(`${diaFormatado} ${r.time}`).getHours() < 12
      );
      
      const saidaAlmoco = registrosDoDia.find(r => 
        r.type === 'saída' && 
        new Date(`${diaFormatado} ${r.time}`).getHours() < 13
      );
      
      const retornoAlmoco = registrosDoDia.find(r => 
        r.type === 'entrada' && 
        new Date(`${diaFormatado} ${r.time}`).getHours() >= 12
      );
      
      const saida = registrosDoDia.find(r => 
        r.type === 'saída' && 
        new Date(`${diaFormatado} ${r.time}`).getHours() >= 15
      );
      
      // Verificar registros faltantes
      const pontosFaltantesDoDia = [];
      
      if (!entrada) {
        pontosFaltantesDoDia.push({
          data: diaFormatado,
          horario: jornadaTrabalho.inicio,
          tipo: 'entrada',
          funcionarioId: parseInt(funcionarioSelecionado),
          funcionarioNome: funcionario.name
        });
      }
      
      if (!saidaAlmoco) {
        pontosFaltantesDoDia.push({
          data: diaFormatado,
          horario: jornadaTrabalho.fimManha,
          tipo: 'saída (almoço)',
          funcionarioId: parseInt(funcionarioSelecionado),
          funcionarioNome: funcionario.name
        });
      }
      
      if (!retornoAlmoco) {
        pontosFaltantesDoDia.push({
          data: diaFormatado,
          horario: jornadaTrabalho.inicioTarde,
          tipo: 'entrada (retorno)',
          funcionarioId: parseInt(funcionarioSelecionado),
          funcionarioNome: funcionario.name
        });
      }
      
      if (!saida) {
        pontosFaltantesDoDia.push({
          data: diaFormatado,
          horario: jornadaTrabalho.fim,
          tipo: 'saída',
          funcionarioId: parseInt(funcionarioSelecionado),
          funcionarioNome: funcionario.name
        });
      }
      
      // Adicionar aos pontos faltantes se houver algum
      if (pontosFaltantesDoDia.length > 0) {
        faltantes.push(...pontosFaltantesDoDia);
      }
    });
    
    setPontosFaltantes(faltantes);
  };

  // Função para formatação de data
  const formatarData = (data) => {
    if (!data) return '';
    return data.toLocaleDateString('pt-BR');
  };
  
  // Handler para enviar notificação
  const enviarNotificacao = () => {
    if (!funcionarioParaNotificar || !notificacaoTexto.trim()) {
      return;
    }
    
    // Criar notificação
    const novaNotificacao = {
      id: Date.now(),
      userId: funcionarioParaNotificar.funcionarioId,
      message: notificacaoTexto,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false,
      fromAdmin: true
    };
    
    // Salvar notificação
    const notificacoesExistentes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    const notificacoesAtualizadas = [novaNotificacao, ...notificacoesExistentes];
    localStorage.setItem('userNotifications', JSON.stringify(notificacoesAtualizadas));
    
    // Fechar modal e limpar dados
    setShowNotificacaoModal(false);
    setNotificacaoTexto('');
    setFuncionarioParaNotificar(null);
    setMotivoNotificacao('');
    
    // Feedback para o admin
    alert('Notificação enviada com sucesso!');
  };
  
  // Função para abrir modal de notificação
  const abrirModalNotificacao = (registro) => {
    // Configurar dados para notificação
    const funcionario = funcionarios.find(f => f.id === registro.funcionarioId || f.id.toString() === registro.funcionarioId.toString());
    
    if (!funcionario) return;
    
    setFuncionarioParaNotificar({
      funcionarioId: funcionario.id,
      funcionarioNome: funcionario.name
    });
    
    // Definir texto padrão da notificação baseado no tipo
    if (registro.tipo && registro.tipo.includes('faltante')) {
      setMotivoNotificacao(`ponto ${registro.tipo} não registrado`);
      setNotificacaoTexto(`Verificamos que você não registrou o ponto de ${registro.tipo.replace('faltante', '').trim()} no dia ${registro.data} às ${registro.horario}. Por favor, solicite um ajuste de ponto se necessário.`);
    } else if (registro.atraso) {
      setMotivoNotificacao('atraso');
      setNotificacaoTexto(`Verificamos que houve um atraso no seu registro de ${registro.type} do dia ${registro.date} às ${registro.time}. Por favor, justifique o atraso se necessário.`);
    } else {
      setMotivoNotificacao('outro');
      setNotificacaoTexto(`Sobre seu registro de ponto do dia ${registro.date || registro.data} às ${registro.time || registro.horario}: `);
    }
    
    setShowNotificacaoModal(true);
  };
  
  // Função para visualizar detalhes de um registro
  const visualizarDetalhes = (registro) => {
    setRegistroSelecionado(registro);
    setShowVisualizacaoModal(true);
  };
  
  // Função para exportar dados para CSV
  const getCSVData = () => {
    const dados = modoVisualizacao === 'listaRegistros' ? filteredRegistros : pontosFaltantes;
    
    if (modoVisualizacao === 'listaRegistros') {
      return dados.map(registro => ({
        Data: registro.date,
        Hora: registro.time,
        Tipo: registro.type,
        Funcionário: registro.employeeName,
        Status: registro.status,
        Situação: registro.atraso ? 'ATRASO' : 'NORMAL'
      }));
    } else {
      return dados.map(registro => ({
        Data: registro.data,
        'Horário Previsto': registro.horario,
        'Tipo de Registro': registro.tipo,
        Funcionário: registro.funcionarioNome,
        Situação: 'FALTANTE'
      }));
    }
  };

  return (
    <div className="p-4 bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        Análise de Registros de Ponto
      </h2>
      
      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Funcionário</label>
          <select
            value={funcionarioSelecionado}
            onChange={(e) => setFuncionarioSelecionado(e.target.value)}
            className="w-full px-3 py-2 bg-purple-700 border border-purple-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option value="">Todos os Funcionários</option>
            {funcionarios.map(funcionario => (
              <option key={funcionario.id} value={funcionario.id}>
                {funcionario.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Data Inicial</label>
          <DatePicker
            selected={dataInicio}
            onChange={date => setDataInicio(date)}
            dateFormat="dd/MM/yyyy"
            maxDate={dataFim || new Date()}
            className="w-full px-3 py-2 bg-purple-700 border border-purple-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Data Final</label>
          <DatePicker
            selected={dataFim}
            onChange={date => setDataFim(date)}
            dateFormat="dd/MM/yyyy"
            minDate={dataInicio}
            maxDate={new Date()}
            className="w-full px-3 py-2 bg-purple-700 border border-purple-500 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Ações</label>
          <div className="flex space-x-2">
            <CSVLink
              data={getCSVData()}
              filename={`registros_ponto_${formatarData(dataInicio)}_${formatarData(dataFim)}.csv`}
              className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md text-center flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Exportar
            </CSVLink>
            
            {isAdmin && funcionarioSelecionado && (
              <button
                onClick={() => setModoVisualizacao(modoVisualizacao === 'listaRegistros' ? 'pontosFaltantes' : 'listaRegistros')}
                className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={modoVisualizacao === 'listaRegistros' ? "M12 6v6m0 0v6m0-6h6m-6 0H6" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
                {modoVisualizacao === 'listaRegistros' ? 'Ver Pontos Faltantes' : 'Ver Registros'}
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Avisos e informações */}
      {isAdmin && funcionarioSelecionado && pontosFaltantes.length > 0 && modoVisualizacao === 'listaRegistros' && (
        <div className="bg-yellow-600 bg-opacity-20 border border-yellow-500 rounded-md p-3 mb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>
            O funcionário selecionado possui {pontosFaltantes.length} registros de ponto faltantes no período. 
            <button 
              className="ml-2 underline text-yellow-400 hover:text-yellow-300"
              onClick={() => setModoVisualizacao('pontosFaltantes')}
            >
              Ver detalhes
            </button>
          </span>
        </div>
      )}
      
      {filteredRegistros.length === 0 && modoVisualizacao === 'listaRegistros' && (
        <div className="bg-purple-700 bg-opacity-40 rounded-md p-8 text-center">
          <p className="text-lg">Nenhum registro encontrado para os filtros selecionados.</p>
        </div>
      )}
      
      {pontosFaltantes.length === 0 && modoVisualizacao === 'pontosFaltantes' && (
        <div className="bg-purple-700 bg-opacity-40 rounded-md p-8 text-center">
          <p className="text-lg">Nenhum ponto faltante encontrado para o funcionário no período selecionado.</p>
        </div>
      )}

      {/* Tabela de Registros */}
      {modoVisualizacao === 'listaRegistros' && filteredRegistros.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-purple-300 text-sm">
                <th className="text-left p-2">Data</th>
                <th className="text-left p-2">Hora</th>
                <th className="text-left p-2">Tipo</th>
                <th className="text-left p-2">Funcionário</th>
                <th className="text-left p-2">Status</th>
                <th className="text-left p-2">Situação</th>
                {isAdmin && <th className="text-left p-2">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filteredRegistros.map((registro, index) => (
                <tr key={index} className={`border-t border-purple-700 ${registro.atraso ? 'bg-red-900 bg-opacity-20' : ''}`}>
                  <td className="p-2">{registro.date}</td>
                  <td className="p-2">{registro.time}</td>
                  <td className="p-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs ${registro.type === 'entrada' ? 'bg-green-600' : 'bg-red-600'}`}>
                      {registro.type ? registro.type.toUpperCase() : 'N/A'}
                    </span>
                  </td>
                  <td className="p-2">{registro.employeeName}</td>
                  <td className="p-2">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs
                      ${registro.status === 'aprovado' ? 'bg-green-700' :
                        registro.status === 'pendente' ? 'bg-yellow-600' : 'bg-red-700'}`}>
                      {registro.status ? registro.status.toUpperCase() : 'N/A'}
                    </span>
                  </td>
                  <td className="p-2">
                    {registro.atraso ? (
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-orange-600">
                        ATRASO
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 rounded-full text-xs bg-green-600">
                        NORMAL
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="p-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => visualizarDetalhes(registro)}
                          className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-2 py-1 rounded-md flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          Detalhes
                        </button>
                        <button
                          onClick={() => abrirModalNotificacao(registro)}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-2 py-1 rounded-md flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          Notificar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Tabela de Pontos Faltantes */}
      {modoVisualizacao === 'pontosFaltantes' && pontosFaltantes.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-purple-300 text-sm">
                <th className="text-left p-2">Data</th>
                <th className="text-left p-2">Horário Previsto</th>
                <th className="text-left p-2">Tipo de Registro</th>
                <th className="text-left p-2">Funcionário</th>
                {isAdmin && <th className="text-left p-2">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {pontosFaltantes.map((registro, index) => (
                <tr key={index} className="border-t border-purple-700 bg-red-900 bg-opacity-20">
                  <td className="p-2">{registro.data}</td>
                  <td className="p-2">{registro.horario}</td>
                  <td className="p-2">
                    <span className="inline-block px-2 py-1 rounded-full text-xs bg-red-600">
                      {registro.tipo.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-2">{registro.funcionarioNome}</td>
                  {isAdmin && (
                    <td className="p-2">
                      <button
                        onClick={() => abrirModalNotificacao({
                          ...registro,
                          tipo: `faltante ${registro.tipo}`
                        })}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white text-xs px-2 py-1 rounded-md flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        Notificar Funcionário
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Visualização de Detalhes */}
      {showVisualizacaoModal && registroSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Detalhes do Registro</h3>
              <button
                onClick={() => setShowVisualizacaoModal(false)}
                className="text-purple-300 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-purple-800 bg-opacity-40 p-4 rounded-lg">
                <h4 className="text-sm text-purple-300 mb-1">Data</h4>
                <p className="text-xl font-bold">{registroSelecionado.date || registroSelecionado.data}</p>
              </div>
              
              <div className="bg-purple-800 bg-opacity-40 p-4 rounded-lg">
                <h4 className="text-sm text-purple-300 mb-1">Hora</h4>
                <p className="text-xl font-bold">{registroSelecionado.time || registroSelecionado.horario}</p>
              </div>
              
              <div className="bg-purple-800 bg-opacity-40 p-4 rounded-lg">
                <h4 className="text-sm text-purple-300 mb-1">Tipo</h4>
                <p className="text-xl font-bold">
                  <span className={`inline-block px-3 py-1 rounded-full ${
                    registroSelecionado.type === 'entrada' || registroSelecionado.tipo?.includes('entrada') 
                      ? 'bg-green-600' 
                      : 'bg-red-600'
                  }`}>
                    {registroSelecionado.type?.toUpperCase() || registroSelecionado.tipo?.toUpperCase()}
                  </span>
                </p>
              </div>
              
              <div className="bg-purple-800 bg-opacity-40 p-4 rounded-lg">
                <h4 className="text-sm text-purple-300 mb-1">Funcionário</h4>
                <p className="text-xl font-bold">{registroSelecionado.employeeName || registroSelecionado.funcionarioNome}</p>
              </div>
              
              {registroSelecionado.status && (
                <div className="bg-purple-800 bg-opacity-40 p-4 rounded-lg">
                  <h4 className="text-sm text-purple-300 mb-1">Status</h4>
                  <p className="text-xl font-bold">
                    <span className={`inline-block px-3 py-1 rounded-full ${
                      registroSelecionado.status === 'aprovado' 
                        ? 'bg-green-600' 
                        : registroSelecionado.status === 'pendente' 
                          ? 'bg-yellow-600' 
                          : 'bg-red-600'
                    }`}>
                      {registroSelecionado.status.toUpperCase()}
                    </span>
                  </p>
                </div>
              )}
              
              <div className="bg-purple-800 bg-opacity-40 p-4 rounded-lg">
                <h4 className="text-sm text-purple-300 mb-1">Situação</h4>
                <p className="text-xl font-bold">
                  <span className={`inline-block px-3 py-1 rounded-full ${
                    registroSelecionado.atraso 
                      ? 'bg-orange-600' 
                      : (registroSelecionado.tipo?.includes('faltante') ? 'bg-red-600' : 'bg-green-600')
                  }`}>
                    {registroSelecionado.atraso 
                      ? 'ATRASO' 
                      : (registroSelecionado.tipo?.includes('faltante') ? 'FALTANTE' : 'NORMAL')}
                  </span>
                </p>
              </div>
            </div>
            
            {registroSelecionado.atraso && (
              <div className="bg-orange-600 bg-opacity-20 border border-orange-500 rounded-md p-4 mb-6">
                <h4 className="text-md font-medium mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Detalhes do Atraso
                </h4>
                <p className="text-sm">
                  Este registro está marcado como atraso, pois foi registrado após o horário permitido de tolerância. 
                  Consulte as regras de jornada do funcionário para mais detalhes.
                </p>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowVisualizacaoModal(false)}
                className="px-4 py-2 bg-purple-800 hover:bg-purple-700 rounded-md"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setShowVisualizacaoModal(false);
                  abrirModalNotificacao(registroSelecionado);
                }}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-md flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Enviar Notificação
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modal de Envio de Notificação */}
      {showNotificacaoModal && funcionarioParaNotificar && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-purple-900 rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Enviar Notificação</h3>
              <button
                onClick={() => setShowNotificacaoModal(false)}
                className="text-purple-300 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Funcionário</label>
              <input
                type="text"
                value={funcionarioParaNotificar.funcionarioNome}
                readOnly
                className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Motivo da Notificação</label>
              <input
                type="text"
                value={motivoNotificacao}
                readOnly
                className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Mensagem</label>
              <textarea
                value={notificacaoTexto}
                onChange={(e) => setNotificacaoTexto(e.target.value)}
                className="w-full px-3 py-2 bg-purple-800 border border-purple-600 rounded-md min-h-[120px]"
                placeholder="Digite a mensagem para o funcionário..."
              ></textarea>
              <p className="text-xs text-purple-300 mt-1">
                Esta mensagem será enviada como uma notificação para o funcionário.
              </p>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowNotificacaoModal(false)}
                className="px-4 py-2 bg-purple-800 hover:bg-purple-700 rounded-md"
              >
                Cancelar
              </button>
              <button
                onClick={enviarNotificacao}
                disabled={!notificacaoTexto.trim()}
                className={`px-4 py-2 rounded-md flex items-center ${
                  notificacaoTexto.trim() 
                    ? 'bg-yellow-600 hover:bg-yellow-500' 
                    : 'bg-gray-600 cursor-not-allowed'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnaliseRegistrosPonto;