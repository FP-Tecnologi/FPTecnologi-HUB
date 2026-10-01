// Se ejecuta después de `nest build`:
// 1) deja dist/main.cjs, un arranque CommonJS para hostings (Passenger/LiteSpeed) que no cargan módulos ES como
//    archivo de entrada. La API en sí sigue siendo dist/main.js.
// 2) copia los motores de Prisma (libquery_engine-*.so.node) de src/generated/prisma a dist/generated/prisma: el
//    hosting solo publica dist/ y Prisma busca el motor primero ahí (nest build no copia archivos .node).
const { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } = require('node:fs');
const { join } = require('node:path');

const raiz = join(__dirname, '..');

writeFileSync(
  join(raiz, 'dist', 'main.cjs'),
  `import('./main.js').catch((error) => {\n  console.error('No se pudo iniciar la API:', error);\n  process.exit(1);\n});\n`,
);

const origen = join(raiz, 'src', 'generated', 'prisma');
const destino = join(raiz, 'dist', 'generated', 'prisma');
if (existsSync(origen)) {
  mkdirSync(destino, { recursive: true });
  const motores = readdirSync(origen).filter((f) => f.startsWith('libquery_engine-') && f.endsWith('.node'));
  for (const f of motores) copyFileSync(join(origen, f), join(destino, f));
  console.log(`Motores de Prisma copiados a dist/generated/prisma: ${motores.join(', ') || '(ninguno)'}`);
}
