'use client';
/*
 * Barra inferior para celular (< 768px, ver mobile-nav.css): Menú (abre el menú lateral), Inicio, hasta 2 módulos
 * importantes y el Asistente. Los módulos salen de PRIORIDAD filtrada con las mismas reglas que el menú lateral
 * (rol + marca activa + modo Administración), así cada rol y cada marca ve lo suyo: ventas → Tienda, asesores → Chat,
 * comercial → CRM / Cotizador, marketing → Campañas / Web.
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { manifest, slugFromPath, hrefForSlug, tieneContenido, destinoDeGrupo } from '../../lib/manifest';
import { useVistaMenu } from '../../hooks/useVistaMenu';
import { Icon } from '../ui/Icon';

/** Módulos candidatos en orden de importancia, con su rótulo corto. */
const PRIORIDAD: [id: string, etiqueta: string][] = [
  ['marca.ecommerce', 'Tienda'],
  ['marca.chat', 'Chat'],
  ['marca.cotizador', 'Cotizador'],
  ['marca.soluciones', 'Soluciones'],
  ['marca.campanas', 'Campañas'],
  ['marca.web', 'Web'],
  ['inicio.reportes', 'Reportes'],
  ['marca.herramientas', 'Herramientas'],
];
const PRIORIDAD_COMERCIAL: [string, string][] = [['marca.crm', 'CRM'], ['com.captacion', 'Captación'], ['com.campanas', 'Campañas'], ['com.material', 'Material']];
const PRIORIDAD_ADMIN: [string, string][] = [['grp.configuracion', 'Config.'], ['grp.soporte', 'Soporte']];

interface Destino { id: string; etiqueta: string; href: string; icon: string }

export function MobileNav({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname() || '/';
  const { adminMode, esSuperAdmin, comercialMode } = useAuth();
  const ctx = useVistaMenu();
  const [teclado, setTeclado] = useState(false);

  // Con el teclado abierto (escribiendo) la barra estorba: se oculta mientras un campo tiene el foco.
  useEffect(() => {
    const campo = (t: EventTarget | null) => t instanceof HTMLElement && t.matches('input:not([type=checkbox]):not([type=radio]):not([type=button]), textarea, select, [contenteditable=true]');
    const dentro = (e: FocusEvent) => campo(e.target) && setTeclado(true);
    const fuera = () => setTeclado(false);
    document.addEventListener('focusin', dentro);
    document.addEventListener('focusout', fuera);
    return () => { document.removeEventListener('focusin', dentro); document.removeEventListener('focusout', fuera); };
  }, []);

  const modulos: Destino[] = (adminMode ? PRIORIDAD_ADMIN : comercialMode ? PRIORIDAD_COMERCIAL : PRIORIDAD)
    .map(([id, etiqueta]) => ({ nodo: manifest.byId.get(id), etiqueta }))
    .filter((x) => x.nodo && tieneContenido(x.nodo, ctx))
    .slice(0, esSuperAdmin ? 2 : 3)
    .map(({ nodo, etiqueta }) => ({ id: nodo!.id, etiqueta, href: hrefForSlug(destinoDeGrupo(nodo!, ctx)), icon: nodo!.icon }));

  const slug = slugFromPath(pathname);
  const raizActiva = manifest.trail(manifest.bySlug.get(slug))[0]?.id;
  const destinos: Destino[] = [
    { id: 'inicio', etiqueta: 'Inicio', href: comercialMode ? '/comercial/inicio' : '/', icon: 'home' },
    ...modulos,
    // La pantalla del asistente es solo para el super administrador: al resto no se le ofrece un callejón sin salida.
    ...(esSuperAdmin ? [{ id: 'asistente', etiqueta: 'Asistente', href: '/asistente', icon: 'sparkles' }] : []),
  ];
  // En la vista Comercial los grupos usan alias (la misma página vive en otro grupo): se busca el slug entre los hijos ya resueltos.
  const contiene = (id: string): boolean => manifest.childrenOf(id).some((c) => manifest.resolve(c)?.slug === slug || contiene(c.id));
  const activo = (d: Destino) => (d.id === 'inicio' ? slug === (comercialMode ? 'comercial/inicio' : '') : d.id === 'asistente' ? slug === 'asistente' : comercialMode ? contiene(d.id) : raizActiva === d.id);

  return (
    <nav className={`ax-mobnav${teclado ? ' is-hidden' : ''}`} aria-label="Navegación rápida">
      <button type="button" className="ax-mobnav__item" onClick={onMenu} aria-label="Abrir menú lateral">
        <svg className="ax-mobnav__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" /></svg>
        <span>Menú</span>
      </button>
      {destinos.map((d) => (
        <Link key={d.id} href={d.href} className={`ax-mobnav__item${activo(d) ? ' is-active' : ''}`} aria-current={activo(d) ? 'page' : undefined}>
          <Icon name={d.icon} className="ax-mobnav__icon" />
          <span>{d.etiqueta}</span>
        </Link>
      ))}
    </nav>
  );
}
