import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const ResultadosView = () => {
  const navigate = useNavigate();
  const [resultados, setResultados] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroZona, setFiltroZona] = useState('');
  const [filtroTorneo, setFiltroTorneo] = useState('');
  const [cambios, setCambios] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    fetchResultados();
  }, [filtroGrupo, filtroZona, filtroTorneo]);

  const cargarDatos = async () => {
    try {
      const [gruposRes, zonasRes, torneosRes] = await Promise.all([
        api.get('/grupos'),
        api.get('/zonas'),
        api.get('/torneos')
      ]);
      setGrupos(gruposRes.data);
      setZonas(zonasRes.data);
      setTorneos(torneosRes.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
    }
  };

  const fetchResultados = async () => {
    try {
      setLoading(true);
      let url = '/evaluaciones/resultados?';
      if (filtroGrupo) url += `grupo_id=${filtroGrupo}&`;
      if (filtroZona) url += `zona_id=${filtroZona}&`;
      if (filtroTorneo) url += `torneo_id=${filtroTorneo}&`;

      const response = await api.get(url);
      setResultados(response.data);
      setCambios({});
    } catch (err) {
      console.error('Error al cargar resultados:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltroGrupo('');
    setFiltroZona('');
    setFiltroTorneo('');
  };

  const handlePuntajeChange = (gimnastaId, aparato, valor) => {
    const valorNumerico = parseFloat(valor) || 0;
    const valorValido = Math.max(0, Math.min(10, valorNumerico));
    
    // Actualizar estado de cambios
    setCambios(prev => {
      const nuevosCambios = {
        ...prev,
        [gimnastaId]: {
          ...prev[gimnastaId],
          [aparato]: valorValido
        }
      };
      console.log('Cambios actualizados:', nuevosCambios);
      return nuevosCambios;
    });
    
    // Actualizar el total en la vista
    setResultados(prev => prev.map(r => {
      if (r.gimnasta_id === gimnastaId) {
        const nuevosResultados = { ...r, [aparato]: valorValido };
        const suelo = parseFloat(nuevosResultados.suelo) || 0;
        const salto = parseFloat(nuevosResultados.salto) || 0;
        const vigas = parseFloat(nuevosResultados.vigas) || 0;
        const paralelas = parseFloat(nuevosResultados.paralelas) || 0;
        nuevosResultados.total = suelo + salto + vigas + paralelas;
        return nuevosResultados;
      }
      return r;
    }));
  };

  const handleGuardarCambios = async () => {
    console.log('Cambios a guardar:', cambios);
    
    if (Object.keys(cambios).length === 0) {
      setMensaje({ tipo: 'error', texto: 'No hay cambios para guardar' });
      return;
    }

    setGuardando(true);
    setMensaje({ tipo: 'info', texto: 'Guardando cambios...' });
    
    try {
      const promesas = [];
      
      for (const [gimnastaId, cambiosGimnasta] of Object.entries(cambios)) {
        for (const [aparato, valor] of Object.entries(cambiosGimnasta)) {
          console.log(`Enviando: gimnasta_id=${gimnastaId}, aparato=${aparato}, puntaje=${valor}`);
          promesas.push(
            api.put('/evaluaciones/evaluacion', {
              gimnasta_id: Number(gimnastaId),
              aparato,
              puntaje: valor
            })
          );
        }
      }
      
      await Promise.all(promesas);
      setMensaje({ tipo: 'success', texto: `¡${promesas.length} cambios guardados exitosamente!` });
      setCambios({});
      await fetchResultados();
    } catch (error) {
      console.error('Error al guardar:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error al guardar: ' + (error.response?.data?.error || error.message) 
      });
    } finally {
      setGuardando(false);
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 5000);
    }
  };

  const getPuntajeActual = (fila, aparato) => {
    if (cambios[fila.gimnasta_id] && cambios[fila.gimnasta_id][aparato] !== undefined) {
      return cambios[fila.gimnasta_id][aparato];
    }
    return parseFloat(fila[aparato]) || 0;
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>📊 Resultados del Torneo</h2>
        <div style={styles.headerButtons}>
          <button onClick={() => navigate('/ranking')} style={styles.rankingButton}>
            🏆 Ver Ranking Final
          </button>
          <button onClick={fetchResultados} style={styles.refreshButton}>
            🔄 Actualizar
          </button>
          <button 
            onClick={handleGuardarCambios} 
            disabled={Object.keys(cambios).length === 0 || guardando}
            style={{
              ...styles.saveButton,
              opacity: Object.keys(cambios).length === 0 || guardando ? 0.5 : 1,
              cursor: Object.keys(cambios).length === 0 || guardando ? 'not-allowed' : 'pointer'
            }}
          >
            {guardando ? '⏳ Guardando...' : `💾 Guardar Cambios (${Object.keys(cambios).length})`}
          </button>
        </div>
      </div>

      {/* Panel de filtros */}
      <div style={styles.filterPanel}>
        <div style={styles.filterRow}>
          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Torneo:</label>
            <select 
              value={filtroTorneo} 
              onChange={(e) => setFiltroTorneo(e.target.value)}
              style={styles.select}
            >
              <option value="">Todos los torneos</option>
              {torneos.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Grupo:</label>
            <select 
              value={filtroGrupo} 
              onChange={(e) => setFiltroGrupo(e.target.value)}
              style={styles.select}
            >
              <option value="">Todos los grupos</option>
              {grupos.map(g => (
                <option key={g.id} value={g.id}>{g.nombre}</option>
              ))}
            </select>
          </div>

          <div style={styles.filterGroup}>
            <label style={styles.filterLabel}>Zona:</label>
            <select 
              value={filtroZona} 
              onChange={(e) => setFiltroZona(e.target.value)}
              style={styles.select}
            >
              <option value="">Todas las zonas</option>
              {zonas.map(z => (
                <option key={z.id} value={z.id}>{z.nombre}</option>
              ))}
            </select>
          </div>

          <button onClick={handleLimpiarFiltros} style={styles.clearButton}>
            🗑️ Limpiar Filtros
          </button>
        </div>
      </div>

      {/* Mensaje de estado */}
      {mensaje.texto && (
        <div style={{
          ...styles.message,
          backgroundColor: mensaje.tipo === 'error' ? 'rgba(216, 55, 45, 0.1)' : 
                          mensaje.tipo === 'success' ? 'rgba(45, 122, 62, 0.1)' : 'rgba(210, 177, 120, 0.2)',
          color: mensaje.tipo === 'error' ? '#d8372d' : 
                 mensaje.tipo === 'success' ? '#2d7a3e' : '#4a2c2a',
          borderLeft: `4px solid ${mensaje.tipo === 'error' ? '#d8372d' : 
                                   mensaje.tipo === 'success' ? '#2d7a3e' : '#d2b178'}`
        }}>
          {mensaje.texto}
        </div>
      )}

      {/* Estadísticas */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{resultados.length}</div>
          <div style={styles.statLabel}>Total Gimnastas</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {resultados.filter(r => parseFloat(r.total) > 0).length}
          </div>
          <div style={styles.statLabel}>Con Evaluaciones</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>
            {resultados.length > 0 ? Math.max(...resultados.map(r => parseFloat(r.total))).toFixed(2) : '0'}
          </div>
          <div style={styles.statLabel}>Puntaje Máximo</div>
        </div>
        <div style={styles.statCard}>
          <div style={{...styles.statNumber, color: '#d2b178'}}>
            {Object.keys(cambios).length}
          </div>
          <div style={styles.statLabel}>Cambios Pendientes</div>
        </div>
      </div>

      {/* Tabla de resultados */}
      {loading ? (
        <div style={styles.loading}>⏳ Cargando resultados...</div>
      ) : resultados.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>No hay resultados disponibles</h3>
          <p>Aún no se han registrado evaluaciones o no coinciden con los filtros seleccionados.</p>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Gimnasta</th>
                <th style={styles.th}>Institución</th>
                <th style={styles.th}>Nivel</th>
                <th style={styles.th}>Categoría</th>
                <th style={styles.th}>Grupo</th>
                <th style={styles.th}>Zona</th>
                <th style={styles.thAparato}>🤸 Suelo</th>
                <th style={styles.thAparato}> Salto</th>
                <th style={styles.thAparato}>⚖️ Vigas</th>
                <th style={styles.thAparato}>🔗 Paralelas</th>
                <th style={styles.thTotal}>TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((row, index) => {
                const tieneEvaluaciones = parseFloat(row.total) > 0;
                
                const suelo = getPuntajeActual(row, 'suelo');
                const salto = getPuntajeActual(row, 'salto');
                const vigas = getPuntajeActual(row, 'vigas');
                const paralelas = getPuntajeActual(row, 'paralelas');
                
                return (
                  <tr 
                    key={row.gimnasta_id} 
                    style={{
                      ...styles.tr,
                      backgroundColor: !tieneEvaluaciones ? '#f9f9f9' : 
                                      (index % 2 === 0 ? '#ffffff' : '#faf8f3'),
                    }}
                  >
                    <td style={styles.tdNombre}>
                      <strong>{row.gimnasta_nombre}</strong>
                    </td>
                    <td style={styles.td}>{row.institucion}</td>
                    <td style={styles.td}>{row.nivel || '-'}</td>
                    <td style={styles.td}>{row.categoria || '-'}</td>
                    <td style={styles.td}>{row.grupo || '-'}</td>
                    <td style={styles.td}>{row.zona || '-'}</td>
                    
                    <td style={styles.tdAparato}>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={suelo}
                        onChange={(e) => handlePuntajeChange(row.gimnasta_id, 'suelo', e.target.value)}
                        style={{
                          ...styles.puntajeInput,
                          backgroundColor: cambios[row.gimnasta_id]?.suelo !== undefined ? '#fff3cd' : '#ffffff'
                        }}
                      />
                    </td>
                    
                    <td style={styles.tdAparato}>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={salto}
                        onChange={(e) => handlePuntajeChange(row.gimnasta_id, 'salto', e.target.value)}
                        style={{
                          ...styles.puntajeInput,
                          backgroundColor: cambios[row.gimnasta_id]?.salto !== undefined ? '#fff3cd' : '#ffffff'
                        }}
                      />
                    </td>
                    
                    <td style={styles.tdAparato}>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={vigas}
                        onChange={(e) => handlePuntajeChange(row.gimnasta_id, 'vigas', e.target.value)}
                        style={{
                          ...styles.puntajeInput,
                          backgroundColor: cambios[row.gimnasta_id]?.vigas !== undefined ? '#fff3cd' : '#ffffff'
                        }}
                      />
                    </td>
                    
                    <td style={styles.tdAparato}>
                      <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.1"
                        value={paralelas}
                        onChange={(e) => handlePuntajeChange(row.gimnasta_id, 'paralelas', e.target.value)}
                        style={{
                          ...styles.puntajeInput,
                          backgroundColor: cambios[row.gimnasta_id]?.paralelas !== undefined ? '#fff3cd' : '#ffffff'
                        }}
                      />
                    </td>
                    
                    <td style={styles.tdTotal}>
                      <span style={{
                        ...styles.puntajeTotal,
                        backgroundColor: tieneEvaluaciones ? '#d8372d' : '#cccccc'
                      }}>
                        {tieneEvaluaciones ? parseFloat(row.total).toFixed(2) : '0.00'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '1.8rem',
    color: '#170000',
    fontWeight: '600',
  },
  rankingButton: {
    backgroundColor: '#170000',
    color: '#d2b178',
    border: '2px solid #d2b178',
    borderRadius: '8px',
    padding: '12px 25px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  refreshButton: {
    backgroundColor: '#d2b178',
    color: '#170000',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  saveButton: {
    backgroundColor: '#d8372d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '1rem',
    fontWeight: '700',
  },
  filterPanel: {
    backgroundColor: '#f5ebe0',
    padding: '20px',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '2px solid #e8d5b5',
  },
  filterRow: {
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  filterLabel: {
    fontWeight: '700',
    color: '#170000',
    fontSize: '0.9rem',
  },
  select: {
    padding: '8px 12px',
    border: '2px solid #d2b178',
    borderRadius: '5px',
    fontSize: '0.95rem',
    backgroundColor: '#ffffff',
    minWidth: '180px',
    cursor: 'pointer',
  },
  clearButton: {
    backgroundColor: '#d8372d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 15px',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginLeft: 'auto',
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
    marginBottom: '20px',
  },
  statCard: {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: '2px solid #e8d5b5',
  },
  statNumber: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#d8372d',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '0.95rem',
    color: '#4a2c2a',
    fontWeight: '600',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#4a2c2a',
    fontSize: '1.2rem',
  },
  emptyState: {
    textAlign: 'center',
    padding: '50px 20px',
    color: '#4a2c2a',
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '2px solid #d8372d',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#ffffff',
  },
  th: {
    backgroundColor: '#170000',
    color: '#d2b178',
    padding: '14px 10px',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '0.9rem',
    border: '1px solid #d2b178',
  },
  thAparato: {
    backgroundColor: '#d8372d',
    color: '#ffffff',
    padding: '14px 10px',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '0.9rem',
    border: '1px solid #170000',
  },
  thTotal: {
    backgroundColor: '#d2b178',
    color: '#170000',
    padding: '14px 10px',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '1rem',
    border: '2px solid #170000',
  },
  tr: {
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '12px 10px',
    border: '1px solid #e8d5b5',
    textAlign: 'center',
    fontSize: '0.95rem',
  },
  tdNombre: {
    padding: '12px 10px',
    border: '1px solid #e8d5b5',
    textAlign: 'left',
    fontSize: '0.95rem',
    fontWeight: '600',
  },
  tdAparato: {
    padding: '12px 10px',
    border: '1px solid #e8d5b5',
    textAlign: 'center',
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#4a2c2a',
  },
  tdTotal: {
    padding: '12px 10px',
    border: '2px solid #d8372d',
    textAlign: 'center',
    fontSize: '1.1rem',
    fontWeight: '700',
  },
  puntajeTotal: {
    backgroundColor: '#d8372d',
    color: '#ffffff',
    padding: '8px 15px',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '1.1rem',
    display: 'inline-block',
    minWidth: '80px',
  },
  puntajeInput: {
    width: '80px',
    padding: '8px',
    border: '2px solid #d2b178',
    borderRadius: '5px',
    fontSize: '0.95rem',
    textAlign: 'center',
    fontWeight: '600',
  },
  message: {
    padding: '12px 20px',
    margin: '10px 20px',
    borderRadius: '4px',
    fontWeight: '600',
    textAlign: 'center',
  },
};

export default ResultadosView;