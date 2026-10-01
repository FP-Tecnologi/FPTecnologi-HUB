/** Marca migraciones ya aplicadas por SQL directo (el pooler :6543 cuelga
 * `migrate deploy` y `migrate resolve`). Inserta en _prisma_migrations con el
 * mismo checksum que calcularía Prisma (sha256 del migration.sql con LF).
 * Uso: npx tsx prisma/check-sum.ts (temporal) */
import { readFileSync } from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import { PrismaClient } from '../src/generated/prisma/client.js';
for (const line of readFileSync(new URL('./.env', `file://${process.cwd()}/`), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}
const prisma = new PrismaClient();
const nombres = [
  '20261001120000_cotizador_leads',
  '20261001180000_boletin',
  '20261001190000_ecommerce_real',
];
for (const nombre of nombres) {
  const ya: Array<{ n: number }> = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS n FROM _prisma_migrations WHERE migration_name = '${nombre}' AND finished_at IS NOT NULL`,
  );
  if (ya[0].n > 0) { console.log(`${nombre}: ya registrada`); continue; }
  const sql = readFileSync(new URL(`./prisma/migrations/${nombre}/migration.sql`, `file://${process.cwd()}/`), 'utf8');
  const checksum = createHash('sha256').update(sql.replace(/\r\n/g, '\n')).digest('hex');
  await prisma.$queryRawUnsafe(
    `INSERT INTO _prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
     VALUES ('${randomUUID()}', '${checksum}', NOW(), '${nombre}', NULL, NULL, NOW(), 1)`,
  );
  console.log(`${nombre}: registrada (${checksum.slice(0, 12)}…)`);
}
await prisma.$disconnect();
