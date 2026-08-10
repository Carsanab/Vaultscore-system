const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Obligatorio para Supabase
  }
});

// Prueba de conexión inmediata
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ ERROR DE CONEXIÓN A SUPABASE:', err.message);
  } else {
    console.log('✅ ¡Conectado exitosamente a Supabase (PostgreSQL en la nube)!');
  }
});

module.exports = pool;