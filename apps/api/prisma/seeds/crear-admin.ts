/**
 * Crea (o recupera) una cuenta ADMINISTRADOR en la marca FPTecnologi.
 * Si el correo ya existe: le pone la contraseña nueva, la reactiva y le asegura el rol admin.
 *
 * Uso (desde apps/api, con .env que tenga DATABASE_URL):
 *   npx tsx prisma/seeds/crear-admin.ts correo@dominio.com "ClaveNueva#2026" ["Nombre Apellido"]
 */
import { readFileSync } from 'node:fs';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../../src/generated/prisma/client.js';

for (const line of readFileSync('./.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const [email, password, nombre = 'Administrador'] = process.argv.slice(2);
if (!email || !password) {
  console.error('Uso: npx tsx prisma/seeds/crear-admin.ts correo clave ["Nombre"]');
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  const marca = await prisma.marca.findFirst({ where: { nombre: 'FPTecnologi' } });
  if (!marca) throw new Error('No existe la marca FPTecnologi');
  const rol = await prisma.rol.findUnique({ where: { nombre: 'admin' } });
  if (!rol) throw new Error('No existe el rol admin');

  const passwordHash = await bcrypt.hash(password, 10);
  const correo = email.toLowerCase().trim();
  const u = await prisma.usuario.upsert({
    where: { email: correo },
    create: { email: correo, passwordHash, nombre, bienvenidaVista: false },
    update: { passwordHash, activo: true },
  });
  await prisma.usuarioMarcaRol.upsert({
    where: { usuarioId_marcaId_rolId: { usuarioId: u.id, marcaId: marca.id, rolId: rol.id } },
    create: { usuarioId: u.id, marcaId: marca.id, rolId: rol.id },
    update: {},
  });
  console.log(`Listo: ${correo} es admin de ${marca.nombre}.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
