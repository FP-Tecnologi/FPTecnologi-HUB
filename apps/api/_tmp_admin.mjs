import fs from 'node:fs';
import { PrismaClient } from './dist/generated/prisma/client.js';

const env = fs.readFileSync('./.env', 'utf8');
for (const line of env.split('\n')) {
  const t = line.trim();
  if (!t || t.startsWith('#') || !t.includes('=')) continue;
  const i = t.indexOf('=');
  let v = t.slice(i + 1).trim();
  if (v.length >= 2 && ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'")))) {
    v = v.slice(1, -1);
  }
  process.env[t.slice(0, i).trim()] = v;
}

const p = new PrismaClient();
const run = async (label, sql) => {
  try {
    await p.$executeRawUnsafe(sql);
    console.log(label + ' OK');
  } catch (e) {
    console.log(label + ': ' + String(e.message || e).slice(0, 150));
  }
};

await run('TYPE', 'CREATE TYPE "TipoNotificacion" AS ENUM (\'SISTEMA\', \'PEDIDO\', \'COTIZACION\', \'EQUIPO\', \'STOCK\')');
await run('COLUMN', 'ALTER TABLE "Notificacion" ADD COLUMN "tipo" "TipoNotificacion" NOT NULL DEFAULT \'SISTEMA\'');
await p.$disconnect();
console.log('DONE');
