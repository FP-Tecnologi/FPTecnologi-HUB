import type { CotizacionCuenta } from './cuenta';

const esc = (t: string) => t.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });

/* Abre la propuesta de una cotización como documento y el diálogo de impresión (ahí se elige "Guardar como PDF"). */
export function imprimirCotizacion(c: CotizacionCuenta, contacto: { address: string; phoneVentas: string; email: string }) {
  const w = window.open('', '_blank');
  if (!w) return false;
  const monto = c.monto != null ? `${esc(c.moneda)} ${Number(c.monto).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '';
  w.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Cotización ${esc(c.numero ?? '')}</title>
<style>body{font-family:system-ui,Segoe UI,Arial,sans-serif;color:#0b1b26;max-width:760px;margin:32px auto;padding:0 24px;line-height:1.55}
header{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #2898ee;padding-bottom:16px}
h1{font-size:22px;margin:0}small{color:#555}.n{font-size:20px;font-weight:700;text-align:right}
.caja{background:#f4f9fe;border-radius:10px;padding:14px 16px;margin:18px 0;white-space:pre-wrap}
dl{display:grid;grid-template-columns:auto 1fr;gap:6px 24px}dt{color:#555}dd{margin:0;font-weight:600}
footer{margin-top:40px;border-top:1px solid #ddd;padding-top:10px;font-size:12px;color:#555}</style></head><body>
<header><div><h1>FPTecnologi &amp; System</h1><small>${esc(contacto.address)}<br>${esc(contacto.phoneVentas)} · ${esc(contacto.email)}</small></div>
<div><small>COTIZACIÓN</small><div class="n">${esc(c.numero ?? '')}</div></div></header>
<h2>${esc(c.servicio.nombre)}</h2>
<dl><dt>Solicitada el</dt><dd>${fecha(c.createdAt)}</dd>${c.enviadaAt ? `<dt>Enviada el</dt><dd>${fecha(c.enviadaAt)}</dd>` : ''}${c.validezHasta ? `<dt>Válida hasta</dt><dd>${fecha(c.validezHasta)}</dd>` : ''}${monto ? `<dt>Inversión</dt><dd>${monto}</dd>` : ''}</dl>
${c.mensaje ? `<p><strong>Lo que solicitaste</strong></p><div class="caja">${esc(c.mensaje)}</div>` : ''}
${c.propuesta ? `<p><strong>Propuesta</strong></p><div class="caja">${esc(c.propuesta)}</div>` : ''}
<footer>Documento generado desde Mi cuenta. Sujeto a la validez indicada.</footer>
<script>onload=()=>setTimeout(()=>print(),300)</script></body></html>`);
  w.document.close();
  return true;
}
