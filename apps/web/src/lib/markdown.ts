/*
 * Markdown -> HTML para los artículos del blog (lo que escriben en el
 * dashboard). Subconjunto chico y seguro: todo el texto se escapa ANTES de
 * convertir, así que no entra HTML del autor; los links solo aceptan
 * http(s), rutas internas y mailto. La misma función vive en
 * apps/web-fptecnologi/src/lib/markdown.ts (render público) -- mantenerlas iguales.
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

export function markdownToHtml(md: string): string {
  const out: string[] = [];
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
      out.push(`<h${m[1].length}>${inline(m[2])}</h${m[1].length}>`);
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
