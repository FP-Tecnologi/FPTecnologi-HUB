/**
 * Ejecuta un archivo .sql contra la base usando DATABASE_URL (de apps/api/.env). Respeta los bloques
 * `DO $$ … $$` y las comillas, a diferencia de apply-migrations.ts que parte por ';'.
 * Uso: npx tsx prisma/run-sql.ts prisma/migrations/<carpeta>/migration.sql
 * Después marca la migración: npx prisma migrate resolve --applied <carpeta> (por el puerto 5432).
 */
import { readFileSync } from 'node:fs';
import { PrismaClient } from '../src/generated/prisma/client.js';

for (const line of readFileSync('./.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

function partir(sql: string): string[] {
  const out: string[] = [];
  let cur = '';
  let dolar = false;
  let comilla = false;
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    if (!comilla && sql.startsWith('$$', i)) { dolar = !dolar; cur += '$$'; i++; continue; }
    if (!dolar && c === "'") comilla = !comilla;
    if (c === ';' && !dolar && !comilla) { if (cur.trim()) out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

const prisma = new PrismaClient();
const archivo = process.argv[2];
if (!archivo) throw new Error('Pasa la ruta del .sql');
const sql = readFileSync(archivo, 'utf8').split('\n').filter((l) => !l.trimStart().startsWith('--')).join('\n');
(async () => {
  const st = partir(sql);
  for (const s of st) await prisma.$executeRawUnsafe(s);
  console.log(`OK (${st.length} sentencias)`);
})()
  .catch((e) => { console.error('ERROR:', e instanceof Error ? e.message : e); process.exit(1); })
  .finally(() => prisma.$disconnect());
