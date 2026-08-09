import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const RankingFinal = () => {
  const navigate = useNavigate();
  const [resultados, setResultados] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroGrupo, setFiltroGrupo] = useState('');
  const [filtroZona, setFiltroZona] = useState('');
  const [filtroTorneo, setFiltroTorneo] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // ✅ ESTADO CLAVE: Lista de gimnastas ya enviadas (persiste en sesión)
  const [enviados, setEnviados] = useState([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    fetchRanking();
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

  const fetchRanking = async () => {
    try {
      setLoading(true);
      let url = '/evaluaciones/resultados?';
      if (filtroGrupo) url += `grupo_id=${filtroGrupo}&`;
      if (filtroZona) url += `zona_id=${filtroZona}&`;
      if (filtroTorneo) url += `torneo_id=${filtroTorneo}&`;

      const response = await api.get(url);
      setResultados(response.data);
    } catch (err) {
      console.error('Error al cargar ranking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLimpiarFiltros = () => {
    setFiltroGrupo('');
    setFiltroZona('');
    setFiltroTorneo('');
  };

  const getMedalla = (posicion) => {
    if (posicion === 1) return '🥇';
    if (posicion === 2) return '🥈';
    if (posicion === 3) return '🥉';
    return '';
  };

  // ✅ Enviar a pantalla y bloquear permanentemente
  const enviarAPantalla = async (gimnasta) => {
    // Evitar doble envío
    if (enviados.includes(gimnasta.gimnasta_id)) {
      setMensaje({ 
        tipo: 'error', 
        texto: `⚠️ ${gimnasta.gimnasta_nombre} ya fue enviada` 
      });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      return;
    }

    try {
      await api.post('/evaluaciones/enviar-pantalla', {
        gimnasta_id: gimnasta.gimnasta_id,
        aparato: 'general',
        puntaje: gimnasta.total
      });
      
      // ✅ Agregar a la lista de enviadas (NO se puede quitar hasta recargar)
      setEnviados(prev => [...prev, gimnasta.gimnasta_id]);
      
      setMensaje({ 
        tipo: 'success', 
        texto: `✅ ${gimnasta.gimnasta_nombre} enviada a pantalla pública (Posición #${gimnasta.posicion})` 
      });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    } catch (error) {
      console.error('Error al enviar:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error al enviar a pantalla pública' 
      });
    }
  };

  // ✅ Resetear todas las enviadas (solo con confirmación)
  const resetearEnviados = () => {
    if (window.confirm('¿Resetear todas las gimnastas enviadas? Podrás volver a enviarlas.')) {
      setEnviados([]);
      setMensaje({ tipo: 'success', texto: '🔄 Lista de enviadas reseteada' });
      setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
    }
  };

  const limpiarPantallaPublica = async () => {
    if (window.confirm('¿Limpiar la pantalla pública?')) {
      try {
        await api.post('/evaluaciones/limpiar-pantalla');
        setMensaje({ tipo: 'success', texto: '🗑️ Pantalla pública limpiada' });
        setTimeout(() => setMensaje({ tipo: '', texto: '' }), 3000);
      } catch (error) {
        console.error('Error al limpiar:', error);
        setMensaje({ tipo: 'error', texto: 'Error al limpiar pantalla' });
      }
    }
  };

  const abrirPantallaPublica = () => {
    window.open('/publico', '_blank');
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}>🏆 Ranking Final</h2>
        <div style={styles.headerButtons}>
          <button 
            onClick={resetearEnviados} 
            style={styles.resetButton}
            title="Resetear lista de enviadas"
          >
            🔄 Resetear Enviadas
          </button>
          <button 
            onClick={limpiarPantallaPublica} 
            style={styles.cleanButton}
            title="Limpiar pantalla pública"
          >
            🗑️ Limpiar Pantalla
          </button>
          <button 
            onClick={abrirPantallaPublica} 
            style={styles.publicButton}
            title="Abrir pantalla pública en nueva pestaña"
          >
            📺 Pantalla Pública
          </button>
          <button 
            onClick={() => navigate('/admin')} 
            style={styles.backButton}
          >
            ← Volver al Panel
          </button>
        </div>
      </div>

      {mensaje.texto && (
        <div style={{
          ...styles.message,
          backgroundColor: mensaje.tipo === 'error' ? 'rgba(216, 55, 45, 0.1)' : 'rgba(45, 122, 62, 0.1)',
          color: mensaje.tipo === 'error' ? '#d8372d' : '#2d7a3e',
          borderLeft: `4px solid ${mensaje.tipo === 'error' ? '#d8372d' : '#2d7a3e'}`
        }}>
          {mensaje.texto}
        </div>
      )}

      {/* Contador */}
      <div style={styles.contadorPanel}>
        <span style={styles.contadorText}>
          📤 Enviadas: <strong>{enviados.length}</strong>
        </span>
        <span style={styles.contadorText}>
          ⏳ Pendientes: <strong>{resultados.filter(r => !enviados.includes(r.gimnasta_id) && parseFloat(r.total) > 0).length}</strong>
        </span>
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

      {/* Tabla de ranking */}
      {loading ? (
        <div style={styles.loading}>⏳ Cargando ranking...</div>
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
                <th style={styles.thAparato}>🏃 Salto</th>
                <th style={styles.thAparato}>⚖️ Vigas</th>
                <th style={styles.thAparato}>🔗 Paralelas</th>
                <th style={styles.thTotal}>TOTAL</th>
                <th style={styles.thPos}>Pos</th>
                <th style={styles.thAction}>Acción</th>
              </tr>
            </thead>
            <tbody>
              {resultados.map((row, index) => {
                const posicion = parseInt(row.posicion) || index + 1;
                const medalla = getMedalla(posicion);
                const tieneEvaluaciones = parseFloat(row.total) > 0;
                const yaEnviado = enviados.includes(row.gimnasta_id);
                
                return (
                  <tr 
                    key={row.gimnasta_id} 
                    style={{
                      ...styles.tr,
                      backgroundColor: yaEnviado ? '#e8f5e9' : 
                                      !tieneEvaluaciones ? '#f9f9f9' : 
                                      (index % 2 === 0 ? '#ffffff' : '#faf8f3'),
                      opacity: !tieneEvaluaciones ? 0.6 : 1
                    }}
                  >
                    <td style={styles.tdNombre}>
                      <strong>{row.gimnasta_nombre}</strong>
                      {yaEnviado && <span style={styles.enviadoBadge}>✓ Enviado</span>}
                    </td>
                    <td style={styles.td}>{row.institucion}</td>
                    <td style={styles.td}>{row.nivel || '-'}</td>
                    <td style={styles.td}>{row.categoria || '-'}</td>
                    <td style={styles.td}>{row.grupo || '-'}</td>
                    <td style={styles.td}>{row.zona || '-'}</td>
                    <td style={styles.tdAparato}>
                      {parseFloat(row.suelo) > 0 ? parseFloat(row.suelo).toFixed(2) : '-'}
                    </td>
                    <td style={styles.tdAparato}>
                      {parseFloat(row.salto) > 0 ? parseFloat(row.salto).toFixed(2) : '-'}
                    </td>
                    <td style={styles.tdAparato}>
                      {parseFloat(row.vigas) > 0 ? parseFloat(row.vigas).toFixed(2) : '-'}
                    </td>
                    <td style={styles.tdAparato}>
                      {parseFloat(row.paralelas) > 0 ? parseFloat(row.paralelas).toFixed(2) : '-'}
                    </td>
                    <td style={styles.tdTotal}>
                      <span style={{
                        ...styles.puntajeTotal,
                        backgroundColor: tieneEvaluaciones ? '#d8372d' : '#cccccc'
                      }}>
                        {tieneEvaluaciones ? parseFloat(row.total).toFixed(2) : '0.00'}
                      </span>
                    </td>
                    <td style={styles.tdPos}>
                      <span style={{
                        ...styles.posicion,
                        backgroundColor: posicion <= 3 ? '#d2b178' : 'transparent',
                        color: '#170000',
                        padding: posicion <= 3 ? '8px 15px' : '8px',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '1.3rem',
                        display: 'inline-block',
                        minWidth: '50px',
                        textAlign: 'center',
                      }}>
                        {medalla ? `${medalla} ${posicion}` : posicion}
                      </span>
                    </td>
                    <td style={styles.tdAction}>
                      {yaEnviado ? (
                        <button 
                          disabled
                          style={styles.actionButtonDisabled}
                          title="Ya enviado a pantalla pública"
                        >
                          ✓
                        </button>
                      ) : (
                        <button 
                          onClick={() => enviarAPantalla(row)}
                          style={{
                            ...styles.actionButton,
                            opacity: !tieneEvaluaciones ? 0.4 : 1,
                            cursor: !tieneEvaluaciones ? 'not-allowed' : 'pointer'
                          }}
                          title={tieneEvaluaciones ? "Enviar a pantalla pública" : "Sin evaluaciones"}
                          disabled={!tieneEvaluaciones}
                        >
                          📺
                        </button>
                      )}
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
  title: {
    fontSize: '2rem',
    color: '#170000',
    fontWeight: '700',
  },
  headerButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  resetButton: {
    backgroundColor: '#4a2c2a',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(74, 44, 42, 0.3)',
  },
  cleanButton: {
    backgroundColor: '#d8372d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(216, 55, 45, 0.3)',
  },
  publicButton: {
    backgroundColor: '#2d7a3e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    boxShadow: '0 2px 5px rgba(45, 122, 62, 0.3)',
  },
  backButton: {
    backgroundColor: '#d2b178',
    color: '#170000',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 25px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
  },
  message: {
    padding: '12px 20px',
    marginBottom: '20px',
    borderRadius: '8px',
    fontWeight: '600',
  },
  contadorPanel: {
    backgroundColor: '#f5ebe0',
    padding: '12px 20px',
    borderRadius: '8px',
    marginBottom: '20px',
    display: 'flex',
    gap: '30px',
    border: '2px solid #e8d5b5',
  },
  contadorText: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#170000',
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
    fontSize: '1.1rem',
    border: '2px solid #170000',
  },
  thPos: {
    backgroundColor: '#d2b178',
    color: '#170000',
    padding: '14px 10px',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '1rem',
    border: '2px solid #170000',
    minWidth: '100px',
  },
  thAction: {
    backgroundColor: '#2d7a3e',
    color: '#ffffff',
    padding: '14px 10px',
    textAlign: 'center',
    fontWeight: '700',
    fontSize: '1rem',
    border: '2px solid #170000',
    minWidth: '100px',
  },
  tr: {
    transition: 'background-color 0.3s',
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
    fontSize: '1rem',
    fontWeight: '600',
  },
  tdAparato: {
    padding: '12px 10px',
    border: '1px solid #e8d5b5',
    textAlign: 'center',
    fontSize: '1rem',
    fontWeight: '600',
    color: '#4a2c2a',
  },
  tdTotal: {
    padding: '14px 10px',
    border: '2px solid #d8372d',
    textAlign: 'center',
    fontSize: '1.2rem',
    fontWeight: '700',
  },
  tdPos: {
    padding: '14px 12px',
    border: '2px solid #d2b178',
    textAlign: 'center',
    fontSize: '1.1rem',
    fontWeight: '700',
    backgroundColor: '#faf8f3',
  },
  tdAction: {
    padding: '12px 10px',
    border: '2px solid #2d7a3e',
    textAlign: 'center',
    backgroundColor: '#faf8f3',
  },
  posicion: {
    display: 'inline-block',
  },
  puntajeTotal: {
    backgroundColor: '#d8372d',
    color: '#ffffff',
    padding: '10px 18px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '1.2rem',
    display: 'inline-block',
    minWidth: '90px',
  },
  actionButton: {
    backgroundColor: '#2d7a3e',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 15px',
    fontSize: '1.2rem',
    transition: 'all 0.2s',
    boxShadow: '0 2px 5px rgba(45, 122, 62, 0.3)',
  },
  actionButtonDisabled: {
    backgroundColor: '#cccccc',
    color: '#666666',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 15px',
    fontSize: '1.2rem',
    cursor: 'not-allowed',
    opacity: 0.7,
  },
  enviadoBadge: {
    display: 'inline-block',
    marginLeft: '10px',
    backgroundColor: '#2d7a3e',
    color: '#ffffff',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '0.75rem',
    fontWeight: '700',
  },
};

export default RankingFinal;