/**
 * Aplica migraciones pendientes SIN `migrate deploy` (se cuelga en el pooler
 * de transacciones :6543 de Supabase — ver ESTADO-ACTUAL.md): ejecuta cada
 * migration.sql con SQL directo y luego se marca con
 * `npx prisma migrate resolve --applied "<nombre>"`.
 *
 * Uso: npx tsx prisma/apply-migrations.ts 20261001120000_cotizador_leads 20261001180000_boletin 20261001190000_ecommerce_real
 */
import { readFileSync } from 'node:fs';
import { PrismaClient } from '../src/generated/prisma/client.js';

for (const line of readFileSync(new URL('./.env', `file://${process.cwd()}/`), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) {
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

const prisma = new PrismaClient();

async function main() {
  const nombres = process.argv.slice(2);
  if (nombres.length === 0) throw new Error('Pasa los nombres de migración a aplicar');
  for (const nombre of nombres) {
    const ya = await prisma.$queryRaw<Array<{ n: number }>>`
      SELECT COUNT(*)::int AS n FROM _prisma_migrations WHERE migration_name = ${nombre} AND finished_at IS NOT NULL`;
    if (ya[0].n > 0) { console.log(`${nombre}: ya aplicada, se omite`); continue; }
    const sql = readFileSync(new URL(`./prisma/migrations/${nombre}/migration.sql`, `file://${process.cwd()}/`), 'utf8');
    const sinComentarios = sql
      .split('\n')
      .filter((l) => !l.trimStart().startsWith('--'))
      .join('\n');
    const sentencias = sinComentarios.split(';').map((s) => s.trim()).filter(Boolean);
    console.log(`${nombre}: ejecutando ${sentencias.length} sentencias…`);
    // Sin transacción interactiva a propósito: el pooler :6543 no la soporta.
    // Cada sentencia es DDL atómica y las nuestras usan IF NOT EXISTS / CREATE
    // solo si falta, así re-ejecutar es seguro.
    for (const s of sentencias) await prisma.$executeRawUnsafe(s);
    console.log(`${nombre}: SQL OK → ahora marca con: npx prisma migrate resolve --applied "${nombre}"`);
  }
}

main()
  .catch((e) => { console.error('ERROR:', e instanceof Error ? e.message : e); process.exit(1); })
  .finally(() => prisma.$disconnect());
