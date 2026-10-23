/**
 * Carga en la base los datos fiscales confirmados de Fimav Perú (tabla Marca), que usan la hoja del libro de
 * reclamaciones, la consulta pública del proveedor y los correos al consumidor. Lo mismo se puede hacer a mano en
 * Admin → Marcas. Solo toca la marca cuyo nombre contiene "fimav"; la dirección fiscal no se cambia (no está confirmada).
 *
 *   npx tsx prisma/seeds/datos-fiscales-fimav.ts            # SIMULA: muestra lo que cambiaría
 *   npx tsx prisma/seeds/datos-fiscales-fimav.ts --aplicar  # guarda
 */
import { readFileSync } from 'node:fs';
import { PrismaClient } from '../../src/generated/prisma/client.js';

for (const line of readFileSync('./.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const DATOS = { razonSocial: 'Fimav Perú E.I.R.L.', ruc: '20606256486' };
const aplicar = process.argv.includes('--aplicar');
const prisma = new PrismaClient();

async function main() {
  const marcas = await prisma.marca.findMany({ where: { nombre: { contains: 'fimav', mode: 'insensitive' } }, select: { id: true, nombre: true, razonSocial: true, ruc: true } });
  if (marcas.length !== 1) throw new Error(`Se esperaba 1 marca con "fimav" en el nombre y hay ${marcas.length}: ${marcas.map((m) => m.nombre).join(', ') || '(ninguna)'}`);
  const m = marcas[0]!;
  console.log(`${m.nombre} (${m.id})\n  razón social: ${m.razonSocial ?? '(vacía)'} → ${DATOS.razonSocial}\n  RUC: ${m.ruc ?? '(vacío)'} → ${DATOS.ruc}`);
  if (m.razonSocial === DATOS.razonSocial && m.ruc === DATOS.ruc) return console.log('Ya estaba al día.');
  if (!aplicar) return console.log('\nSimulación: no se cambió nada. Para guardar: npx tsx prisma/seeds/datos-fiscales-fimav.ts --aplicar');
  await prisma.marca.update({ where: { id: m.id }, data: DATOS });
  console.log('Guardado.');
}

main().finally(() => prisma.$disconnect());
