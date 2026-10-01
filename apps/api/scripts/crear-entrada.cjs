// Se ejecuta después de `nest build`: deja dist/main.cjs, un arranque CommonJS para hostings (Passenger/LiteSpeed)
// que no cargan módulos ES como archivo de entrada. La API en sí sigue siendo dist/main.js.
const { writeFileSync } = require('node:fs');
const { join } = require('node:path');

writeFileSync(
  join(__dirname, '..', 'dist', 'main.cjs'),
  `import('./main.js').catch((error) => {\n  console.error('No se pudo iniciar la API:', error);\n  process.exit(1);\n});\n`,
);
