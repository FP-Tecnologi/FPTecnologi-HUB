/**
 * Verifica que los datos de prueba se vean en el DASHBOARD, no solo en la base:
 * llama a las mismas rutas que consume el panel (con JWT de un usuario admin) y
 * cuenta lo que devuelven. De solo lectura.
 *
 * El token se firma aqui con JWT_ACCESS_SECRET (el mismo que valida la API), sin
 * pasar por el login ni el correo 2FA, para no depender del SMTP.
 *
 * Uso (desde apps/api): npx tsx scripts/verificar-dashboard.ts [emailAdmin]
 */
import { readFileSync } from 'node:fs';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '../src/generated/prisma/client.js';

const envApi = './.env';
try {
  for (const line of readFileSync(envApi, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch {
  console.error('No se encontro apps/api/.env');
  process.exit(1);
}

const API = process.env.API_URL ?? 'http://localhost:3001';
const prisma = new PrismaClient();
const jwt = new JwtService();

const pedir = async (ruta: string, token: string, marcaId: string) => {
  const res = await fetch(`${API}${ruta}`, {
    headers: { Authorization: `Bearer ${token}`, 'x-marca-id': marcaId },
  });
  const cuerpo = (await res.json().catch(() => null)) as { data?: unknown; message?: unknown } | null;
  if (!res.ok) throw new Error(`${ruta} -> ${res.status} ${JSON.stringify(cuerpo?.message)}`);
  return cuerpo?.data;
};

const filas = (d: unknown): unknown[] => (Array.isArray(d) ? d : []);

(async () => {
  const marca = await prisma.marca.findFirst({ where: { nombre: 'FPTecnologi' } });
  if (!marca) throw new Error('No existe la marca FPTecnologi');

  const email = process.argv[2] ?? 'dev+prueba-admin@fptecnologi.com';
  const usuario = await prisma.usuario.findUnique({
    where: { email },
    include: { marcas: { include: { rol: true } } },
  });
  if (!usuario) throw new Error(`No existe el usuario ${email}`);

  const marcas = usuario.marcas.map((m) => ({ marcaId: m.marcaId, rol: m.rol.nombre }));
  const token = jwt.sign(
    { sub: usuario.id, email: usuario.email, marcas },
    { secret: process.env.JWT_ACCESS_SECRET!, expiresIn: '15m' },
  );

  console.log(`\nVerificando el dashboard con ${email} (rol ${marcas.find((m) => m.marcaId === marca.id)?.rol ?? 'sin rol'})\n`);

  const pedidos = filas(await pedir('/pedidos', token, marca.id));
  const cotizaciones = filas(await pedir('/cotizaciones', token, marca.id));
  const leads = filas(await pedir('/cotizador/leads', token, marca.id));
  const contactos = filas(await pedir('/contacto-web', token, marca.id));
  const suscriptores = filas(await pedir('/boletin/suscriptores', token, marca.id));

  const cuenta = <T>(xs: T[], fn: (x: T) => string) =>
    [...new Set(xs.map(fn))].sort().map((k) => `${k}=${xs.filter((x) => fn(x) === k).length}`).join('  ');

  console.log('  GET /pedidos                ', pedidos.length, '|', cuenta(pedidos as { estado: string }[], (p) => p.estado));
  console.log('  GET /cotizaciones           ', cotizaciones.length, '|', cuenta(cotizaciones as { estado: string }[], (c) => c.estado));
  console.log('  GET /cotizador/leads        ', leads.length, '|', cuenta(leads as { estado: string }[], (l) => l.estado));
  console.log('  GET /contacto-web           ', contactos.length, '|', cuenta(contactos as { tipo: string }[], (c) => c.tipo));
  console.log('  GET /boletin/suscriptores   ', suscriptores.length);

  // El reporte de ventas es la pantalla de "mas vendidos".
  const reporte = (await pedir('/reportes/ventas', token, marca.id)) as {
    kpis: { pedidos: number; pedidosValidos: number; ventas: number; unidades: number; ticketPromedio: number; porCobrar: number };
    porDia: { fecha: string; ventas: number }[];
    topProductos: { nombre: string; sku: string; unidades: number; total: number }[];
    topClientes: { nombre: string; pedidos: number; total: number }[];
  };
  const k = reporte.kpis;
  console.log(`\n  GET /reportes/ventas (ultimos 30 dias)`);
  console.log(`    pedidos ${k.pedidos} (validos ${k.pedidosValidos}) | ventas $${k.ventas} | unidades ${k.unidades}`);
  console.log(`    ticket promedio $${k.ticketPromedio} | por cobrar $${k.porCobrar}`);
  console.log(`    dias con venta en la serie: ${reporte.porDia.filter((d) => d.ventas > 0).length} de ${reporte.porDia.length}`);
  console.log('\n    Mas vendidos:');
  for (const p of reporte.topProductos.slice(0, 8)) {
    console.log(`      ${String(p.unidades).padStart(3)} u.  $${String(p.total).padStart(9)}  ${p.nombre.slice(0, 48)}`);
  }
  console.log('\n    Top clientes:');
  for (const c of reporte.topClientes.slice(0, 5)) {
    console.log(`      ${c.pedidos} pedido(s)  $${String(c.total).padStart(9)}  ${c.nombre}`);
  }
})()
  .catch((e) => { console.error('ERROR:', e instanceof Error ? e.message : e); process.exit(1); })
  .finally(() => prisma.$disconnect());