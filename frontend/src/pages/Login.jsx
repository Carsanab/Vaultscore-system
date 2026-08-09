import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // Usamos un solo objeto formData para evitar errores de variables sueltas
  const [formData, setFormData] = useState({
    usuario: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔑 Intentando login con:', formData);
      
      // Pasamos formData.usuario y formData.password explícitamente
      const result = await login(formData.usuario, formData.password);
      
      console.log('✅ Login exitoso:', result);
      const rol = result.user?.rol?.toLowerCase();
      
      if (rol === 'admin') {
        navigate('/admin');
      } else if (rol === 'juez') {
        navigate('/dashboard');
      } else {
        setError(`Rol no reconocido: ${rol}`);
      }
    } catch (err) {
      console.error('❌ Error en login:', err);
      console.error('📦 Respuesta del backend:', err.response?.data);
      setError(err.response?.data?.error || 'Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h1 style={styles.title}>🏆 Club Atlético Los Andes</h1>
        <h2 style={styles.subtitle}>Iniciar Sesión</h2>
        
        {error && (
          <div style={styles.errorBox}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Usuario:</label>
            <input
              type="text"
              name="usuario"
              value={formData.usuario}
              onChange={handleChange}
              style={styles.input}
              required
              autoFocus
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Contraseña:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={styles.input}
              required
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <button 
            type="submit" 
            style={loading ? styles.buttonDisabled : styles.button}
            disabled={loading}
          >
            {loading ? '⏳ Iniciando...' : '🚀 Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#faf8f3',
    padding: '20px',
  },
  loginBox: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
    border: '2px solid #d2b178',
    width: '100%',
    maxWidth: '450px',
  },
  title: {
    fontSize: '2.5rem',
    color: '#d2b178',
    textAlign: 'center',
    marginBottom: '10px',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: '1.5rem',
    color: '#170000',
    textAlign: 'center',
    marginBottom: '30px',
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: 'rgba(216, 55, 45, 0.1)',
    color: '#d8372d',
    padding: '12px',
    borderRadius: '6px',
    marginBottom: '20px',
    borderLeft: '4px solid #d8372d',
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontWeight: '700',
    color: '#170000',
    marginBottom: '8px',
    fontSize: '1rem',
  },
  input: {
    width: '100%',
    padding: '12px',
    border: '2px solid #d2b178',
    borderRadius: '6px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    backgroundColor: '#d8372d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
  },
  buttonDisabled: {
    width: '100%',
    backgroundColor: '#cccccc',
    color: '#666666',
    border: 'none',
    borderRadius: '8px',
    padding: '14px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'not-allowed',
    marginTop: '10px',
  },
};

export default Login;