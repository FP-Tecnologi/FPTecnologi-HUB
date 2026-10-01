/**
 * Imprime un access token del dashboard (admin de una marca) y, pegado en la
 * consola del navegador, deja la sesion iniciada sin pasar por correo 2FA.
 * Solo para desarrollo local: firma con el JWT_ACCESS_SECRET de apps/api/.env.
 *
 * Uso (desde apps/api):
 *   npx tsx scripts/token-dashboard.ts [email] [marcaId]
 *   localStorage.setItem('ax:auth:access', '<token>')
 *   localStorage.setItem('ax:auth:marcaId', '<marcaId>')
 *   document.cookie = 'ax_session=1; path=/'
 */
import { readFileSync } from 'node:fs';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '../src/generated/prisma/client.js';

for (const line of readFileSync('./.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const prisma = new PrismaClient();
const jwt = new JwtService();

(async () => {
  const email = process.argv[2] ?? 'dev+prueba-admin@fptecnologi.com';
  const marcaId = process.argv[3] ?? '88ad7cfe-7756-457b-963f-22c6c352feb8';
  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: { marcas: { include: { rol: true } } },
  });
  if (!usuario) throw new Error(`No existe ${email}`);
  const marcas = usuario.marcas.map((m) => ({ marcaId: m.marcaId, rol: m.rol.nombre }));
  const token = jwt.sign(
    { sub: usuario.id, email: usuario.email, marcas },
    { secret: process.env.JWT_ACCESS_SECRET!, expiresIn: '2h' },
  );
  console.log('\nPaste esto en la consola del navegador con el dashboard abierto:\n');
  console.log(`localStorage.setItem('ax:auth:access', ${JSON.stringify(token)});`);
  console.log(`localStorage.setItem('ax:auth:marcaId', ${JSON.stringify(marcaId)});`);
  console.log(`document.cookie = 'ax_session=1; path=/'; location.reload();\n`);
})()
  .catch((e) => { console.error('ERROR:', e instanceof Error ? e.message : e); process.exit(1); })
  .finally(() => prisma.$disconnect());