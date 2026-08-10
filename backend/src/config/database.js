const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Forzar IPv4
  host: 'aws-1-us-west-2.pooler.supabase.com',
  port: 5432,
  family: 4
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error(' ERROR DE CONEXIÓN:', err.message);
  } else {
    console.log('✅ ¡CONECTADO EXITOSAMENTE A SUPABASE VÍA POOLER!');
  }
});

module.exports = pool;