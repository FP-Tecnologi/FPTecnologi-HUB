/**
 * Crea (o actualiza) un usuario de PRUEBA por cada rol del equipo en una marca, para probar qué ve y qué puede
 * hacer cada rol en el dashboard. Correo: dev+<rol>@fptecnologi.com (el "+alias" hace que el código de 2FA
 * llegue a la bandeja de dev@fptecnologi.com). La contraseña se genera al azar y se guarda en
 * docs/credenciales-prueba.md (archivo ignorado por git). BORRAR estas cuentas antes de abrir el sistema al público.
 *
 * Uso (desde apps/api):
 *   npx tsx prisma/seeds/usuarios-prueba.ts            # marca FPTecnologi, no toca cuentas que ya existen
 *   npx tsx prisma/seeds/usuarios-prueba.ts --reset    # además genera una contraseña nueva para las existentes
 *   npx tsx prisma/seeds/usuarios-prueba.ts --borrar   # elimina todas las cuentas de prueba dev+<rol>@…
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { PrismaClient } from '../../src/generated/prisma/client.js';

for (const line of readFileSync('./.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const ROLES = ['admin', 'ventas', 'comercial', 'marketing', 'asesores', 'soporte', 'logistica', 'finanzas', 'direccion'];
const MARCA = 'FPTecnologi';
const DOC = '../../docs/credenciales-prueba.md';
const INICIO = '<!-- usuarios-prueba:inicio -->';
const FIN = '<!-- usuarios-prueba:fin -->';

const prisma = new PrismaClient();
const correo = (rol: string) => `dev+prueba-${rol}@fptecnologi.com`;
// 16 caracteres con mayúscula, minúscula, número y símbolo (cumple cualquier regla razonable).
const clave = () => `Fp${randomBytes(9).toString('base64url').replace(/[-_]/g, 'x')}9!`;

async function main() {
  const borrar = process.argv.includes('--borrar');
  const reset = process.argv.includes('--reset');
  const marca = await prisma.marca.findFirst({ where: { nombre: MARCA } });
  if (!marca) throw new Error(`No existe la marca ${MARCA}`);

  if (borrar) {
    for (const rol of ROLES) {
      const u = await prisma.usuario.findUnique({ where: { email: correo(rol) } });
      if (!u) continue;
      await prisma.usuarioMarcaRol.deleteMany({ where: { usuarioId: u.id } });
      await prisma.refreshToken.deleteMany({ where: { usuarioId: u.id } });
      await prisma.otpCode.deleteMany({ where: { usuarioId: u.id } });
      await prisma.dispositivoConfiable.deleteMany({ where: { usuarioId: u.id } });
      await prisma.totpBackupCode.deleteMany({ where: { usuarioId: u.id } });
      await prisma.notificacion.deleteMany({ where: { usuarioId: u.id } });
      await prisma.usuario.delete({ where: { id: u.id } }).catch(() => console.log(`  ${correo(rol)}: tiene datos asociados, se dejó desactivado`));
      await prisma.usuario.updateMany({ where: { email: correo(rol) }, data: { activo: false } });
      console.log(`  eliminado ${correo(rol)}`);
    }
    return;
  }

  const filas: string[] = [];
  for (const rolNombre of ROLES) {
    const rol = await prisma.rol.findUnique({ where: { nombre: rolNombre } });
    if (!rol) { console.log(`  (el rol ${rolNombre} no existe, se omite)`); continue; }
    const email = correo(rolNombre);
    let u = await prisma.usuario.findUnique({ where: { email } });
    let password: string | null = null;
    if (!u) {
      password = clave();
      u = await prisma.usuario.create({ data: { email, passwordHash: await bcrypt.hash(password, 10), nombre: `Prueba ${rolNombre}`, bienvenidaVista: false } });
    } else if (reset) {
      password = clave();
      await prisma.usuario.update({ where: { id: u.id }, data: { passwordHash: await bcrypt.hash(password, 10), activo: true } });
    }
    await prisma.usuarioMarcaRol.upsert({
      where: { usuarioId_marcaId_rolId: { usuarioId: u.id, marcaId: marca.id, rolId: rol.id } },
      create: { usuarioId: u.id, marcaId: marca.id, rolId: rol.id },
      update: {},
    });
    // Un solo rol por usuario de prueba: quita cualquier otro que tuviera en esta marca.
    await prisma.usuarioMarcaRol.deleteMany({ where: { usuarioId: u.id, marcaId: marca.id, rolId: { not: rol.id } } });
    filas.push(`| ${rolNombre} | \`${email}\` | ${password ? `\`${password}\`` : '(ya existía; usa --reset para generar otra)'} |`);
    console.log(`  ${password ? 'creado ' : 'existe '} ${email}`);
  }

  // Si ninguna contraseña es nueva no hay nada que escribir (se conservaría lo ya guardado).
  if (!filas.some((f) => f.includes('`') && !f.includes('ya existía') ) && existsSync(DOC) && readFileSync(DOC, 'utf8').includes(INICIO)) return;
  const bloque = `${INICIO}
## Usuarios de prueba por rol (marca ${MARCA})

Creados con \`apps/api/prisma/seeds/usuarios-prueba.ts\`. El código de verificación en dos pasos llega a la bandeja de
\`dev@fptecnologi.com\` (por el \`+alias\`). **Borrarlos antes de abrir el sistema al público**: \`npx tsx prisma/seeds/usuarios-prueba.ts --borrar\`.

| Rol | Correo | Contraseña |
| --- | --- | --- |
${filas.join('\n')}
${FIN}`;
  const actual = existsSync(DOC) ? readFileSync(DOC, 'utf8') : '# Credenciales de prueba (NO subir a producción)\n';
  const nuevo = actual.includes(INICIO) ? actual.replace(new RegExp(`${INICIO}[\\s\\S]*?${FIN}`), bloque) : `${actual.trimEnd()}\n\n${bloque}\n`;
  writeFileSync(DOC, nuevo);
  console.log(`\nCredenciales guardadas en docs/credenciales-prueba.md`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
