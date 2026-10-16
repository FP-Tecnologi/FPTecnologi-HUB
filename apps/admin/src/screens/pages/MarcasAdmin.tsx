'use client';
/*
 * FPTecnologi-HUB — Administración → Marcas (solo super admin): alta y edición de marcas (nombre, colores, contacto),
 * dominios de sus webs (Sitio) y acceso rápido a su dashboard. GET /marcas/resumen.
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHead } from '../../components/shell/PageHead';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { ApiError, useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { SubirImagen, urlImagen } from '../../components/ui/SubirImagen';

interface Marca {
  id: string; nombre: string; logo: string | null; colorPrimario: string | null; colorSecundario: string | null;
  contactoEmail: string | null; contactoTelefono: string | null;
  sitios: { id: string; dominio: string }[];
  _count: { usuarios: number; productos: number; soporteTickets: number };
}
type Form = { nombre: string; logo: string; colorPrimario: string; colorSecundario: string; contactoEmail: string; contactoTelefono: string };
const VACIO: Form = { nombre: '', logo: '', colorPrimario: '', colorSecundario: '', contactoEmail: '', contactoTelefono: '' };
const msg = (e: unknown, d: string) => (e instanceof ApiError ? e.message : d);

export function MarcasAdmin() {
  const router = useRouter();
  const { setActiveMarcaId, setAdminMode, refreshMarcas } = useAuth();
  const [marcas, setMarcas] = useState<Marca[] | null>(null);
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [editando, setEditando] = useState<Marca | 'nueva' | null>(null);
  const [form, setForm] = useState<Form>(VACIO);
  const [modalErr, setModalErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [dominio, setDominio] = useState<Record<string, string>>({});
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, !!editando);

  const cargar = useCallback(async () => {
    try { setMarcas(await api.get<Marca[]>('/marcas/resumen')); setError(''); }
    catch (e) { setError(msg(e, 'No se pudieron cargar las marcas.')); }
  }, []);
  useEffect(() => { void cargar(); }, [cargar]);

  useEffect(() => {
    if (!editando) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setEditando(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [editando]);

  function abrir(m: Marca | 'nueva') {
    setEditando(m); setModalErr('');
    setForm(m === 'nueva' ? VACIO : { nombre: m.nombre, logo: m.logo ?? '', colorPrimario: m.colorPrimario ?? '', colorSecundario: m.colorSecundario ?? '', contactoEmail: m.contactoEmail ?? '', contactoTelefono: m.contactoTelefono ?? '' });
  }

  async function guardar(ev: React.FormEvent) {
    ev.preventDefault();
    if (!editando || busy) return;
    setBusy(true); setModalErr('');
    // Campos vacíos no se envían (la API los deja como están / sin valor).
    const body = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v));
    try {
      if (editando === 'nueva') { await api.post('/marcas', body); setOk('Marca creada.'); await refreshMarcas(); }
      else { await api.patch(`/marcas/${editando.id}`, Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v.trim()])), { marcaId: editando.id }); setOk('Marca actualizada.'); }
      setEditando(null);
      await cargar();
    } catch (e) { setModalErr(msg(e, 'No se pudo guardar la marca.')); }
    finally { setBusy(false); }
  }

  async function accion(fn: () => Promise<unknown>, okTexto: string, d: string) {
    try { await fn(); setError(''); setOk(okTexto); await cargar(); } catch (e) { setOk(''); setError(msg(e, d)); }
  }

  const campo = (k: keyof Form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div className="ax-field"><label className="ax-label" htmlFor={`mk-${k}`}>{label}</label>
      <input id={`mk-${k}`} className="ax-input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} {...props} /></div>
  );

  return (
    <>
      <PageHead
        title="Marcas"
        subtitle="Las empresas de la plataforma: datos, dominios de sus webs y acceso a su dashboard. Solo el super administrador."
        actions={<button type="button" className="ax-btn ax-btn--primary" onClick={() => abrir('nueva')}><span className="ax-btn__label">Nueva marca</span></button>}
      />
      {error && <div role="alert" className="ax-alert ax-alert--danger" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}><div className="ax-alert__content"><p className="ax-alert__message">{error}</p></div></div>}
      {ok && <div role="status" className="ax-alert ax-alert--success" style={{ marginBlockEnd: 'var(--ax-space-4)', padding: 'var(--ax-space-3) var(--ax-space-4)' }}><div className="ax-alert__content"><p className="ax-alert__message">{ok}</p></div></div>}

      {!marcas && <p style={{ color: 'var(--ax-text-muted)' }}>{error ? 'No se pudo cargar. Vuelve a iniciar sesión o recarga.' : 'Cargando…'}</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--ax-space-4)' }}>
        {marcas?.map((m) => (
          <section key={m.id} className="ax-card" role="region" aria-label={m.nombre}>
            <div className="ax-card__header">
              <div className="ax-card__titles" style={{ display: 'flex', alignItems: 'center', gap: 'var(--ax-space-2)' }}>
                {m.colorPrimario && <span aria-hidden="true" style={{ width: 14, height: 14, borderRadius: '50%', background: m.colorPrimario, flexShrink: 0 }} />}
                <h2 className="ax-card__title" style={{ margin: 0 }}>{m.nombre}</h2>
              </div>
            </div>
            <div className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-3)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--ax-space-2)' }}>
                {([['Usuarios', m._count.usuarios], ['Productos', m._count.productos], ['Tickets', m._count.soporteTickets]] as const).map(([l, n]) => (
                  <div key={l}><div style={{ fontSize: 'var(--ax-text-xl)', fontWeight: 600, color: 'var(--ax-text-strong)' }}>{n}</div><div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-muted)' }}>{l}</div></div>
                ))}
              </div>
              <div style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-muted)' }}>
                {m.contactoEmail || 'Sin correo de contacto'}{m.contactoTelefono ? ` · ${m.contactoTelefono}` : ''}
              </div>
              <div>
                <div style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)', marginBlockEnd: 4 }}>Dominios de la web</div>
                <div className="ax-cluster" style={{ gap: 4, flexWrap: 'wrap' }}>
                  {m.sitios.map((s) => (
                    <span key={s.id} className="ax-badge ax-badge--soft ax-badge--neutral ax-badge--pill">
                      {s.dominio}
                      <button type="button" aria-label={`Quitar ${s.dominio}`} style={{ marginInlineStart: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}
                        onClick={() => window.confirm(`¿Quitar el dominio ${s.dominio}?`) && void accion(() => api.delete(`/sitios/${s.id}`, { marcaId: m.id }), 'Dominio quitado.', 'No se pudo quitar el dominio.')}>×</button>
                    </span>
                  ))}
                  {m.sitios.length === 0 && <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Ninguno</span>}
                </div>
                <form className="ax-cluster" style={{ gap: 4, marginBlockStart: 'var(--ax-space-2)', flexWrap: 'nowrap' }}
                  onSubmit={(ev) => { ev.preventDefault(); const d = (dominio[m.id] ?? '').trim().toLowerCase(); if (!d) return; void accion(async () => { await api.post('/sitios', { dominio: d }, { marcaId: m.id }); setDominio({ ...dominio, [m.id]: '' }); }, 'Dominio agregado.', 'No se pudo agregar el dominio.'); }}>
                  <input className="ax-input ax-input--sm" placeholder="ejemplo.com" aria-label={`Nuevo dominio de ${m.nombre}`} value={dominio[m.id] ?? ''} onChange={(e) => setDominio({ ...dominio, [m.id]: e.target.value })} />
                  <button type="submit" className="ax-btn ax-btn--ghost ax-btn--sm" disabled={!(dominio[m.id] ?? '').trim()}>Agregar</button>
                </form>
              </div>
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
                <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => abrir(m)}>Editar</button>
                <button type="button" className="ax-btn ax-btn--secondary ax-btn--sm" onClick={() => { setActiveMarcaId(m.id); setAdminMode(false); router.push('/'); }}>Abrir dashboard</button>
              </div>
            </div>
          </section>
        ))}
      </div>

      {editando && (
        <div className="ax-grid" style={{ position: 'fixed', inset: 0, zIndex: 60, placeItems: 'center', padding: 'var(--ax-space-4)' }}>
          <div onClick={() => setEditando(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(8,10,16,.55)', backdropFilter: 'blur(2px)' }} />
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="mk-title" className="ax-card" style={{ position: 'relative', maxWidth: 460, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="ax-card__header"><div className="ax-card__titles"><h2 className="ax-card__title" id="mk-title">{editando === 'nueva' ? 'Nueva marca' : `Editar ${editando.nombre}`}</h2></div></div>
            <form className="ax-card__body" style={{ paddingTop: 0, display: 'flex', flexDirection: 'column', gap: 'var(--ax-space-4)' }} onSubmit={guardar}>
              {modalErr && <div role="alert" className="ax-alert ax-alert--danger"><div className="ax-alert__content"><p className="ax-alert__message">{modalErr}</p></div></div>}
              {campo('nombre', 'Nombre', { required: true, maxLength: 80 })}
              <div className="ax-field">
                <span className="ax-label">Logo (se usa en la portada de las tarjetas digitales)</span>
                <div className="ax-cluster" style={{ gap: 'var(--ax-space-3)' }}>
                  {form.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={urlImagen(form.logo)} alt="Logo" style={{ height: 40, maxWidth: 160, objectFit: 'contain', background: form.colorPrimario || 'var(--ax-surface-subtle)', borderRadius: 8, padding: 6 }} />
                  ) : <span style={{ fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Sin logo</span>}
                  <SubirImagen etiqueta={form.logo ? 'Cambiar logo' : 'Subir logo'} onSubida={(urls) => setForm({ ...form, logo: urls[0] })} />
                  {form.logo && <button type="button" className="ax-btn ax-btn--ghost ax-btn--sm" onClick={() => setForm({ ...form, logo: '' })}>Quitar</button>}
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--ax-space-3)' }}>
                {campo('colorPrimario', 'Color principal', { placeholder: '#238DC1', maxLength: 9 })}
                {campo('colorSecundario', 'Color secundario', { placeholder: '#385CAD', maxLength: 9 })}
              </div>
              {campo('contactoEmail', 'Correo de contacto', { type: 'email' })}
              {campo('contactoTelefono', 'Teléfono de contacto', { maxLength: 30 })}
              <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', justifyContent: 'flex-end' }}>
                <button type="button" className="ax-btn ax-btn--ghost" onClick={() => setEditando(null)}>Cancelar</button>
                <button type="submit" className="ax-btn ax-btn--primary" disabled={busy || !form.nombre.trim()}>{busy ? 'Guardando…' : 'Guardar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default MarcasAdmin;
