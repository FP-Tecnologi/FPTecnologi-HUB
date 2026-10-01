/**
 * Cuenta los registros que crean los formularios de la web publica, para
 * confirmar que los envios de prueba (scripts/prueba-formularios-publicos.ps1)
 * llegaron de verdad a la base. De solo lectura: no escribe nada.
 *
 * Uso: npx tsx ../../scripts/conteo-datos-prueba.ts [marcaId]
 */
import { readFileSync } from 'node:fs';
import { PrismaClient } from '../apps/api/src/generated/prisma/client.js';

for (const line of readFileSync('./.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const prisma = new PrismaClient();
const marcaId = process.argv[2];

const tabla = async (nombre: string, contar: () => Promise<number>, extras?: () => Promise<string>) => {
  const n = await contar();
  const det = extras ? await extras() : '';
  console.log(`  ${nombre.padEnd(18)} ${String(n).padStart(4)}${det ? `  ${det}` : ''}`);
};

(async () => {
  if (marcaId) {
    await tabla('Leads cotizador', () => prisma.leadCotizador.count({ where: { marcaId } }), async () => {
      const nuevos = await prisma.leadCotizador.count({ where: { marcaId, estado: 'NUEVO' } });
      return `(${nuevos} NUEVO)`;
    });
    await tabla('Cotizaciones', () => prisma.cotizacion.count({ where: { marcaId } }), async () => {
      const env = await prisma.cotizacion.count({ where: { marcaId, estado: { not: 'PENDIENTE' } } });
      return `(${env} ya gestionadas)`;
    });
    await tabla('Contactos/reclamos', () => prisma.contactoWeb.count({ where: { marcaId } }), async () => {
      const rec = await prisma.contactoWeb.count({ where: { marcaId, tipo: 'RECLAMO' } });
      return `(${rec} reclamos)`;
    });
    await tabla('Suscriptores', () => prisma.suscriptorBoletin.count({ where: { marcaId } }));
    await tabla('Pedidos', () => prisma.pedido.count({ where: { marcaId } }), async () => {
      const cancel = await prisma.pedido.count({ where: { marcaId, estado: 'CANCELADO' } });
      return `(${cancel} cancelados)`;
    });
    const top = await prisma.pedidoItem.groupBy({
      by: ['skuSnapshot'],
      where: { pedido: { marcaId } },
      _sum: { cantidad: true },
      orderBy: { _sum: { cantidad: 'desc' } },
      take: 5,
    });
    if (top.length) {
      console.log('\n  Mas vendidos:');
      for (const t of top) console.log(`    ${String(t._sum.cantidad).padStart(3)} u.  ${t.skuSnapshot}`);
    }
  } else {
    const marcas = await prisma.marca.findMany({ select: { id: true, nombre: true } });
    for (const m of marcas) {
      console.log(`\n${m.nombre}`);
      await tabla('Leads cotizador', () => prisma.leadCotizador.count({ where: { marcaId: m.id } }));
      await tabla('Cotizaciones', () => prisma.cotizacion.count({ where: { marcaId: m.id } }));
      await tabla('Contactos/reclamos', () => prisma.contactoWeb.count({ where: { marcaId: m.id } }));
      await tabla('Suscriptores', () => prisma.suscriptorBoletin.count({ where: { marcaId: m.id } }));
      await tabla('Pedidos', () => prisma.pedido.count({ where: { marcaId: m.id } }));
    }
  }
})()
  .catch((e) => { console.error('ERROR:', e instanceof Error ? e.message : e); process.exit(1); })
  .finally(() => prisma.$disconnect());