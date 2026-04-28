const bcrypt = require("bcrypt");

const password = process.argv[2];

if (!password) {
  console.error("Uso: node hash.js <contraseña>");
  process.exit(1);
}

(async () => {
  const hash = await bcrypt.hash(password, 10);
  console.log(`Hash generado:\n${hash}`);
})();
