import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext'; // Importando o hook do contexto
// Padronize assim em todos os arquivos
const FUNCIONARIOS_KEY = 'sistema_funcionarios';

const LoginRegisterPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const { login, addFuncionario, refreshFuncionarios, funcionarios } = useUser(); // Usando o hook do contexto

  // Verificar se o usuário já está autenticado
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.authenticated) {
      if (user.roles && user.roles.includes('ADMIN')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  // Atualizar lista de funcionários quando o componente é montado
  useEffect(() => {
    refreshFuncionarios();
    console.log("LoginRegisterPage - Lista atual de funcionários:", funcionarios);
  }, [refreshFuncionarios, funcionarios]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setErrorMessage('As senhas não coincidem!');
      setLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // Processo de login
        console.log("Tentando login com:", formData.email);
        
        // Verificar se existem usuários registrados
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Encontrar o usuário pelo email
        const user = registeredUsers.find(user => user.email === formData.email);
        
        if (!user) {
          throw { message: 'Email não encontrado. Por favor, faça o registro.' };
        }
        
        // Verificar a senha
        if (user.password !== formData.password) {
          throw { message: 'Senha incorreta.' };
        }
        
        // Simular dados como viriam do backend
        const isMockAdmin = user.email.toLowerCase().includes('admin');
        
        const userData = {
          authenticated: true,
          id: user.id,
          email: user.email,
          name: user.name,
          roles: isMockAdmin ? ['ADMIN'] : ['FUNCIONARIO'],
          token: 'mock-jwt-token-123456'
        };
        
        // Armazenar no Context e localStorage
        login(userData); // Usando a função do contexto
        localStorage.setItem('token', userData.token);
        
        console.log(`Redirecionando para ${isMockAdmin ? '/admin' : '/dashboard'}`);
        
        // Atualizar a lista de funcionários antes de redirecionar
        await refreshFuncionarios();
        console.log("Lista de funcionários atualizada após login:", 
          JSON.parse(localStorage.getItem('funcionarios') || '[]'));
        
        // Redirecionar conforme a role
        setLoading(false);
        if (isMockAdmin) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
        
        /* CÓDIGO REAL PARA INTEGRAÇÃO COM BACKEND - Descomentar quando o backend estiver pronto
        const response = await axios.post('http://localhost:8080/api/auth/login', {
          email: formData.email,
          password: formData.password
        });
        
        console.log("Resposta do login:", response.data);
        
        // Armazenar dados no Context
        login(response.data);
        localStorage.setItem('token', response.data.token);
        
        // Atualizar a lista de funcionários antes de redirecionar
        await refreshFuncionarios();
        
        // Redirecionar conforme o papel do usuário
        if (response.data.roles && response.data.roles.includes('ADMIN')) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
        */
        
      } else {
        // Processo de registro
        console.log("Registrando usuário:", formData);
        
        // Verificar se já existem usuários registrados
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Verificar se o email já está em uso
        if (registeredUsers.some(user => user.email === formData.email)) {
          throw { message: 'Este email já está em uso.' };
        }
        
        // Criar novo usuário
        const newUser = {
          id: registeredUsers.length + 1,
          name: formData.name,
          email: formData.email,
          password: formData.password,
          createdAt: new Date().toISOString()
        };
        
        // Adicionar à lista de usuários registrados
        registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
        
        // Adicionar também à lista de funcionários (para caixas de seleção)
        const novoFuncionario = {
          id: newUser.id,
          nome: newUser.name
        };
        
        console.log("Adicionando novo funcionário:", novoFuncionario);
        
        // Usar a função addFuncionario do context com await para garantir conclusão
        const updatedList = await addFuncionario(novoFuncionario);
        console.log("Funcionário adicionado, lista atualizada:", updatedList);
        
        // Verificar se o funcionário foi realmente adicionado
        const funcionariosAtuais = JSON.parse(localStorage.getItem('funcionarios') || '[]');
        console.log("Funcionários atuais no localStorage:", funcionariosAtuais);
        
        // Forçar atualização da lista no Context
        await refreshFuncionarios();
        
        setSuccessMessage('Parabéns, você foi cadastrado! Faça login para continuar.');
        
        // Esperar alguns segundos e mudar para a tela de login
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage('');
          // Manter dados para facilitar o login
          setFormData({
            ...formData,
            confirmPassword: ''
          });
        }, 2000);
        
        /* CÓDIGO REAL PARA INTEGRAÇÃO COM BACKEND - Descomentar quando o backend estiver pronto
        const response = await axios.post('http://localhost:8080/api/auth/registro', {
          email: formData.email,
          name: formData.name,
          password: formData.password
        });
        
        // Adicionar à lista de funcionários (para caixas de seleção)
        const novoFuncionario = {
          id: response.data.id,
          nome: formData.name
        };
        const updatedList = await addFuncionario(novoFuncionario);
        console.log("Funcionário adicionado, lista atualizada:", updatedList);
        
        // Forçar atualização da lista no Context
        await refreshFuncionarios();
        
        setSuccessMessage('Parabéns, você foi cadastrado! Faça login para continuar.');
        
        setTimeout(() => {
          setIsLogin(true);
          setSuccessMessage('');
        }, 2000);
        */
      }
    } catch (error) {
      console.error('Erro na operação:', error);
      setErrorMessage(
        error.message || 
        error.response?.data?.message || 
        'Ocorreu um erro. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-900 to-black">
      {/* Logo */}
      <div className="flex justify-center mt-10 mb-8">
        <div className="text-white text-4xl font-bold flex items-center">
          <span className="bg-purple-600 rounded-full p-2 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>
          CuidaEmprego
        </div>
      </div>

      {/* Card do formulário */}
      <div className="w-full max-w-md mx-auto px-4">
        <div className="bg-purple-800 bg-opacity-40 backdrop-blur-sm rounded-lg shadow-lg p-6 border border-purple-500">
          {/* Abas */}
          <div className="flex mb-6">
            <button 
              className={`flex-1 py-2 text-white font-medium rounded-tl-lg rounded-bl-lg ${isLogin ? 'bg-purple-600' : 'bg-purple-900 bg-opacity-50'}`}
              onClick={() => {
                setIsLogin(true);
                setErrorMessage('');
                setSuccessMessage('');
              }}
            >
              Login
            </button>
            <button 
              className={`flex-1 py-2 text-white font-medium rounded-tr-lg rounded-br-lg ${!isLogin ? 'bg-purple-600' : 'bg-purple-900 bg-opacity-50'}`}
              onClick={() => {
                setIsLogin(false);
                setErrorMessage('');
                setSuccessMessage('');
              }}
            >
              Registro
            </button>
          </div>

          {/* Mensagens de feedback */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-500 bg-opacity-25 border border-red-500 rounded text-white text-sm">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-500 bg-opacity-25 border border-green-500 rounded text-white text-sm">
              {successMessage}
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-2" htmlFor="name">
                  Nome Completo
                </label>
                <input
                  className="w-full bg-purple-900 bg-opacity-50 text-white border border-purple-500 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2" htmlFor="email">
                Email
              </label>
              <input
                className="w-full bg-purple-900 bg-opacity-50 text-white border border-purple-500 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-white text-sm font-medium mb-2" htmlFor="password">
                Senha
              </label>
              <input
                className="w-full bg-purple-900 bg-opacity-50 text-white border border-purple-500 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {!isLogin && (
              <div className="mb-6">
                <label className="block text-white text-sm font-medium mb-2" htmlFor="confirmPassword">
                  Confirmar Senha
                </label>
                <input
                  className="w-full bg-purple-900 bg-opacity-50 text-white border border-purple-500 rounded py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-400"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="flex items-center justify-between mb-4">
              {isLogin && (
                <div className="flex items-center">
                  <input
                    id="remember"
                    name="remember"
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember" className="ml-2 block text-sm text-white">
                    Lembrar-me
                  </label>
                </div>
              )}
              
              {isLogin && (
                <div className="text-sm">
                  <a href="#" className="text-purple-300 hover:text-purple-200">
                    Esqueceu a senha?
                  </a>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 transition duration-200 ease-in-out transform hover:scale-105 shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </span>
              ) : (
                isLogin ? 'Entrar' : 'Registrar'
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Decorações */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-purple-500 rounded-full opacity-10 blur-xl"></div>
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-400 rounded-full opacity-10 blur-xl"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-purple-300 rounded-full opacity-10 blur-xl"></div>
    </div>
  );
};

export default LoginRegisterPage;