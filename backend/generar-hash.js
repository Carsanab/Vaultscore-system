const bcrypt = require('bcrypt');

async function generarHash() {
  const password = 'admin123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Hash completo:', hash);
  console.log('Longitud:', hash.length);
}

generarHash();