/**
 * Importador WooCommerce → catálogo de la API (Fase 0.4).
 *
 * Lee el CSV nativo de WooCommerce (Productos → Exportar) y hace upsert por
 * (marcaId, sku): crea categorías/productos que faltan y actualiza los que
 * ya existen (precio, oferta, fotos, descripción, activo). Nunca borra.
 *
 * Uso:
 *   npx tsx prisma/import-woocommerce.ts --csv prisma/seeds/woocommerce-1.csv,prisma/seeds/woocommerce-2.csv [--marca <id|nombre>] [--dry-run] [--limit N]
 *
 * Acepta varios CSV (separados por coma): útil cuando el export viene en
 * partes. El upsert por (marcaId, sku) hace idempotente pasar el mismo
 * archivo dos veces.
 *
 * Mapeo (verificado contra el export real de fptecnologi.com):
 *   SKU → sku | Nombre → nombre | Publicado=1 → activo (otro valor → inactivo,
 *   se revisa en el dashboard) | ¿Está destacado? → destacado |
 *   Precio rebajado → precio + Precio normal → precioAntes (si solo hay
 *   normal, precio=normal sin oferta; sin ningún precio → precio 0 + inactivo) |
 *   Categorías "A > B, C" → primera hoja como principal (todas las hojas se
 *   crean) | Marcas → marcaComercial (normalizada) | Imágenes → imagenes |
 *   Descripción → texto plano (sin HTML, máx. 3000) + Garantía del atributo |
 *   ¿Existencias?=1 → stock 100 solo al crear (el stock se gestiona después
 *   en el dashboard; en updates no se toca).
 *
 * No usa dependencias nuevas: parser CSV RFC4180 propio (el export trae
 * comillas, comas y saltos de línea dentro de los campos).
 */
import { readFileSync } from 'node:fs';
import { PrismaClient } from '../src/generated/prisma/client.js';

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .map((a) => a.split(/=(.+)/))
    .map(([k, v]) => [k.replace(/^--/, ''), v ?? 'true']),
);
const CSV_PATHS = ((args.csv as string) ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const DRY_RUN = args['dry-run'] === 'true';
const LIMIT = args.limit ? Number(args.limit) : Infinity;
if (CSV_PATHS.length === 0) {
  console.error('Falta --csv <ruta>. Ej: npx tsx prisma/import-woocommerce.ts --csv prisma/seeds/woocommerce-1.csv --dry-run');
  process.exit(1);
}

// --- mini .env (solo DATABASE_URL, sin traer dotenv) ---
for (const line of readFileSync(new URL('./.env', `file://${process.cwd()}/`), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) {
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
}

// --- parser CSV RFC4180 (comillas dobles escapadas como "", saltos dentro) ---
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;
  const src = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (quoted) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c === '\r') { /* se ignora, el \n manda */ }
    else field += c;
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

function slugify(t: string): string {
  const s = t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
  return s || 'producto';
}

function textoPlano(html: string, max = 3000): string {
  const t = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, ' ')
    .trim();
  return t.length > max ? `${t.slice(0, max - 1).trim()}…` : t;
}

/** "Hewlett packard" → HP, etc. (insensible a mayúsculas). */
function marcaCanon(raw: string): string {
  const k = raw.trim().toLowerCase();
  const mapa: Record<string, string> = {
    'hewlett packard': 'HP', hp: 'HP', dell: 'Dell', lenovo: 'Lenovo', lg: 'LG',
    samsung: 'Samsung', epson: 'Epson', brother: 'Brother', asus: 'ASUS',
    viewsonic: 'ViewSonic', xerox: 'Xerox', zkteco: 'ZKTeco', sharp: 'Sharp',
    sophos: 'Sophos', yealink: 'Yealink', shure: 'Shure', optoma: 'Optoma',
    nureva: 'Nureva', 'screen beam': 'ScreenBeam', satra: 'Satra',
    maxhub: 'MAXHUB', 'ls cable': 'LS Cable', siemon: 'Siemon',
    viewled: 'Viewled', touchone: 'TouchOne', teros: 'Teros', optimus: 'Optimus',
    'i3 technologies': 'i3 Technologies', microsoft: 'Microsoft',
  };
  return mapa[k] ?? raw.trim();
}

