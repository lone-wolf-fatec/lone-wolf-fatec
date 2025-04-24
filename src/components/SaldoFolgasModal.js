import React, { useState, useEffect } from 'react';

const SaldoFolgasModal = ({ isOpen, onClose, funcionarioId, funcionarioNome, onSave }) => {
  const [saldos, setSaldos] = useState({
    abonos: 0,
    bancoHoras: 0,
    diasCompensacao: 0
  });

  // Carregar saldos atuais do funcionário quando o modal abrir
  useEffect(() => {
    if (isOpen && funcionarioId) {
      // Buscar funcionário de todas as fontes possíveis
      const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
      
      // Procurar em registeredUsers
      let funcionario = registeredUsers.find(u => u.id === funcionarioId);
      
      // Se não encontrou, procurar em funcionarios
      if (!funcionario) {
        funcionario = funcionarios.find(f => f.id === funcionarioId);
      }
      
      // Se encontrou o funcionário, atualizar saldos
      if (funcionario) {
        setSaldos({
          abonos: funcionario.abonos || 0,
          bancoHoras: funcionario.bancoHoras || 0,
          diasCompensacao: funcionario.diasCompensacao || 0
        });
      } else {
        // Se não encontrou, iniciar com valores padrão
        setSaldos({
          abonos: 0,
          bancoHoras: 0,
          diasCompensacao: 0
        });
      }
    }
  }, [isOpen, funcionarioId]);

  // Funções para incrementar/decrementar valores
  const incrementar = (campo) => {
    setSaldos(prev => ({
      ...prev,
      [campo]: prev[campo] + 1
    }));
  };

  const decrementar = (campo) => {
    setSaldos(prev => ({
      ...prev,
      [campo]: Math.max(0, prev[campo] - 1)
    }));
  };

  // Função para lidar com mudanças manuais nos inputs
  const handleInputChange = (e, campo) => {
    const valor = e.target.value === '' ? 0 : parseInt(e.target.value, 10);
    if (!isNaN(valor) && valor >= 0) {
      setSaldos(prev => ({
        ...prev,
        [campo]: valor
      }));
    }
  };

  // Função para salvar as alterações
  const salvarAlteracoes = () => {
    // Atualizar em registeredUsers
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const updatedUsers = registeredUsers.map(user => {
      if (user.id === funcionarioId) {
        return {
          ...user,
          abonos: saldos.abonos,
          bancoHoras: saldos.bancoHoras,
          diasCompensacao: saldos.diasCompensacao
        };
      }
      return user;
    });
    localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    
    // Atualizar em funcionarios
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
    const funcionarioIndex = funcionarios.findIndex(f => f.id === funcionarioId);
    
    if (funcionarioIndex !== -1) {
      // Funcionário já existe
      funcionarios[funcionarioIndex] = {
        ...funcionarios[funcionarioIndex],
        abonos: saldos.abonos,
        bancoHoras: saldos.bancoHoras,
        diasCompensacao: saldos.diasCompensacao
      };
    } else {
      // Funcionário não existe, adicioná-lo
      funcionarios.push({
        id: funcionarioId,
        nome: funcionarioNome,
        abonos: saldos.abonos,
        bancoHoras: saldos.bancoHoras,
        diasCompensacao: saldos.diasCompensacao
      });
    }
    
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
    
    // Notificar o componente pai sobre a alteração
    if (onSave) {
      onSave(saldos);
    }
    
    // Fechar o modal
    onClose();
  };

  // Se o modal não estiver aberto, não renderizar nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-purple-900 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">
          Ajustar Saldo de Folgas - {funcionarioNome}
        </h3>
        
        {/* Abonos */}
        <div className="mb-4">
          <label className="block text-sm text-purple-300 mb-1">Abonos Disponíveis</label>
          <div className="flex items-center">
            <button 
              onClick={() => decrementar('abonos')}
              className="bg-purple-700 hover:bg-purple-600 text-white py-2 px-3 rounded-l"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              className="w-16 text-center bg-purple-800 border-t border-b border-purple-700 py-2 text-white"
              value={saldos.abonos}
              onChange={(e) => handleInputChange(e, 'abonos')}
            />
            <button 
              onClick={() => incrementar('abonos')}
              className="bg-purple-700 hover:bg-purple-600 text-white py-2 px-3 rounded-r"
            >
              +
            </button>
            <span className="ml-2 text-sm text-purple-300">dias</span>
          </div>
        </div>
        
        {/* Banco de Horas */}
        <div className="mb-4">
          <label className="block text-sm text-purple-300 mb-1">Banco de Horas</label>
          <div className="flex items-center">
            <button 
              onClick={() => decrementar('bancoHoras')}
              className="bg-purple-700 hover:bg-purple-600 text-white py-2 px-3 rounded-l"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              className="w-16 text-center bg-purple-800 border-t border-b border-purple-700 py-2 text-white"
              value={saldos.bancoHoras}
              onChange={(e) => handleInputChange(e, 'bancoHoras')}
            />
            <button 
              onClick={() => incrementar('bancoHoras')}
              className="bg-purple-700 hover:bg-purple-600 text-white py-2 px-3 rounded-r"
            >
              +
            </button>
            <span className="ml-2 text-sm text-purple-300">horas</span>
          </div>
        </div>
        
        {/* Dias de Compensação */}
        <div className="mb-6">
          <label className="block text-sm text-purple-300 mb-1">Dias de Compensação</label>
          <div className="flex items-center">
            <button 
              onClick={() => decrementar('diasCompensacao')}
              className="bg-purple-700 hover:bg-purple-600 text-white py-2 px-3 rounded-l"
            >
              -
            </button>
            <input
              type="number"
              min="0"
              className="w-16 text-center bg-purple-800 border-t border-b border-purple-700 py-2 text-white"
              value={saldos.diasCompensacao}
              onChange={(e) => handleInputChange(e, 'diasCompensacao')}
            />
            <button 
              onClick={() => incrementar('diasCompensacao')}
              className="bg-purple-700 hover:bg-purple-600 text-white py-2 px-3 rounded-r"
            >
              +
            </button>
            <span className="ml-2 text-sm text-purple-300">dias</span>
          </div>
        </div>
        
        {/* Botões */}
        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={salvarAlteracoes}
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-md font-medium"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaldoFolgasModal;