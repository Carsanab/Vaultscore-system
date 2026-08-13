import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  
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
      const result = await login(formData.usuario, formData.password);
      const rol = result.user?.rol?.toLowerCase();
      
      if (rol === 'admin') {
        navigate('/admin');
      } else if (rol === 'juez') {
        navigate('/dashboard');
      } else {
        setError(`Rol no reconocido: ${rol}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        {/* Logo sin fondo y más pequeño */}
        <div style={styles.logoContainer}>
          <img 
            src="/logo.png" 
            alt="Gym Arg Score Logo" 
            style={styles.logo}
          />
        </div>
        
        <h1 style={styles.subtitle}>Iniciar Sesión</h1>
        
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
    width: '100vw',
    margin: 0,
    padding: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `
      linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%),
      repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(255,255,255,0.03) 10px,
        rgba(255,255,255,0.03) 20px
      )
    `,
    position: 'relative',
    overflow: 'hidden',
  },
  loginBox: {
    backgroundColor: '#faf8f3',
    padding: '40px 45px',
    borderRadius: '16px',
    boxShadow: '0 15px 50px rgba(0,0,0,0.6), 0 0 0 1px rgba(210, 177, 120, 0.4)',
    border: '3px solid #d2b178',
    width: '90%',
    maxWidth: '420px',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  logo: {
    width: '110px',
    height: 'auto',
    objectFit: 'contain',
    filter: 'drop-shadow(0 4px 12px rgba(210, 177, 120, 0.5))',
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#d2b178',
    textAlign: 'center',
    marginBottom: '30px',
    fontWeight: '600',
    borderBottom: '2px solid #e8d5b5',
    paddingBottom: '15px',
    margin: 0, // Agregado para limpiar márgenes por defecto de h1
  },
  errorBox: {
    backgroundColor: 'rgba(216, 55, 45, 0.15)',
    color: '#d8372d',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    borderLeft: '5px solid #d8372d',
    fontWeight: '600',
    fontSize: '0.95rem',
  },
  formGroup: {
    marginBottom: '22px',
  },
  label: {
    display: 'block',
    fontWeight: '700',
    color: '#170000',
    marginBottom: '8px',
    fontSize: '0.95rem',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    border: '2px solid #d2b178',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    backgroundColor: '#ffffff',
    transition: 'all 0.3s ease',
    outline: 'none',
  },
  button: {
    width: '100%',
    backgroundColor: '#d8372d',
    color: '#ffffff',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '10px',
    boxShadow: '0 6px 20px rgba(216, 55, 45, 0.4)',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  buttonDisabled: {
    width: '100%',
    backgroundColor: '#cccccc',
    color: '#666666',
    border: 'none',
    borderRadius: '10px',
    padding: '14px',
    fontSize: '1.1rem',
    fontWeight: '700',
    cursor: 'not-allowed',
    marginTop: '10px',
    opacity: 0.7,
  },
};

export default Login;