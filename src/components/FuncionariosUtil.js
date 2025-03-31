// Crie um arquivo FuncionariosUtil.js
const FUNCIONARIOS_KEY = 'sistema_funcionarios';

export const getFuncionarios = () => {
  const stored = localStorage.getItem(FUNCIONARIOS_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addFuncionario = (funcionario) => {
  const funcionarios = getFuncionarios();
  const exists = funcionarios.some(f => f.id === funcionario.id);
  
  if (!exists) {
    const updatedList = [...funcionarios, funcionario];
    localStorage.setItem(FUNCIONARIOS_KEY, JSON.stringify(updatedList));
    return updatedList;
  }
  
  return funcionarios;
};

export const refreshFuncionarios = (setFuncionariosFn) => {
  const funcionarios = getFuncionarios();
  setFuncionariosFn(funcionarios);
  return funcionarios;
};