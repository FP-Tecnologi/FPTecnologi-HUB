/*
 * Markdown -> HTML para los artículos del blog (lo que escriben en el
 * dashboard). Subconjunto chico y seguro: todo el texto se escapa ANTES de
 * convertir, así que no entra HTML del autor; los links solo aceptan
 * http(s), rutas internas y mailto. La misma función vive en
 * apps/admin/src/lib/markdown.ts (vista previa del editor) -- mantenerlas iguales.
 *
 * Soporta: ## / ### títulos, párrafos, **negrita**, *cursiva*, `código`,
 * [links](url), ![imagen](url), listas "- " y "1. ", citas "> ".
 * ponytail: parser propio en vez de una librería; si piden tablas o
 * código en bloque, pasar a `marked` + sanitizado.
 */
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const okUrl = (u: string) => /^(https?:\/\/|\/|mailto:)/i.test(u);

function inline(text: string): string {
  return esc(text)
    .replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => (okUrl(url) ? `<img src="${url}" alt="${alt}" loading="lazy" />` : m))
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, t, url) =>
      okUrl(url) ? `<a href="${url}"${url.startsWith('http') ? ' target="_blank" rel="noreferrer"' : ''}>${t}</a>` : m,
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

/** Identificador de ancla para un título (sin tildes, minúsculas, guiones). */
const anclaDe = (t: string) =>
  t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'seccion';

/** Títulos ## y ### del artículo con su ancla, para el índice lateral. */
export function indiceArticulo(md: string): { nivel: 2 | 3; texto: string; id: string }[] {
  const usados = new Map<string, number>();
  const out: { nivel: 2 | 3; texto: string; id: string }[] = [];
  for (const raw of md.replace(/\r/g, '').split('\n')) {
    const m = raw.trim().match(/^(#{2,3})\s+(.*)$/);
    if (!m) continue;
    const base = anclaDe(m[2]);
    const n = (usados.get(base) ?? 0) + 1;
    usados.set(base, n);
    out.push({ nivel: m[1].length as 2 | 3, texto: m[2].replace(/[*`]/g, ''), id: n > 1 ? `${base}-${n}` : base });
  }
  return out;
}

export function markdownToHtml(md: string): string {
  const out: string[] = [];
  const idsUsados = new Map<string, number>();
  let lista: { tipo: 'ul' | 'ol'; items: string[] } | null = null;
  let parrafo: string[] = [];
  let cita: string[] = [];

  const cerrar = () => {
    if (parrafo.length) out.push(`<p>${inline(parrafo.join(' '))}</p>`), (parrafo = []);
    if (lista) out.push(`<${lista.tipo}>${lista.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${lista.tipo}>`), (lista = null);
    if (cita.length) out.push(`<blockquote>${inline(cita.join(' '))}</blockquote>`), (cita = []);
  };

  for (const raw of md.replace(/\r/g, '').split('\n')) {
    const line = raw.trim();
    let m: RegExpMatchArray | null;
    if (!line) {
      cerrar();
    } else if ((m = line.match(/^(#{2,3})\s+(.*)$/))) {
      cerrar();
      const base = anclaDe(m[2]);
      const n = (idsUsados.get(base) ?? 0) + 1;
      idsUsados.set(base, n);
      out.push(`<h${m[1].length} id="${n > 1 ? `${base}-${n}` : base}">${inline(m[2])}</h${m[1].length}>`);
    } else if ((m = line.match(/^>\s?(.*)$/))) {
      if (parrafo.length || lista) cerrar();
      cita.push(m[1]);
    } else if ((m = line.match(/^[-*]\s+(.*)$/)) || (m = line.match(/^\d+[.)]\s+(.*)$/))) {
      const tipo = /^\d/.test(line) ? 'ol' : 'ul';
      if (parrafo.length || cita.length || (lista && lista.tipo !== tipo)) cerrar();
      lista ??= { tipo, items: [] };
      lista.items.push(m[1]);
    } else {
      if (lista || cita.length) cerrar();
      parrafo.push(line);
    }
  }
  cerrar();
  return out.join('\n');
}

export const minutosLectura = (md: string) => Math.max(1, Math.round(md.split(/\s+/).length / 200));
