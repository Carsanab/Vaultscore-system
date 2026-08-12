import { useState, useEffect } from 'react';
import api from '../../services/api'; // Asegúrate de que la ruta a tu api sea correcta

const ControlRotacion = () => {
  const [imagen, setImagen] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [rotacionActiva, setRotacionActiva] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    verificarEstado();
    // Verifica el estado cada 3 segundos para mantener la sincronización
    const interval = setInterval(verificarEstado, 3000);
    return () => clearInterval(interval);
  }, []);

  const verificarEstado = async () => {
    try {
      const res = await api.get('/evaluaciones/rotacion/estado');
      setRotacionActiva(res.data.activa);
    } catch (err) {
      console.error('Error al verificar estado:', err);
    }
  };

  const handleSubir = async () => {
    if (!imagen) return;

    // ✅ VALIDACIÓN DE TAMAÑO: Máximo 15MB (15 * 1024 * 1024 bytes)
    const maxSize = 15 * 1024 * 1024;
    if (imagen.size > maxSize) {
      setMensaje('❌ La imagen es demasiado grande. El límite es 15MB.');
      setTimeout(() => setMensaje(''), 4000);
      return;
    }

    setSubiendo(true);
    const formData = new FormData();
    formData.append('imagen', imagen);

    try {
      await api.post('/evaluaciones/rotacion/imagen', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMensaje('✅ Imagen actualizada y lista para mostrar');
      setTimeout(() => setMensaje(''), 3000);
    } catch (err) {
      console.error('Error al subir:', err);
      const errorMsg = err.response?.data?.error || 'Error desconocido al subir';
      setMensaje(`❌ Error: ${errorMsg}`);
      setTimeout(() => setMensaje(''), 4000);
    } finally {
      setSubiendo(false);
    }
  };

  const toggleRotacion = async (estado) => {
    try {
      const endpoint = estado ? '/evaluaciones/rotacion/activar' : '/evaluaciones/rotacion/desactivar';
      
      // Hacemos la petición al backend
      await api.post(endpoint);
      
      // ✅ Solo cambiamos el estado visual si la petición fue exitosa
      setRotacionActiva(estado);
      setMensaje(estado ? '✅ Rotación mostrada en todas las pantallas' : '✅ Pantallas volvieron a la vista normal');
      setTimeout(() => setMensaje(''), 3000);
      
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      const errorMsg = err.response?.data?.error || 'No se pudo conectar con el servidor';
      setMensaje(`❌ Error al cambiar estado: ${errorMsg}`);
      setTimeout(() => setMensaje(''), 4000);
    }
  };

  return (
    <div style={styles.card}>
      <h3 style={styles.title}>🔄 Control de Pantalla de Rotación</h3>
      
      <div style={styles.section}>
        <label style={styles.label}>1. Seleccionar imagen (Máx. 15MB):</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setImagen(e.target.files[0])}
          style={styles.fileInput}
        />
        <button 
          onClick={handleSubir} 
          disabled={!imagen || subiendo}
          style={subiendo ? styles.buttonDisabled : styles.button}
        >
          {subiendo ? '⏳ Subiendo...' : '📤 Subir Imagen'}
        </button>
      </div>

      <div style={styles.section}>
        <label style={styles.label}>2. Estado de las pantallas:</label>
        <div style={styles.toggleContainer}>
          <button 
            onClick={() => toggleRotacion(true)}
            style={rotacionActiva ? styles.btnActive : styles.btnInactive}
            disabled={subiendo} // Evita clics mientras se sube algo
          >
            ✅ MOSTRAR ROTACIÓN
          </button>
          <button 
            onClick={() => toggleRotacion(false)}
            style={!rotacionActiva ? styles.btnActive : styles.btnInactive}
            disabled={subiendo}
          >
            ❌ QUITAR (Volver a normal)
          </button>
        </div>
      </div>

      {mensaje && (
        <div style={{
          ...styles.mensaje,
          backgroundColor: mensaje.includes('❌') ? '#fde8e8' : '#e8f5e9',
          color: mensaje.includes('❌') ? '#d8372d' : '#2d7a3e',
          border: `1px solid ${mensaje.includes('❌') ? '#d8372d' : '#2d7a3e'}`
        }}>
          {mensaje}
        </div>
      )}
    </div>
  );
};

const styles = {
  card: { background: '#fff', padding: '25px', borderRadius: '10px', border: '2px solid #d2b178', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  title: { margin: '0 0 20px 0', color: '#170000', fontSize: '1.3rem', borderBottom: '2px solid #d2b178', paddingBottom: '10px' },
  section: { marginBottom: '25px' },
  label: { display: 'block', fontWeight: '700', marginBottom: '10px', color: '#4a2c2a', fontSize: '1rem' },
  fileInput: { display: 'block', marginBottom: '15px', padding: '10px', border: '2px dashed #d2b178', borderRadius: '6px', width: '100%', backgroundColor: '#faf8f3', cursor: 'pointer' },
  button: { background: '#d8372d', color: '#fff', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem', transition: 'all 0.2s' },
  buttonDisabled: { background: '#cccccc', color: '#666666', border: 'none', padding: '12px 24px', borderRadius: '6px', cursor: 'not-allowed', fontWeight: '700', fontSize: '1rem' },
  toggleContainer: { display: 'flex', gap: '15px', flexWrap: 'wrap' },
  btnActive: { flex: 1, padding: '14px', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'default', background: '#2d7a3e', color: '#fff', fontSize: '1rem', boxShadow: '0 2px 5px rgba(45, 122, 62, 0.3)' },
  btnInactive: { flex: 1, padding: '14px', border: '2px solid #ccc', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', background: '#f5f5f5', color: '#666', fontSize: '1rem', transition: 'all 0.2s' },
  mensaje: { padding: '12px', borderRadius: '6px', fontWeight: '600', textAlign: 'center', fontSize: '0.95rem' }
};

export default ControlRotacion;