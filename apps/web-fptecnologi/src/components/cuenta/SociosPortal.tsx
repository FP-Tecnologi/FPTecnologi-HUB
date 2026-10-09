'use client';

import { useMemo, useState } from 'react';
import { Building2, Download, FileText, Headset, Home, LifeBuoy, LogOut, Search, Ticket, UserRound, type LucideIcon } from 'lucide-react';
import type { PortalSocio, RecursoSocio } from '@/lib/cuenta';

type Tab = 'inicio' | 'recursos' | 'soporte' | 'perfil';
const TABS: { id: Tab; label: string; Icon: LucideIcon }[] = [
  { id: 'inicio', label: 'Inicio', Icon: Home },
  { id: 'recursos', label: 'Recursos', Icon: FileText },
  { id: 'soporte', label: 'Soporte', Icon: LifeBuoy },
  { id: 'perfil', label: 'Mi empresa', Icon: Building2 },
];

// Fondo e ícono SVG según el tipo de archivo (los archivos son privados: no hay miniaturas generadas en el servidor).
const ESTILO: Record<RecursoSocio['tipo'], { bg: string; fg: string; d: string; label: string }> = {
  IMAGEN: { bg: '#e0f2fe', fg: '#0369a1', d: 'M4 5h16v14H4zM8 10a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm-4 8 5-5 3 3 4-4 4 4', label: 'Imagen' },
  PDF: { bg: '#fee2e2', fg: '#b91c1c', d: 'M6 3h9l4 4v14H6zM14 3v5h5M9 13h6M9 17h6', label: 'PDF' },
  VIDEO: { bg: '#ede9fe', fg: '#6d28d9', d: 'M4 6h12v12H4zM16 10l5-3v10l-5-3', label: 'Video' },
  DOCUMENTO: { bg: '#dcfce7', fg: '#15803d', d: 'M6 3h9l4 4v14H6zM14 3v5h5M9 12h6M9 16h4', label: 'Documento' },
  OTRO: { bg: '#fef3c7', fg: '#b45309', d: 'M5 8h14v12H5zM5 8l2-4h10l2 4M12 8v6M10 12h4', label: 'Pack ZIP' },
};
const TIPOS: { v: '' | RecursoSocio['tipo']; label: string }[] = [
  { v: '', label: 'Todo' },
  { v: 'IMAGEN', label: 'Imágenes' },
  { v: 'PDF', label: 'PDF' },
  { v: 'VIDEO', label: 'Videos' },
  { v: 'DOCUMENTO', label: 'Documentos' },
  { v: 'OTRO', label: 'Packs' },
];
const ESTADO_TICKET: Record<string, string> = { NUEVO: 'Recibido', EN_REVISION: 'En revisión', ESPERANDO_CLIENTE: 'Esperando tu respuesta', RESUELTO: 'Resuelto', CERRADO: 'Cerrado' };
const TIPO_TICKET = { RECLAMO: 'Reclamo', VERIFICACION: 'Verificación', SOPORTE: 'Soporte técnico' } as const;
const peso = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);
const fecha = (iso: string) => new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'long', year: 'numeric' });
const archivo = (id: string, inline = false) => `/api/socios/archivo/${id}${inline ? '?inline=1' : ''}`;
const tarjeta = 'rounded-2xl bg-white shadow-lg shadow-brand-950/10';

