const { Pool } = require('pg');

const pool = new Pool({
  host: 'aws-0-us-west-2.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.iyxwkklpelhijzneynwo',
  password: 'Mostris1702@',
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ ERROR DE CONEXIÓN:', err.message);
  } else {
    console.log('✅ ¡Conectado exitosamente a Supabase vía Pooler!');
  }
});

module.exports = pool;