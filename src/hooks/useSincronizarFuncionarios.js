import { useEffect } from 'react';
import { useFuncionarios } from '../context/FuncionariosContext';

// Hook personalizado para sincronizar usuários registrados como funcionários
export const useSincronizarFuncionarios = () => {
  const { funcionarios, adicionarFuncionario } = useFuncionarios();

  useEffect(() => {
    // Recupera usuários registrados do localStorage
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Para cada usuário registrado, verifica se já existe como funcionário
    registeredUsers.forEach(user => {
      // Verifica se o usuário já existe na lista de funcionários
      const funcionarioExistente = funcionarios.find(f => f.id === user.id);
      
      // Se não existir, adiciona à lista de funcionários
      if (!funcionarioExistente) {
        adicionarFuncionario({
          id: user.id,
          nome: user.name
        });
      }
    });
  }, [funcionarios, adicionarFuncionario]);

  return null; // Este hook não retorna nada, apenas executa efeitos colaterais
};