const num = (v: string): number | null => {
  const n = Number(v.trim().replace(',', '.'));
  return v.trim() !== '' && !Number.isNaN(n) && n >= 0 ? n : null;
};

const prisma = new PrismaClient();

type MapaCols = {
  i: Record<'tipo' | 'sku' | 'nombre' | 'publicado' | 'destacado' | 'rebajado' | 'normal' | 'cats' | 'imagenes', number>;
  cDescCorta: number; cDesc: number; cMarcas: number; cExist: number; cSlugWp: number;
  attrs: Array<{ n: number; v: number }>;
};

function mapaColumnas(head: string[]): MapaCols {
  const col = (name: string) => head.indexOf(name);
  const i = {
    tipo: col('Tipo'), sku: col('SKU'), nombre: col('Nombre'), publicado: col('Publicado'),
    destacado: col('¿Está destacado?'),
    rebajado: col('Precio rebajado'), normal: col('Precio normal'), cats: col('Categorías'),
    imagenes: col('Imágenes'),
  };
  // Obligatorias para mapear; el resto puede faltar según cómo se exportó
  // (vimos exports de ~50 y de 100+ columnas).
  const faltan = (Object.keys(i) as Array<keyof typeof i>).filter((k) => i[k] < 0);
  if (faltan.length > 0) throw new Error(`Columnas no encontradas en el CSV: ${faltan.join(', ')}`);
  const attrs: Array<{ n: number; v: number }> = [];
  for (let n = 1; n <= 10; n++) {
    const a = head.indexOf(`Nombre del atributo ${n}`);
    const b = head.indexOf(`Valor(es) del atributo ${n}`);
    if (a >= 0 && b >= 0) attrs.push({ n: a, v: b });
  }
  return {
    i, attrs,
    cDescCorta: col('Descripción corta'),
    cDesc: col('Descripción'),
    cMarcas: col('Marcas'),
    cExist: col('¿Existencias?'),
    cSlugWp: col('Meta: _wp_desired_post_slug'),
  };
}

const celda = (r: string[], c: number) => (c < 0 ? '' : (r[c] ?? ''));

