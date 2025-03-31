import React, { useState, useEffect } from 'react';
import PontoController from './PontoController';
import FuncionariosService from './FuncionariosService';

const RegistroPontoComponent = () => {
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [todosFuncionarios, setTodosFuncionarios] = useState([]);
  const [statusRegistro, setStatusRegistro] = useState(null);
  const [registrosHoje, setRegistrosHoje] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState(null);
  const [busca, setBusca] = useState('');
  
  // Carregar funcionários ao iniciar
  useEffect(() => {
    const funcionarios = FuncionariosService.getTodosFuncionarios();
    setTodosFuncionarios(funcionarios);
  }, []);
  
  // Verificar status quando funcionário é selecionado
  useEffect(() => {
    if (funcionarioSelecionado) {
      verificarStatusRegistro();
      carregarRegistrosHoje();
    } else {
      setStatusRegistro(null);
      setRegistrosHoje([]);
    }
  }, [funcionarioSelecionado]);
  
  // Verificar se o funcionário pode registrar ponto
  const verificarStatusRegistro = () => {
    if (!funcionarioSelecionado) return;
    
    const status = PontoController.verificarPodeRegistrarPonto(funcionarioSelecionado.id);
    setStatusRegistro(status);
  };
  
  // Carregar registros do dia atual
  const carregarRegistrosHoje = () => {
    if (!funcionarioSelecionado) return;
    
    const registros = PontoController.getRegistrosDoDia(funcionarioSelecionado.id);
    setRegistrosHoje(registros);
  };
  
  // Registrar ponto
  const registrarPonto = () => {
    if (!funcionarioSelecionado || !statusRegistro.pode) return;
    
    setCarregando(true);
    setMensagem(null);
    
    // Determinar tipo do registro (entrada ou saída)
    const tipo = statusRegistro.proximoRegistro;
    
    try {
      const resultado = PontoController.registrarPonto(funcionarioSelecionado.id, tipo);
      
      if (resultado.sucesso) {
        setMensagem({
          tipo: 'sucesso',
          texto: resultado.mensagem
        });
        
        // Recarregar dados
        verificarStatusRegistro();
        carregarRegistrosHoje();
      } else {
        setMensagem({
          tipo: 'erro',
          texto: resultado.mensagem
        });
      }
    } catch (error) {
      setMensagem({
        tipo: 'erro',
        texto: error.message
      });
    } finally {
      setCarregando(false);
    }
  };
  
  // Selecionar funcionário
  const selecionarFuncionario = (funcionario) => {
    setFuncionarioSelecionado(funcionario);
    setMensagem(null);
  };
  
  // Limpar seleção
  const limparSelecao = () => {
    setFuncionarioSelecionado(null);
    setMensagem(null);
  };
  
  // Filtrar funcionários pela busca
  const funcionariosFiltrados = busca 
    ? todosFuncionarios.filter(f => 
        f.nome.toLowerCase().includes(busca.toLowerCase()) ||
        f.cargo.toLowerCase().includes(busca.toLowerCase()) ||
        f.departamento.toLowerCase().includes(busca.toLowerCase())
      )
    : todosFuncionarios;
  
  // Formatação da hora atual
  const horaAtual = new Date().toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
  
  // Formatação da data atual
  const dataAtual = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  return (
    <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Registro de Ponto</h1>
        <p className="text-purple-300">
          {dataAtual} - <span className="text-white font-medium">{horaAtual}</span>
        </p>
      </div>
      
      {!funcionarioSelecionado ? (
        // Tela de seleção de funcionário
        <div>
          <div className="mb-4">
            <label className="block text-sm text-purple-300 mb-1">Buscar Funcionário</label>
            <input 
              type="text" 
              className="w-full bg-purple-700 border border-purple-600 rounded-md p-2 text-white"
              placeholder="Nome, cargo ou departamento..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {funcionariosFiltrados.map(funcionario => (
              <div 
                key={funcionario.id} 
                className="bg-purple-900 bg-opacity-50 rounded-lg p-3 cursor-pointer hover:bg-purple-700 transition-colors"
                onClick={() => selecionarFuncionario(funcionario)}
              >
                <h3 className="font-semibold">{funcionario.nome}</h3>
                <p className="text-sm text-purple-300">{funcionario.cargo}</p>
                <p className="text-xs text-purple-400">{funcionario.departamento}</p>
              </div>
            ))}
            
            {funcionariosFiltrados.length === 0 && (
              <div className="col-span-full text-center py-8 text-purple-300">
                {busca 
                  ? 'Nenhum funcionário encontrado com os critérios de busca.' 
                  : 'Nenhum funcionário cadastrado.'}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Tela de registro de ponto para o funcionário selecionado
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-semibold">{funcionarioSelecionado.nome}</h2>
              <p className="text-purple-300">
                {funcionarioSelecionado.cargo} • {funcionarioSelecionado.departamento}
              </p>
            </div>
            <button 
              onClick={limparSelecao}
              className="text-purple-300 hover:text-white"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {mensagem && (
            <div className={`mb-4 p-3 rounded-lg ${
              mensagem.tipo === 'sucesso' ? 'bg-green-600 bg-opacity-50' : 'bg-red-600 bg-opacity-50'
            }`}>
              {mensagem.texto}
            </div>
          )}
          
          <div className="bg-purple-900 bg-opacity-50 rounded-lg p-4 mb-6">
            {statusRegistro ? (
              statusRegistro.pode ? (
                <div className="text-center">
                  <p className="mb-4">
                    Registrar ponto de <strong className="text-white">{statusRegistro.proximoRegistro === 'entrada' ? 'ENTRADA' : 'SAÍDA'}</strong>
                  </p>
                  <button
                    onClick={registrarPonto}
                    disabled={carregando}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-6 rounded-lg w-full md:w-auto disabled:opacity-50"
                  >
                    {carregando ? 'Processando...' : `Registrar ${statusRegistro.proximoRegistro === 'entrada' ? 'Entrada' : 'Saída'}`}
                  </button>
                  
                  {statusRegistro.jornada && (
                    <div className="mt-3 text-xs text-purple-300">
                      Jornada: {statusRegistro.jornada.nome} • 
                      Horário: {statusRegistro.jornada.horaInicio} - {statusRegistro.jornada.horaFim}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-yellow-300">
                  <p>{statusRegistro.mensagem}</p>
                </div>
              )
            ) : (
              <div className="text-center text-purple-300">
                <p>Verificando status...</p>
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Registros de Hoje</h3>
            
            {registrosHoje.length > 0 ? (
              <div className="bg-purple-900 bg-opacity-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-purple-700 bg-opacity-50">
                      <th className="p-2 text-left">Tipo</th>
                      <th className="p-2 text-left">Hora</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {registrosHoje.map((registro, index) => (
                      <tr key={index} className="border-t border-purple-700">
                        <td className="p-2">
                          {registro.tipo === 'entrada' ? 'Entrada' : 'Saída'}
                        </td>
                        <td className="p-2">{registro.hora}</td>
                        <td className="p-2">
                          {registro.dentroTolerancia ? (
                            <span className="text-green-400">✓ No horário</span>
                          ) : (
                            <span className="text-yellow-400">⚠ Fora do horário</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-purple-300 bg-purple-900 bg-opacity-50 rounded-lg">
                Nenhum registro de ponto hoje.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistroPontoComponent;