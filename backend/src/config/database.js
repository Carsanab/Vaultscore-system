const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Obligatorio para Supabase en la nube
  }
});

// Prueba de conexión al iniciar
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Error de conexión a la base de datos:', err.message);
  } else {
    console.log('✅ Conectado a Supabase exitosamente');
  }
});

module.exports = pool;