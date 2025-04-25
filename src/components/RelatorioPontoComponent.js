import React, { useState, useEffect } from 'react';
import FuncionariosService from './FuncionariosService';
import JornadasService from './JornadasService';

const FuncionariosTab = () => {
  const [funcionarios, setFuncionarios] = useState([]);
  const [jornadas, setJornadas] = useState([]);
  const [funcionariosPorJornada, setFuncionariosPorJornada] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [modalExclusaoAberto, setModalExclusaoAberto] = useState(false);
  const [funcionarioSelecionado, setFuncionarioSelecionado] = useState(null);
  const [funcionarioParaExcluir, setFuncionarioParaExcluir] = useState(null);
  const [filtroBusca, setFiltroBusca] = useState('');
  const [ordenacao, setOrdenacao] = useState('nome');
  const [ordenacaoDirecao, setOrdenacaoDirecao] = useState('asc');
  
  // Estado para novo/edição funcionário
  const [formFuncionario, setFormFuncionario] = useState({
    id: null,
    nome: '',
    cargo: '',
    departamento: '',
    jornadaId: ''
  });
  
  // Carregar dados ao iniciar
  useEffect(() => {
    carregarDados();
  }, []);
  
  // Função para carregar todos os dados necessários
  const carregarDados = () => {
    const funcionariosData = FuncionariosService.getTodosFuncionarios();
    const jornadasData = JornadasService.getTodasJornadas();
    const funcionariosPorJornadaData = FuncionariosService.getFuncionariosPorJornada();
    
    setFuncionarios(funcionariosData