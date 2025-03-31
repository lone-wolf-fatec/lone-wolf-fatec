import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { FuncionariosProvider } from './context/FuncionariosContext';

// Componente que encapsula todos os providers necessários na aplicação
const AppProvider = ({ children }) => {
  return (
    <Router>
      <FuncionariosProvider>
        {children}
      </FuncionariosProvider>
    </Router>
  );
};

export default AppProvider;