async function main() {
  // Cada archivo se mapea con SU propia cabecera (pueden traer distinto
  // número/orden de columnas según el export).
  const archivos = CSV_PATHS.map((p) => {
    const rs = parseCsv(readFileSync(p, 'utf8'));
    return { ruta: p, mapa: mapaColumnas(rs[0].map((h) => h.trim())), filas: rs.slice(1) };
  });
  for (const a of archivos) console.log(`${a.ruta}: ${a.filas.length} filas`);

  // Marca destino: --marca <id|nombre> o la que contenga "fptecnologi"
  const marcaArg = args.marca as string | undefined;
  const marca = marcaArg
    ? await prisma.marca.findFirst({
        where: { OR: [{ id: marcaArg }, { nombre: { contains: marcaArg, mode: 'insensitive' } }] },
      })
    : await prisma.marca.findFirst({ where: { nombre: { contains: 'fptecnologi', mode: 'insensitive' } } });
  if (!marca) throw new Error('Marca no encontrada (pasa --marca <id|nombre>)');
  const marcaId = marca.id;
  console.log(`Marca: ${marca.nombre} (${marcaId})${DRY_RUN ? ' — DRY RUN (no se escribe)' : ''}`);

  const rep = { filas: 0, creados: 0, actualizados: 0, omitidos: [] as string[], sinPrecio: [] as string[], inactivos: [] as string[] };
  const slugsUso = new Set<string>();
  const catCache = new Map<string, string>(); // slug categoría → id

  async function categoriaId(nombreHoja: string): Promise<string> {
    const slug = slugify(nombreHoja);
    const hit = catCache.get(slug);
    if (hit) return hit;
    if (DRY_RUN) { catCache.set(slug, `dry:${slug}`); return `dry:${slug}`; }
    const cat = await prisma.categoria.upsert({
      where: { marcaId_slug: { marcaId, slug } },
      update: {},
      create: { marcaId, nombre: nombreHoja.trim(), slug },
    });
    catCache.set(slug, cat.id);
    return cat.id;
  }

  for (const a of archivos) {
    const { i, attrs, cDescCorta, cDesc, cMarcas, cExist, cSlugWp } = a.mapa;
    for (const r of a.filas) {
    if (rep.filas >= LIMIT) break;
    rep.filas++;
    const sku = (r[i.sku] ?? '').trim();
    const nombre = (r[i.nombre] ?? '').trim();
    if ((r[i.tipo] ?? '').trim() !== 'simple') { rep.omitidos.push(`fila ${rep.filas}: tipo ${r[i.tipo] || '?'} (solo simple)`); continue; }
    if (!sku) { rep.omitidos.push(`fila ${rep.filas}: sin SKU`); continue; }
    if (!nombre) { rep.omitidos.push(`fila ${rep.filas}: ${sku} sin nombre`); continue; }

    const precioReb = num(r[i.rebajado] ?? '');
    const precioNor = num(r[i.normal] ?? '');
    const precio = precioReb ?? precioNor ?? 0;
    const precioAntes = precioReb !== null && precioNor !== null && precioNor > precioReb ? precioNor : null;
    const tienePrecio = precioReb !== null || precioNor !== null;
    const activo = (r[i.publicado] ?? '').trim() === '1' && tienePrecio;
    if (!tienePrecio) rep.sinPrecio.push(sku);
    if (!activo) rep.inactivos.push(sku);

    const hojas = (r[i.cats] ?? '').split(/\s*,\s*/).map((c) => c.split('>').pop()!.trim()).filter(Boolean);
    const hojasUnicas = [...new Set(hojas)];
    const catPrincipal = hojasUnicas[0] ?? 'General';
    const categoriaIdFinal = await categoriaId(catPrincipal);
    for (const h of hojasUnicas.slice(1)) await categoriaId(h);

    const imagenes = (r[i.imagenes] ?? '').split(/\s*,\s*/).map((u) => u.trim()).filter((u) => /^https?:\/\//.test(u));
    let desc = textoPlano(celda(r, cDescCorta)) + (celda(r, cDescCorta) && celda(r, cDesc) ? '\n\n' : '') + textoPlano(celda(r, cDesc));
    for (const a of attrs) {
      if ((r[a.n] ?? '').trim().toLowerCase() === 'garantía' && (r[a.v] ?? '').trim()) {
        desc = `${desc}\n\nGarantía: ${(r[a.v] ?? '').trim()}`.trim();
      }
    }

    let slug = celda(r, cSlugWp).trim();
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) slug = slugify(nombre);
    if (slugsUso.has(slug)) slug = `${slug}-${slugify(sku)}`;
    slugsUso.add(slug);

    const base = {
      nombre,
      descripcion: desc || null,
      slug,
      precio,
      precioAntes,
      moneda: 'USD',
      marcaComercial: celda(r, cMarcas).trim() ? marcaCanon(celda(r, cMarcas)) : null,
      imagenes,
      destacado: (r[i.destacado] ?? '').trim() === '1',
      activo,
      categoriaId: categoriaIdFinal,
    };
    if (DRY_RUN) { rep.creados++; continue; }
    const existe = await prisma.producto.findUnique({ where: { marcaId_sku: { marcaId, sku } } });
    if (existe) {
      // En updates no se toca el stock (se gestiona en el dashboard).
      const { categoriaId: _sinUso, ...resto } = { ...base, stock: undefined };
      void _sinUso;
      await prisma.producto.update({ where: { id: existe.id }, data: resto });
      rep.actualizados++;
    } else {
      await prisma.producto.create({
        data: { ...base, marcaId, sku, stock: celda(r, cExist).trim() === '1' ? 100 : 0 },
      });
      rep.creados++;
    }
    }
  }

  console.log(`\nFilas: ${rep.filas} | Creados: ${rep.creados} | Actualizados: ${rep.actualizados} | Omitidos: ${rep.omitidos.length}`);
  if (rep.omitidos.length > 0) console.log('Omitidos:\n- ' + rep.omitidos.join('\n- '));
  if (rep.sinPrecio.length > 0) console.log(`Sin precio (precio 0 + inactivos, revisar): ${rep.sinPrecio.join(', ')}`);
  if (rep.inactivos.length > 0) console.log(`Inactivos (no se ven en tienda): ${rep.inactivos.join(', ')}`);
  console.log('Nota: precios del CSV se toman como USD sin IGV (igual que la web actual). Stock inicial 100 solo al crear; se ajusta en el dashboard.');
}

main()
  .catch((e) => { console.error(e instanceof Error ? e.message : e); process.exit(1); })
  .finally(() => prisma.$disconnect());