function TarjetaRecurso({ r }: { r: RecursoSocio }) {
  const e = ESTILO[r.tipo];
  return (
    <li className={`flex flex-col overflow-hidden ${tarjeta}`}>
      <div className="flex aspect-[4/3] items-center justify-center" style={{ background: e.bg }}>
        {r.tipo === 'IMAGEN' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={archivo(r.id, true)} alt={r.titulo} loading="lazy" className="h-full w-full object-contain" />
        ) : r.tipo === 'VIDEO' ? (
          <video src={archivo(r.id, true)} controls preload="none" className="h-full w-full bg-ink object-contain" />
        ) : (
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={e.fg} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d={e.d} /></svg>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">{[r.fabricante, r.categoria].filter(Boolean).join(' · ') || e.label}</p>
        <h3 className="mt-1 font-display text-base font-bold text-ink">{r.titulo}</h3>
        {r.descripcion && <p className="mt-1 line-clamp-2 text-sm text-ink/65">{r.descripcion}</p>}
        <div className="mt-auto flex items-center justify-between pt-4">
          <span className="text-xs text-ink/55">{e.label} · {peso(r.bytes)}</span>
          <a href={archivo(r.id)} download className="inline-flex items-center gap-1.5 rounded-xl bg-brand-primary px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700">
            <Download className="h-4 w-4" aria-hidden />
            Descargar
          </a>
        </div>
      </div>
    </li>
  );
}

/* Intranet de socios: Inicio (resumen y novedades), Recursos (material privado con filtros), Soporte (sus tickets)
   y Mi empresa (datos y cierre de sesión). Todo sale de la base de datos; los archivos solo se entregan con sesión. */
export function SociosPortal({ portal }: { portal: PortalSocio }) {
  const { socio, recursos, tickets } = portal;
  const [tab, setTab] = useState<Tab>('inicio');
  const [fabricante, setFabricante] = useState('');
  const [tipo, setTipo] = useState<'' | RecursoSocio['tipo']>('');
  const [q, setQ] = useState('');
  const [saliendo, setSaliendo] = useState(false);

  const fabricantes = useMemo(() => [...new Set(recursos.map((r) => r.fabricante).filter(Boolean) as string[])].sort(), [recursos]);
  const visibles = recursos.filter(
    (r) => (!fabricante || r.fabricante === fabricante) && (!tipo || r.tipo === tipo) && (!q.trim() || `${r.titulo} ${r.descripcion ?? ''} ${r.categoria ?? ''} ${r.fabricante ?? ''}`.toLowerCase().includes(q.trim().toLowerCase())),
  );
  const abiertos = tickets.filter((t) => t.estado !== 'RESUELTO' && t.estado !== 'CERRADO').length;
  const nuevos = [...recursos].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4);
  const chip = (activo: boolean) => `rounded-xl px-3.5 py-2 text-sm font-semibold transition-colors ${activo ? 'bg-brand-primary text-white' : 'bg-brand-100 text-brand-700 hover:bg-brand-primary hover:text-white'}`;

  async function salir() {
    setSaliendo(true);
    await fetch('/api/cuenta/salir', { method: 'POST' }).catch(() => undefined);
    window.location.href = '/socios';
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[16rem_1fr] lg:items-start">
      <aside className="space-y-4 lg:sticky lg:top-28">
        <div className={`${tarjeta} p-5`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-primary to-brand-dark text-white"><Building2 className="h-6 w-6" strokeWidth={1.8} /></span>
          <p className="mt-3 font-display text-lg font-bold text-ink">{socio.empresa ?? 'Socio'}</p>
          <p className="text-sm text-ink/60">{socio.nombre ?? socio.email}</p>
        </div>
        <nav aria-label="Intranet de socios" className={`${tarjeta} p-2`}>
          {TABS.map(({ id, label, Icon }) => (
            <button key={id} type="button" onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined} className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-colors ${tab === id ? 'bg-brand-primary text-white' : 'text-ink/70 hover:bg-brand-100 hover:text-brand-700'}`}>
              <Icon className="h-4 w-4" strokeWidth={2} aria-hidden />
              {label}
            </button>
          ))}
        </nav>
        <button type="button" onClick={salir} disabled={saliendo} className="flex w-full items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-white p-3 text-sm font-semibold text-ink/60 transition-colors hover:text-rose-600"><LogOut className="h-4 w-4" strokeWidth={2} /> {saliendo ? 'Saliendo…' : 'Cerrar sesión'}</button>
      </aside>

      <section aria-live="polite">
        {tab === 'inicio' && (
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink">Hola{socio.nombre ? `, ${socio.nombre}` : ''}</h2>
              <p className="mt-1 text-sm text-ink/65">Bienvenido a la intranet de socios de FP Tecnologi: material de marcas, soporte y tus datos en un solo lugar.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { n: recursos.length, t: 'Recursos disponibles', Icon: FileText, ir: 'recursos' as Tab },
                { n: abiertos, t: 'Tickets abiertos', Icon: Ticket, ir: 'soporte' as Tab },
                { n: fabricantes.length, t: 'Marcas con material', Icon: Building2, ir: 'recursos' as Tab },
              ].map(({ n, t, Icon, ir }) => (
                <button key={t} type="button" onClick={() => setTab(ir)} className={`${tarjeta} group p-5 text-left transition-all hover:-translate-y-0.5 hover:bg-brand-primary`}>
                  <Icon className="h-6 w-6 text-brand-primary transition-colors group-hover:text-white" strokeWidth={1.8} aria-hidden />
                  <p className="mt-3 font-display text-3xl font-bold text-ink transition-colors group-hover:text-white">{n}</p>
                  <p className="text-sm text-ink/60 transition-colors group-hover:text-white/90">{t}</p>
                </button>
              ))}
            </div>
            <a href="/cuenta" className={`${tarjeta} flex items-center justify-between gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-brand-primary`}>
              <span>
                <span className="block font-display text-lg font-bold text-ink">Mis pedidos, cotizaciones y presupuestos</span>
                <span className="text-sm text-ink/60">Revisa su avance y descarga tus documentos en PDF.</span>
              </span>
              <span aria-hidden className="text-brand-primary">→</span>
            </a>
            {nuevos.length > 0 && (
              <div>
                <h3 className="font-display text-lg font-bold text-ink">Lo más reciente</h3>
                <ul className="mt-4 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{nuevos.map((r) => <TarjetaRecurso key={r.id} r={r} />)}</ul>
              </div>
            )}
          </div>
        )}

        {tab === 'recursos' && (
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/55" aria-hidden />
                <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar recurso…" aria-label="Buscar recurso" className="w-full rounded-xl border border-brand-200 bg-white py-2.5 pl-10 pr-3 text-sm text-ink outline-none focus:border-brand-primary" />
              </div>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Tipo de archivo">
                {TIPOS.map((t) => <button key={t.label} type="button" onClick={() => setTipo(t.v)} aria-pressed={tipo === t.v} className={chip(tipo === t.v)}>{t.label}</button>)}
              </div>
            </div>
            {fabricantes.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Marca">
                <button type="button" onClick={() => setFabricante('')} aria-pressed={!fabricante} className={chip(!fabricante)}>Todas las marcas</button>
                {fabricantes.map((f) => <button key={f} type="button" onClick={() => setFabricante(f)} aria-pressed={fabricante === f} className={chip(fabricante === f)}>{f}</button>)}
              </div>
            )}
            {visibles.length === 0 ? (
              <p className="mt-10 text-center text-sm text-ink/65">{recursos.length === 0 ? 'Todavía no hay recursos publicados. Vuelve pronto.' : 'Ningún recurso coincide con el filtro.'}</p>
            ) : (
              <ul className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{visibles.map((r) => <TarjetaRecurso key={r.id} r={r} />)}</ul>
            )}
          </div>
        )}

        {tab === 'soporte' && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-2xl font-bold text-ink">Soporte</h2>
                <p className="text-sm text-ink/65">Tus tickets abiertos con este correo ({socio.email}).</p>
              </div>
              <a href="/tickets" className="inline-flex items-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700"><Headset className="h-4 w-4" aria-hidden />Abrir ticket</a>
            </div>
            {tickets.length === 0 ? (
              <p className={`${tarjeta} p-6 text-center text-sm text-ink/65`}>Aún no tienes tickets.</p>
            ) : (
              <ul className="space-y-3">
                {tickets.map((t) => (
                  <li key={t.id} className={`${tarjeta} flex flex-wrap items-center justify-between gap-3 p-4`}>
                    <div>
                      <p className="font-display font-bold text-ink">{t.numero}</p>
                      <p className="text-sm text-ink/60">{TIPO_TICKET[t.tipo]}{t.producto ? ` · ${t.producto}` : ''} · {fecha(t.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-xl bg-brand-100 px-3 py-1.5 text-xs font-bold text-brand-700">{ESTADO_TICKET[t.estado] ?? t.estado}</span>
                      <a href={`/tickets/seguimiento?n=${encodeURIComponent(t.numero)}`} className="text-sm font-semibold text-brand-700 hover:underline">Ver</a>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {tab === 'perfil' && (
          <div className={`${tarjeta} max-w-2xl p-6`}>
            <h2 className="flex items-center gap-2 font-display text-2xl font-bold text-ink"><UserRound className="h-6 w-6 text-brand-primary" aria-hidden />Mi empresa</h2>
            <dl className="mt-5 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[10rem_1fr]">
              {([['Empresa', socio.empresa], ['RUC', socio.ruc], ['Contacto', socio.nombre], ['Cargo', socio.cargo], ['Correo', socio.email], ['Celular', socio.celular], ['Socio desde', fecha(socio.desde)]] as [string, string | null][]).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="contents"><dt className="text-ink/55">{k}</dt><dd className="font-medium text-ink">{v}</dd></div>
              ))}
            </dl>
            <p className="mt-6 text-sm text-ink/60">¿Algún dato cambió? Escríbenos desde <a href="/contacto" className="font-semibold text-brand-700 hover:underline">Contacto</a> y lo actualizamos.</p>
          </div>
        )}
      </section>
    </div>
  );
}
