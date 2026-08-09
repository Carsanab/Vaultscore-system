import { useState, useEffect } from 'react';
import api from '../services/api';

const PantallaJueces = () => {
  const [cola, setCola] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para rotación
  const [rotacionActiva, setRotacionActiva] = useState(false);
  const [imagenUrl, setImagenUrl] = useState('');

  useEffect(() => {
    fetchCola();
    const interval = setInterval(fetchCola, 2000);
    return () => clearInterval(interval);
  }, []);

  // Efecto para monitorear la rotación cada 2 segundos
  useEffect(() => {
    const checkRotacion = async () => {
      try {
        const res = await api.get('/evaluaciones/rotacion/estado');
        setRotacionActiva(res.data.activa);
        if (res.data.activa) setImagenUrl(res.data.imageUrl);
      } catch (err) {
        console.error('Error estado rotación:', err);
      }
    };
    checkRotacion();
    const interval = setInterval(checkRotacion, 2000);
    return () => clearInterval(interval);
  }, []);

  const fetchCola = async () => {
    try {
      const response = await api.get('/evaluaciones/cola-publica');
      setCola(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const getAparatoInfo = (aparato) => {
    const info = {
      'suelo': { emoji: '🤸', nombre: 'SUELO' },
      'salto': { emoji: '🏃', nombre: 'SALTO' },
      'vigas': { emoji: '⚖️', nombre: 'VIGAS' },
      'paralelas': { emoji: '🔗', nombre: 'PARALELAS' },
      'general': { emoji: '', nombre: 'FINAL' }
    };
    return info[aparato] || { emoji: '🏆', nombre: 'GENERAL' };
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner}></div>
      </div>
    );
  }

  // Pantalla de rotación
  if (rotacionActiva) {
    return (
      <div style={styles.containerRotacion}>
        <img src={`${imagenUrl}?t=${Date.now()}`} alt="Rotación" style={styles.imagenRotacion} />
      </div>
    );
  }

  if (cola.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <h1 style={styles.emptyTitle}>🏆 TORNEO DE GIMNASIA</h1>
          <p style={styles.emptyText}>Esperando evaluaciones...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>🏆 EVALUACIÓN EN VIVO</h1>
        <div style={styles.headerTime}>
          {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {/* Encabezados de columnas */}
      <div style={styles.columnHeaders}>
        <div style={{...styles.col, ...styles.colNombre}}>GIMNASTA</div>
        <div style={{...styles.col, ...styles.colClub}}>CLUB</div>
        <div style={{...styles.col, ...styles.colAparato}}>APARATO</div>
        <div style={{...styles.col, ...styles.colPuntaje}}>PUNTAJE</div>
      </div>

      {/* Lista de evaluaciones */}
      <div style={styles.content}>
        {cola.map((item, index) => {
          const aparatoInfo = getAparatoInfo(item.aparato);
          const esPrimera = index === 0;
          
          return (
            <div 
              key={item.id_cola}
              style={{
                ...styles.fila,
                ...(esPrimera ? styles.filaDestacada : {}),
                animation: esPrimera ? 'slideIn 0.5s ease-out' : 'none'
              }}
            >
              <div style={{...styles.col, ...styles.colNombre}}>
                <span style={styles.nombreText}>{item.gimnasta_nombre}</span>
              </div>
              <div style={{...styles.col, ...styles.colClub}}>
                <span style={styles.clubText}>{item.institucion}</span>
              </div>
              <div style={{...styles.col, ...styles.colAparato}}>
                <span style={styles.aparatoEmoji}>{aparatoInfo.emoji}</span>
                <span style={styles.aparatoText}>{aparatoInfo.nombre}</span>
              </div>
              <div style={{...styles.col, ...styles.colPuntaje}}>
                <span style={styles.puntajeText}>
                  {parseFloat(item.puntaje).toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  container: { 
    minHeight: '100vh', 
    background: 'linear-gradient(135deg, #170000 0%, #2d0000 50%, #170000 100%)', 
    fontFamily: 'Arial, sans-serif', 
    overflow: 'hidden', 
    display: 'flex', 
    flexDirection: 'column' 
  },
  header: { 
    background: 'linear-gradient(90deg, #d8372d 0%, #d2b178 100%)', 
    padding: '25px 50px', 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)' 
  },
  headerTitle: { 
    color: '#ffffff', 
    fontSize: '2.8rem', 
    fontWeight: '900', 
    margin: 0, 
    textShadow: '0 2px 4px rgba(0,0,0,0.3)', 
    letterSpacing: '3px' 
  },
  headerTime: { 
    color: '#ffffff', 
    fontSize: '1.8rem', 
    fontWeight: '700', 
    textShadow: '0 2px 4px rgba(0,0,0,0.3)' 
  },
  spinner: { 
    border: '8px solid rgba(210, 177, 120, 0.3)', 
    borderTop: '8px solid #d2b178', 
    borderRadius: '50%', 
    width: '80px', 
    height: '80px', 
    animation: 'spin 1s linear infinite', 
    margin: 'auto', 
    marginTop: '40vh' 
  },
  emptyState: { 
    display: 'flex', 
    flexDirection: 'column', 
    alignItems: 'center', 
    justifyContent: 'center', 
    minHeight: '100vh', 
    color: '#d2b178' 
  },
  emptyTitle: { 
    fontSize: '4.5rem', 
    fontWeight: '900', 
    marginBottom: '20px', 
    textShadow: '0 4px 8px rgba(0,0,0,0.5)' 
  },
  emptyText: { 
    fontSize: '2rem', 
    fontWeight: '600' 
  },
  // Encabezados de columnas
  columnHeaders: {
    display: 'flex',
    backgroundColor: '#d2b178',
    padding: '15px 30px',
    borderBottom: '3px solid #170000',
  },
  content: { 
    flex: 1, 
    padding: '10px 30px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '8px', 
    overflowY: 'auto' 
  },
  // Columnas
  col: {
    display: 'flex',
    alignItems: 'center',
    padding: '0 15px',
  },
  colNombre: {
    flex: 2,
    justifyContent: 'flex-start',
  },
  colClub: {
    flex: 2,
    justifyContent: 'flex-start',
  },
  colAparato: {
    flex: 1.5,
    justifyContent: 'center',
    gap: '10px',
  },
  colPuntaje: {
    flex: 1,
    justifyContent: 'center',
  },
  // Fila
  fila: {
    display: 'flex',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: '10px',
    padding: '18px 30px',
    alignItems: 'center',
    border: '2px solid rgba(210, 177, 120, 0.3)',
    transition: 'all 0.3s ease',
  },
  filaDestacada: {
    backgroundColor: 'rgba(210, 177, 120, 0.2)',
    border: '3px solid #d2b178',
    boxShadow: '0 4px 15px rgba(210, 177, 120, 0.3)',
  },
  // Textos
  nombreText: {
    color: '#ffffff',
    fontSize: '1.8rem',
    fontWeight: '900',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
  },
  clubText: {
    color: '#d2b178',
    fontSize: '1.2rem',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  aparatoEmoji: {
    fontSize: '1.8rem',
  },
  aparatoText: {
    color: '#ffffff',
    fontSize: '1.1rem',
    fontWeight: '700',
    letterSpacing: '1px',
    backgroundColor: 'rgba(216, 55, 45, 0.4)',
    padding: '6px 15px',
    borderRadius: '8px',
    border: '1px solid #d8372d',
  },
  puntajeText: {
    color: '#ffffff',
    fontSize: '2.2rem',
    fontWeight: '900',
    backgroundColor: '#d8372d',
    padding: '10px 20px',
    borderRadius: '10px',
    boxShadow: '0 4px 10px rgba(216, 55, 45, 0.4)',
    minWidth: '100px',
    textAlign: 'center',
  },
  containerRotacion: { 
    minHeight: '100vh', 
    background: '#000', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    overflow: 'hidden' 
  },
  imagenRotacion: { 
    maxWidth: '100%', 
    maxHeight: '100vh', 
    objectFit: 'contain' 
  },
};

const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
  @keyframes slideIn { 
    from { opacity: 0; transform: translateY(-20px); } 
    to { opacity: 1; transform: translateY(0); } 
  }
`;
document.head.appendChild(styleSheet);

export default PantallaJueces;