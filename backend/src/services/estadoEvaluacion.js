// Estado en memoria para las evaluaciones
const evaluacionesPorJuez = {};
let ultimaEvaluacionGlobal = null;
const colaPantallaPublica = []; // Cola de gimnastas enviadas (estilo banco)
const MAX_COLA = 10; // Máximo de gimnastas visibles en pantalla

// Estado para el modo rotación
let modoRotacionActivo = false;

module.exports = {
  getUltimaEvaluacion: () => {
    return ultimaEvaluacionGlobal;
  },
  
  getUltimaEvaluacionJuez: (juezId) => {
    return evaluacionesPorJuez[juezId] || null;
  },
  
  setUltimaEvaluacion: (evaluacion) => {
    // Guarda la evaluación global para la pantalla pública
    ultimaEvaluacionGlobal = evaluacion;
    
    // Agregar a la cola de pantalla pública
    colaPantallaPublica.unshift({
      ...evaluacion,
      id_cola: Date.now() + Math.random()
    });
    
    // Mantener solo las últimas MAX_COLA
    if (colaPantallaPublica.length > MAX_COLA) {
      colaPantallaPublica.length = MAX_COLA;
    }
  },
  
  setUltimaEvaluacionJuez: (juezId, evaluacion) => {
    evaluacionesPorJuez[juezId] = evaluacion;
  },
  
  getColaPantallaPublica: () => {
    return [...colaPantallaPublica];
  },
  
  limpiarUltimaEvaluacion: () => {
    ultimaEvaluacionGlobal = null;
    colaPantallaPublica.length = 0;
    Object.keys(evaluacionesPorJuez).forEach(key => {
      delete evaluacionesPorJuez[key];
    });
  },
  
  limpiarEvaluacionJuez: (juezId) => {
    delete evaluacionesPorJuez[juezId];
  },
  
  getAllEvaluaciones: () => {
    return { ...evaluacionesPorJuez };
  },

  // ✅ Funciones nuevas para el modo rotación
  setModoRotacion: (activo) => {
    modoRotacionActivo = activo;
  },
  
  getModoRotacion: () => {
    return modoRotacionActivo;
  }
};