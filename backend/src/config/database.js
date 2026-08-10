const { Pool } = require('pg');

const pool = new Pool({
  host: 'db.iyxwkklpelhijzneynwo.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'Mostrinas1702', // ✅ Sin símbolos, conexión limpia
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ ERROR DE CONEXIÓN:', err.message);
  } else {
    console.log('✅ ¡CONECTADO EXITOSAMENTE A SUPABASE!');
  }
});

module.exports = pool;git