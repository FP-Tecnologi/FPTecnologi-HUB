/**
 * Carga en la base el catálogo que hoy está fijo en el código de las webs, para poder gestionarlo desde el admin
 * (Ecommerce → Catálogo y Productos):
 *   · Kelqa e Imaninki: sus «líneas» (→ Categoria) y los productos de cada línea (→ Producto).
 *   · Fimav: sus categorías de equipos (→ Categoria; los productos de Fimav se cargan aparte).
 *
 * Es idempotente: vuelve a correr sin duplicar (categorías por slug, productos por SKU). Y NUNCA pisa lo que ya
 * se editó en el admin: solo rellena campos que estén vacíos.
 *
 * Por defecto solo MUESTRA lo que haría. Para escribir:  npx tsx prisma/seeds/catalogo-lineas.ts --aplicar
 * Una sola marca:                                         npx tsx prisma/seeds/catalogo-lineas.ts kelqa --aplicar
 */
import { readFileSync } from 'node:fs';
import { PrismaClient } from '../../src/generated/prisma/client.js';
import { slugify } from '../../src/productos/productos.service.js';

for (const line of readFileSync('.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const APLICAR = process.argv.includes('--aplicar');
const SOLO = process.argv.slice(2).find((a) => !a.startsWith('--'));
const prisma = new PrismaClient();

// Import con ruta en variable: son archivos de las webs (fuera de apps/api) que tsx lee en ejecución y que tsc no debe resolver.
const importar = (ruta: string): Promise<unknown> => import(ruta);

type Producto = { nombre: string; img: string; detalle: string; descripcion: string };
type Linea = { id: string; nombre: string; corto: string; lema: string; texto: string; foto: string; galeria: { src: string; alt: string }[]; productos: Producto[] };
type CategoriaFimav = { slug: string; nombre: string; icono: { displayName?: string }; resumen: string; marcas: string[]; fotos: string[] };

async function marcaId(nombre: string, contiene = false) {
  const m = await prisma.marca.findFirst({ where: { nombre: contiene ? { contains: nombre, mode: 'insensitive' } : { equals: nombre, mode: 'insensitive' } } });
  if (!m) console.log(`  ! No existe la marca «${nombre}» en la base: se omite.`);
  return m?.id ?? null;
}

const vacio = (v: unknown) => v == null || v === '' || (Array.isArray(v) && v.length === 0);

/** Crea la categoría o, si ya existe, solo completa los campos que estén vacíos. */
async function categoria(marca: string, datos: { slug: string; nombre: string; orden: number; portadaUrl?: string; icono?: string; resumen?: string; texto?: string; galeria?: string[]; marcasComerciales?: string[] }) {
  const actual = await prisma.categoria.findFirst({ where: { marcaId: marca, slug: datos.slug } });
  if (!actual) {
    console.log(`  + categoría «${datos.nombre}»`);
    if (!APLICAR) return null;
    return prisma.categoria.create({ data: { ...datos, marcaId: marca } });
  }
  const completar: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(datos)) if (k !== 'slug' && k !== 'nombre' && !vacio(v) && vacio((actual as Record<string, unknown>)[k])) completar[k] = v;
  if (Object.keys(completar).length) {
    console.log(`  ~ categoría «${datos.nombre}»: completa ${Object.keys(completar).join(', ')}`);
    if (APLICAR) return prisma.categoria.update({ where: { id: actual.id }, data: completar });
  } else console.log(`  = categoría «${datos.nombre}» ya está`);
  return actual;
}

async function cargarLineas(nombreMarca: string, prefijo: string, lineas: Linea[]) {
  console.log(`\n${nombreMarca}`);
  const marca = await marcaId(nombreMarca);
  if (!marca) return;
  for (const [i, l] of lineas.entries()) {
    const cat = await categoria(marca, {
      slug: l.id, nombre: l.nombre, orden: i, portadaUrl: l.foto, icono: undefined, resumen: l.lema, texto: l.texto,
      galeria: l.galeria.map((g) => g.src),
    });
    for (const p of l.productos) {
      const sku = `${prefijo}-${l.id}-${slugify(p.nombre)}`.slice(0, 60);
      const existe = await prisma.producto.findFirst({ where: { marcaId: marca, sku } });
      if (existe) { console.log(`    = ${p.nombre}`); continue; }
      console.log(`    + ${p.nombre}`);
      if (APLICAR && cat) {
        await prisma.producto.create({
          data: { marcaId: marca, categoriaId: cat.id, nombre: p.nombre, slug: slugify(p.nombre), sku, precio: 0, detalle: p.detalle, descripcion: p.descripcion, imagenes: [p.img], activo: true },
        });
      }
    }
  }
}

async function main() {
  console.log(APLICAR ? 'MODO: se escribe en la base' : 'MODO: simulación (agrega --aplicar para escribir)');
  if (!SOLO || SOLO === 'kelqa') {
    const { lineas } = (await importar('../../../kelqa-web/src/lib/contenido.ts')) as { lineas: Linea[] };
    await cargarLineas('Kelqa', 'KQ', lineas);
  }
  if (!SOLO || SOLO === 'imaninki') {
    const { lineas } = (await importar('../../../imaninki-web/src/lib/contenido.ts')) as { lineas: Linea[] };
    await cargarLineas('Imaninki', 'IM', lineas);
  }
  if (!SOLO || SOLO === 'fimav') {
    console.log('\nFimav');
    const marca = await marcaId('Fimav', true);
    if (marca) {
      const { categorias } = (await importar('../../../fimav-web/src/lib/categorias.ts')) as { categorias: CategoriaFimav[] };
      for (const [i, c] of categorias.entries()) {
        await categoria(marca, {
          slug: c.slug, nombre: c.nombre, orden: i, portadaUrl: c.fotos[0], icono: c.icono?.displayName?.toLowerCase(), resumen: c.resumen,
          galeria: c.fotos, marcasComerciales: c.marcas,
        });
      }
    }
  }
}

main().catch((e) => { console.error(e); process.exitCode = 1; }).finally(() => prisma.$disconnect());
