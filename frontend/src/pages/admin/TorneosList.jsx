import { useState, useEffect } from 'react';
import api from '../../services/api';

const TorneosList = () => {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    fecha: '',
    ubicacion: '',
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchTorneos();
  }, []);

  const fetchTorneos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/torneos');
      setTorneos(response.data);
    } catch (err) {
      setError('Error al cargar torneos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingId) {
        await api.put(`/torneos/${editingId}`, formData);
      } else {
        await api.post('/torneos', formData);
      }
      
      setFormData({ nombre: '', fecha: '', ubicacion: '' });
      setEditingId(null);
      setIsModalOpen(false);
      fetchTorneos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar torneo');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este torneo?')) {
      try {
        await api.delete(`/torneos/${id}`);
        fetchTorneos();
      } catch (err) {
        setError('Error al eliminar torneo');
        console.error(err);
      }
    }
  };

  const handleEdit = (torneo) => {
    setFormData({
      nombre: torneo.nombre,
      fecha: torneo.fecha,
      ubicacion: torneo.ubicacion || ''
    });
    setEditingId(torneo.id);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div style={styles.header}>
        <h2 style={styles.title}> Gestión de Torneos</h2>
        <button 
          onClick={() => {
            setFormData({ nombre: '', fecha: '', ubicacion: '' });
            setEditingId(null);
            setIsModalOpen(true);
          }}
          style={styles.addButton}
        >
          ➕ Nuevo Torneo
        </button>
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {loading ? (
        <div style={styles.loading}>⏳ Cargando torneos...</div>
      ) : torneos.length === 0 ? (
        <div style={styles.emptyState}>
          <h3>No hay torneos registrados</h3>
          <p>¡Crea tu primer torneo para comenzar!</p>
          <button 
            onClick={() => setIsModalOpen(true)}
            style={styles.primaryButton}
          >
            ➕ Crear Torneo
          </button>
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Nombre</th>
                <th style={styles.th}>Fecha</th>
                <th style={styles.th}>Ubicación</th>
                <th style={styles.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {torneos.map((torneo) => (
                <tr key={torneo.id} style={styles.tr}>
                  <td style={styles.td}>{torneo.nombre}</td>
                  <td style={styles.td}>
                    {(() => {
                      const [year, month, day] = torneo.fecha.split('-');
                      return `${day}/${month}/${year}`;
                    })()}
                  </td>
                  <td style={styles.td}>{torneo.ubicacion || 'No especificada'}</td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button 
                        onClick={() => handleEdit(torneo)}
                        style={styles.editButton}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(torneo.id)}
                        style={styles.deleteButton}
                        title="Eliminar"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>
              {editingId ? '✏️ Editar Torneo' : '➕ Nuevo Torneo'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label>Nombre del Torneo:</label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>Fecha:</label>
                <input
                  type="date"
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  required
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formGroup}>
                <label>Ubicación:</label>
                <input
                  type="text"
                  value={formData.ubicacion}
                  onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.modalButtons}>
                <button 
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormData({ nombre: '', fecha: '', ubicacion: '' });
                  }}
                  style={styles.secondaryButton}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  style={styles.primaryButton}
                >
                  {editingId ? '💾 Actualizar' : '✅ Crear'}
                </button>
              </div>
            </form>
          </div>
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
    gap: '15px',
  },
  title: {
    fontSize: '1.8rem',
    color: '#170000',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#d8372d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 20px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s',
    boxShadow: '0 4px 8px rgba(216, 55, 45, 0.3)',
  },
  error: {
    backgroundColor: 'rgba(216, 55, 45, 0.1)',
    color: '#d8372d',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    borderLeft: '4px solid #d8372d',
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
  },
  primaryButton: {
    backgroundColor: '#d8372d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 25px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    transition: 'all 0.3s',
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '8px',
    border: '1px solid #e8d5b5',
    boxShadow: '0 2px 5px rgba(0,0,0,0.08)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    backgroundColor: '#170000',
    color: '#d2b178',
    padding: '16px',
    textAlign: 'left',
    fontWeight: '600',
  },
  tr: {
    borderBottom: '1px solid #e8d5b5',
  },
  td: {
    padding: '14px 16px',
    borderBottom: '1px solid #e8d5b5',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    backgroundColor: '#d2b178',
    color: '#170000',
    border: 'none',
    borderRadius: '5px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s',
  },
  deleteButton: {
    backgroundColor: '#d8372d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '5px',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    width: '90%',
    maxWidth: '600px',
    padding: '30px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    border: '1px solid #e8d5b5',
  },
  modalTitle: {
    fontSize: '1.6rem',
    color: '#170000',
    marginBottom: '25px',
    textAlign: 'center',
    borderBottom: '2px solid #d8372d',
    paddingBottom: '10px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    marginBottom: '20px',
  },
  input: {
    padding: '12px',
    border: '2px solid #e8d5b5',
    borderRadius: '5px',
    fontSize: '16px',
    transition: 'border-color 0.3s',
  },
  modalButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '15px',
    marginTop: '25px',
  },
  secondaryButton: {
    backgroundColor: '#d2b178',
    color: '#170000',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
  },
};

export default TorneosList;