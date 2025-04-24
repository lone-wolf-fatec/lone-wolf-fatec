// src/utils/timeUtils.js

// Função para calcular a diferença entre dois horários (formato HH:MM)
export const calcularHorasTrabalhadas = (horaInicio, horaFim) => {
    const [horasInicio, minutosInicio] = horaInicio.split(':').map(Number);
    const [horasFim, minutosFim] = horaFim.split(':').map(Number);
    
    let totalMinutos = (horasFim * 60 + minutosFim) - (horasInicio * 60 + minutosInicio);
    
    // Se der negativo (por exemplo, trabalhando após meia-noite), ajustar
    if (totalMinutos < 0) {
      totalMinutos += 24 * 60;
    }
    
    const horas = Math.floor(totalMinutos / 60);
    const minutos = totalMinutos % 60;
    
    return [horas, minutos];
  };
  
  // Função para verificar se um horário está atrasado em relação ao horário esperado
  export const verificarAtraso = (horarioRegistrado, horarioEsperado, toleranciaMinutos = 10) => {
    const [horasRegistrado, minutosRegistrado] = horarioRegistrado.split(':').map(Number);
    const [horasEsperado, minutosEsperado] = horarioEsperado.split(':').map(Number);
    
    const minutosRegistradoTotal = horasRegistrado * 60 + minutosRegistrado;
    const minutosEsperadoTotal = horasEsperado * 60 + minutosEsperado;
    
    // Verifica se o horário registrado é posterior ao esperado + tolerância
    return minutosRegistradoTotal > (minutosEsperadoTotal + toleranciaMinutos);
  };