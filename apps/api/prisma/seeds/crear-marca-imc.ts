/**
 * Crea la marca «Company IMC» con sus dominios (Sitio) y le da rol admin a los usuarios que ya son admin en
 * FPTecnologi, para que la vean en el selector del dashboard. Es idempotente: si la marca ya existe, no la duplica.
 * Lo mismo se puede hacer a mano en Admin → Marcas. El RUC y la dirección fiscal no están confirmados: se completan allí.
 *
 *   npx tsx prisma/seeds/crear-marca-imc.ts            # SIMULA: muestra lo que haría
 *   npx tsx prisma/seeds/crear-marca-imc.ts --aplicar  # guarda
 */
import { readFileSync } from 'node:fs';
import { PrismaClient } from '../../src/generated/prisma/client.js';

for (const line of readFileSync('./.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const DATOS = {
  nombre: 'Company IMC',
  razonSocial: 'Company IMC E.I.R.L.',
  colorPrimario: '#0056aa',
  colorSecundario: '#ffaa07',
  contactoEmail: 'ventas@companyimc.com',
  contactoTelefono: '+51 984 262 805',
  direccionFiscal: 'Pq. Manuel García Rosell, Urb. Círculo Nro. 197, Pueblo Libre, Lima',
};
const DOMINIOS = ['companyimc.com', 'www.companyimc.com'];
const aplicar = process.argv.includes('--aplicar');
const prisma = new PrismaClient();

async function main() {
  const existentes = await prisma.marca.findMany({ where: { nombre: { contains: 'imc', mode: 'insensitive' } }, select: { id: true, nombre: true } });
  if (existentes.length > 1) throw new Error(`Hay varias marcas con "imc": ${existentes.map((m) => m.nombre).join(', ')}. Resuélvelo a mano.`);
  const existente = existentes[0];
  console.log(existente ? `Ya existe: ${existente.nombre} (${existente.id})` : `No existe: se creará «${DATOS.nombre}»`);

  const enUso = await prisma.sitio.findMany({ where: { dominio: { in: DOMINIOS } }, select: { dominio: true, marcaId: true } });
  for (const s of enUso) if (s.marcaId !== existente?.id) throw new Error(`El dominio ${s.dominio} ya pertenece a otra marca (${s.marcaId}).`);

  const admins = await prisma.usuarioMarcaRol.findMany({ where: { rol: { nombre: 'admin' }, marca: { nombre: { equals: 'FPTecnologi', mode: 'insensitive' } } }, select: { usuarioId: true, rolId: true, usuario: { select: { email: true } } } });
  console.log(`Dominios: ${DOMINIOS.join(', ')}\nAdmins que la verán: ${admins.map((a) => a.usuario.email).join(', ') || '(ninguno)'}`);
  if (!aplicar) return console.log('\nSimulación: no se cambió nada. Para guardar: npx tsx prisma/seeds/crear-marca-imc.ts --aplicar');

  const marca = existente ?? (await prisma.marca.create({ data: DATOS, select: { id: true, nombre: true } }));
  for (const dominio of DOMINIOS) if (!enUso.some((s) => s.dominio === dominio)) await prisma.sitio.create({ data: { dominio, marcaId: marca.id } });
  for (const a of admins) await prisma.usuarioMarcaRol.upsert({ where: { usuarioId_marcaId_rolId: { usuarioId: a.usuarioId, marcaId: marca.id, rolId: a.rolId } }, create: { usuarioId: a.usuarioId, marcaId: marca.id, rolId: a.rolId }, update: {} });
  console.log(`\nListo. HUB_MARCA_ID de la web imc-web = ${marca.id}`);
}

main().catch((e) => { console.error(e.message ?? e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
