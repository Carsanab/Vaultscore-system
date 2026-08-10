const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.iyxwkklpelhijzneynwo.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Mostris1702@',
  ssl: {
    rejectUnauthorized: false
  },
  family: 4 // ✅ Forzar IPv4
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ ERROR DE CONEXIÓN A SUPABASE:', err.message);
  } else {
    console.log('✅ ¡Conectado exitosamente a Supabase!');
  }
});

module.exports = pool;
