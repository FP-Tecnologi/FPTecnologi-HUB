/**
 * Diagnóstico de solo lectura: qué migraciones/tablas/datos hay en la base
 * real (Supabase) vs lo que el repo espera. No escribe nada.
 *
 * Uso: npx tsx prisma/db-status.ts
 */
import { readFileSync } from 'node:fs';
import { PrismaClient } from '../src/generated/prisma/client.js';

for (const line of readFileSync(new URL('./.env', `file://${process.cwd()}/`), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) {
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}
try {
  const u = new URL(process.env.DATABASE_URL ?? '');
  console.log(`Destino: ${u.host}${u.pathname} (usuario ${u.username})`);
} catch {
  console.log('Destino: DATABASE_URL no parseable');
}

const prisma = new PrismaClient();

async function main() {
  // 1. Migraciones registradas por Prisma Migrate
  try {
    const migs = await prisma.$queryRaw<Array<{ migration_name: string }>>`
      SELECT migration_name FROM _prisma_migrations WHERE finished_at IS NOT NULL ORDER BY finished_at`;
    console.log(`\nMigraciones aplicadas (${migs.length}):`);
    for (const m of migs) console.log(`  - ${m.migration_name}`);
  } catch {
    console.log('\nSin tabla _prisma_migrations (se aplicó por SQL Editor, no por migrate).');
  }

  // 2. Tablas/columnas clave existen?
  const tablas = await prisma.$queryRaw<Array<{ t: string }>>`
    SELECT tablename AS t FROM pg_tables WHERE schemaname = 'public'
    AND tablename IN ('SuscriptorBoletin','LeadCotizador','ContenidoWeb','BlogArticulo','ChatAsesor','Producto','Pedido')`;
  console.log(`\nTablas presentes: ${tablas.map((t) => t.t).join(', ') || '(ninguna)'}`);
  const cols = await prisma.$queryRaw<Array<{ c: string }>>`
    SELECT column_name AS c FROM information_schema.columns
    WHERE table_name IN ('Producto','Pedido','Categoria')
    AND column_name IN ('slug','numeroPedido','imagenes','marcaComercial','precioAntes','destacado','moneda','nombreSnapshot')`;
  console.log(`Columnas ecommerce presentes: ${cols.map((c) => c.c).join(', ') || '(ninguna — migración ecommerce sin aplicar)'}`);

  // 3. Datos de la marca fptecnologi
  const marca = await prisma.marca.findFirst({ where: { nombre: { contains: 'fptecnologi', mode: 'insensitive' } } });
  if (!marca) { console.log('\nMarca fptecnologi: NO EXISTE'); return; }
  const [cats, prods, arts, pubs, pedidos] = await Promise.all([
    prisma.categoria.count({ where: { marcaId: marca.id } }),
    prisma.producto.count({ where: { marcaId: marca.id } }),
    prisma.blogArticulo.count({ where: { marcaId: marca.id } }),
    prisma.blogArticulo.count({ where: { marcaId: marca.id, estado: 'PUBLICADO' } }),
    prisma.pedido.count({ where: { marcaId: marca.id } }),
  ]);
  console.log(`\nMarca: ${marca.nombre} (${marca.id})`);
  console.log(`  Categorías: ${cats} | Productos: ${prods} | Blog: ${arts} (publicados ${pubs}) | Pedidos: ${pedidos}`);
}

main()
  .catch((e) => { console.error('ERROR:', e instanceof Error ? e.message : e); process.exit(1); })
  .finally(() => prisma.$disconnect());
