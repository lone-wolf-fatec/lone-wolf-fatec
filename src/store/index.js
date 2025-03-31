
// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import horasExtrasReducer from './horasExtrasSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    horasExtras: horasExtrasReducer
  }
});

// store/userSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentUser: JSON.parse(localStorage.getItem('user') || 'null'),
  loading: false,
  error: null
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.currentUser = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    clearUser: (state) => {
      state.currentUser = null;
      localStorage.removeItem('user');
    }
  }
});

export const { setUser, clearUser } = userSlice.actions;

export const selectCurrentUser = (state) => state.user.currentUser;

export default userSlice.reducer;

// store/horasExtrasSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Função para carregar dados do localStorage
const loadHorasExtrasFromStorage = () => {
  try {
    const storedData = localStorage.getItem('overtimeEntries');
    return storedData ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error('Erro ao carregar horas extras do localStorage:', error);
    return [];
  }
};

// Função para salvar dados no localStorage
const saveHorasExtrasToStorage = (entries) => {
  try {
    localStorage.setItem('overtimeEntries', JSON.stringify(entries));
  } catch (error) {
    console.error('Erro ao salvar horas extras no localStorage:', error);
  }
};

// Thunk para adicionar nova hora extra
export const addHoraExtra = createAsyncThunk(
  'horasExtras/add',
  async (newEntry, { getState }) => {
    const currentEntries = [...getState().horasExtras.entries];
    const updatedEntries = [newEntry, ...currentEntries];
    saveHorasExtrasToStorage(updatedEntries);
    
    // Adicionar notificação para o funcionário
    const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    notificacoes.push({
      id: Date.now(),
      userId: newEntry.funcionarioId,
      message: `Hora extra registrada para ${newEntry.date}: ${newEntry.hours}h.`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    });
    localStorage.setItem('userNotifications', JSON.stringify(notificacoes));
    
    return updatedEntries;
  }
);

// Thunk para atualizar status de uma hora extra
export const updateHoraExtraStatus = createAsyncThunk(
  'horasExtras/updateStatus',
  async ({ id, newStatus, observacao }, { getState }) => {
    const currentEntries = [...getState().horasExtras.entries];
    const entryIndex = currentEntries.findIndex(entry => entry.id === id);
    
    if (entryIndex === -1) {
      throw new Error('Entrada não encontrada');
    }
    
    const updatedEntries = [...currentEntries];
    updatedEntries[entryIndex] = {
      ...updatedEntries[entryIndex],
      status: newStatus
    };
    
    if (newStatus === 'rejeitado' && observacao) {
      updatedEntries[entryIndex].observacao = observacao;
    }
    
    saveHorasExtrasToStorage(updatedEntries);
    
    // Adicionar notificação para o funcionário
    const notificacoes = JSON.parse(localStorage.getItem('userNotifications') || '[]');
    notificacoes.push({
      id: Date.now(),
      userId: updatedEntries[entryIndex].funcionarioId,
      message: `Sua solicitação de hora extra para ${updatedEntries[entryIndex].date} foi ${newStatus === 'aprovado' ? 'aprovada' : 'rejeitada'}.`,
      date: new Date().toLocaleDateString('pt-BR'),
      read: false
    });
    localStorage.setItem('userNotifications', JSON.stringify(notificacoes));
    
    return updatedEntries;
  }
);

// Thunk para detectar horas extras automaticamente
export const detectHorasExtras = createAsyncThunk(
  'horasExtras/detect',
  async (_, { getState }) => {
    const currentEntries = [...getState().horasExtras.entries];
    const pontoRegistros = JSON.parse(localStorage.getItem('pontoRegistros') || '[]');
    let horasExtrasDetectadas = [];
    
    // Percorrer registros de ponto
    pontoRegistros.forEach(registro => {
      // Verificar se já existe uma hora extra para este funcionário e dia
      const horaExtraExistente = currentEntries.find(
        he => he.funcionarioId === registro.funcionarioId && he.date === registro.data
      );
      
      if (!horaExtraExistente) {
        // Verificar se há registro de hora extra
        // Simplificação: se saiu depois das 18h, considera hora extra
        const ultimoRegistro = registro.registros[registro.registros.length - 1];
        
        if (ultimoRegistro && ultimoRegistro.hora && ultimoRegistro.hora !== '--:--') {
          const horaSaida = ultimoRegistro.hora.split(':').map(Number);
          
          // Se saiu depois das 18h
          if (horaSaida[0] >= 18) {
            const horasExtras = horaSaida[0] - 18 + (horaSaida[1] / 60);
            
            if (horasExtras > 0) {
              horasExtrasDetectadas.push({
                id: Date.now() + Math.random(),
                funcionarioId: registro.funcionarioId,
                funcionarioNome: registro.funcionarioNome,
                date: registro.data,
                hours: parseFloat(horasExtras.toFixed(1)),
                status: 'detectado',
                reason: 'Detectado automaticamente',
                auto: true
              });
            }
          }
        }
      }
    });
    
    const updatedEntries = [...horasExtrasDetectadas, ...currentEntries];
    saveHorasExtrasToStorage(updatedEntries);
    
    return {
      updatedEntries,
      detected: horasExtrasDetectadas.length
    };
  }
);

// Slice de horas extras
const initialState = {
  entries: loadHorasExtrasFromStorage(),
  loading: false,
  error: null,
  detectedCount: 0
};

const horasExtrasSlice = createSlice({
  name: 'horasExtras',
  initialState,
  reducers: {
    // Reducer para caso de necessidade de manipular diretamente
    setHorasExtras: (state, action) => {
      state.entries = action.payload;
      saveHorasExtrasToStorage(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // addHoraExtra
      .addCase(addHoraExtra.pending, (state) => {
        state.loading = true;
      })
      .addCase(addHoraExtra.fulfilled, (state, action) => {
        state.entries = action.payload;
        state.loading = false;
      })
      .addCase(addHoraExtra.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // updateHoraExtraStatus
      .addCase(updateHoraExtraStatus.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateHoraExtraStatus.fulfilled, (state, action) => {
        state.entries = action.payload;
        state.loading = false;
      })
      .addCase(updateHoraExtraStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      
      // detectHorasExtras
      .addCase(detectHorasExtras.pending, (state) => {
        state.loading = true;
      })
      .addCase(detectHorasExtras.fulfilled, (state, action) => {
        state.entries = action.payload.updatedEntries;
        state.detectedCount = action.payload.detected;
        state.loading = false;
      })
      .addCase(detectHorasExtras.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setHorasExtras } = horasExtrasSlice.actions;

export const selectAllHorasExtras = (state) => state.horasExtras.entries;
export const selectHorasExtrasByFuncionario = (state, funcionarioId) => 
  state.horasExtras.entries.filter(entry => parseInt(entry.funcionarioId) === parseInt(funcionarioId));
export const selectApprovedHorasExtrasByFuncionario = (state, funcionarioId) => 
  state.horasExtras.entries.filter(
    entry => parseInt(entry.funcionarioId) === parseInt(funcionarioId) && 
            (entry.status === 'aprovado' || entry.status === 'detectado')
  );
export const selectHorasExtrasLoading = (state) => state.horasExtras.loading;
export const selectHorasExtrasError = (state) => state.horasExtras.error;
export const selectDetectedCount = (state) => state.horasExtras.detectedCount;

export default horasExtrasSlice.reducer;