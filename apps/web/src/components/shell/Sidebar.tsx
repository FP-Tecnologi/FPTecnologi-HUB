'use client';
/*
 * FPTecnologi-HUB · Dashboard — Sidebar (manifest-driven nav tree).
 *
 * Renders the reference .ax-sidebar DOM contract from nav-manifest.json:
 * brand → marca switcher → role="tree" nav with section headers, L1 parent groups
 * (collapsible) and child leaves. The active leaf (matched against the router
 * path) gets `ax-nav__item--active is-active aria-current="page"`, its ancestor
 * group opens (`is-open`, panel un-hidden), and the parent button gets
 * `ax-nav__item--trail` — exactly as core/nav.js does in the HTML edition.
 */
import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useAuth } from '../../context/AuthContext';
import {
  manifest,
  sections,
  groupsInSection,
  slugFromPath,
  hrefForSlug,
  visibleForRole,
  type NavNode,
} from '../../lib/manifest';
import { Icon } from '../ui/Icon';

function Badge({ badge }: { badge: NavNode['badge'] }) {
  if (!badge) return null;
  if (badge.type === 'count')
    return <span className="ax-nav__badge ax-nav__badge--count">{badge.value}</span>;
  if (badge.type === 'Hot') return <span className="ax-nav__badge ax-nav__badge--hot">Hot</span>;
  if (badge.type === 'New') return <span className="ax-nav__badge ax-nav__badge--new">New</span>;
  return null;
}

const CARET = (
  <svg
    className="ax-nav__caret ax-icon--directional"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={24}
    height={24}
    aria-hidden="true"
  >
    <path d="M9 6l6 6l-6 6" />
  </svg>
);

function MarcaSwitcher() {
  const { marcas, activeMarcaId, setActiveMarcaId, adminMode, setAdminMode } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const active = marcas.find((m) => m.marcaId === activeMarcaId) ?? marcas[0] ?? null;
  const isAdmin = marcas.some((m) => m.rol.nombre.toLowerCase() === 'admin');
  const showCombo = marcas.length > 1 || isAdmin;

  return (
    <div className="ax-marcaswitch" style={{ padding: 'var(--ax-space-3) var(--ax-space-4)', borderBottom: '1px solid var(--ax-border)' }}>
      <p style={{ margin: '0 0 var(--ax-space-2)', fontSize: 'var(--ax-text-2xs)', fontWeight: 600, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--ax-text-subtle)' }}>
        Marca / Proyecto
      </p>
      {active && !showCombo && (
        <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', alignItems: 'center' }}>
          <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--ax-accent)' }} />
          <b style={{ fontSize: 'var(--ax-text-sm)', color: 'var(--ax-text-strong)' }}>{active.marca.nombre}</b>
        </div>
      )}
      {showCombo && (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className="ax-marcaswitch__trigger ax-btn ax-btn--secondary ax-btn--block"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
            onKeyDown={(e) => { if (e.key === 'Escape') setOpen(false); }}
            style={{ justifyContent: 'space-between' }}
          >
            <span className="ax-cluster" style={{ gap: 'var(--ax-space-2)' }}>
              <span aria-hidden="true" style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--ax-accent)' }} />
              <span className="ax-btn__label" style={{ fontWeight: 600 }}>{adminMode ? 'Administración' : (active?.marca.nombre ?? 'Elegir')}</span>
            </span>
            {CARET}
          </button>
          {open && (
            <ul role="listbox" aria-label="Elegir vista: administración o marca" style={{ listStyle: 'none', margin: 'var(--ax-space-2) 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {isAdmin && (
                <li key="__admin__">
                  <button
                    type="button"
                    role="option"
                    aria-selected={adminMode}
                    onClick={() => { setAdminMode(true); setOpen(false); router.push('/'); }}
                    className="ax-btn ax-btn--ghost ax-btn--block"
                    style={{ justifyContent: 'flex-start', fontWeight: adminMode ? 600 : 400 }}
                  >
                    <span>Administración</span>
                    <span style={{ marginLeft: 'auto', fontSize: 'var(--ax-text-2xs)', color: 'var(--ax-text-subtle)' }}>Global</span>
                  </button>
                </li>
              )}
              {marcas.map((m) => (
                <li key={m.marcaId}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={!adminMode && active !== null && m.marcaId === active.marcaId}
                    onClick={() => { setActiveMarcaId(m.marcaId); setOpen(false); router.push('/'); }}
                    className="ax-btn ax-btn--ghost ax-btn--block"
                    style={{ justifyContent: 'flex-start', fontWeight: !adminMode && active !== null && m.marcaId === active.marcaId ? 600 : 400 }}
                  >
                    <span>{m.marca.nombre}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 'var(--ax-text-2xs)', color: 'var(--ax-text-subtle)' }}>{m.rol.nombre}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {marcas.length === 0 && (
        <p style={{ margin: 0, fontSize: 'var(--ax-text-xs)', color: 'var(--ax-text-subtle)' }}>Sin marcas asignadas.</p>
      )}
    </div>
  );
}

interface LeafProps {
  node: NavNode;
  level: number;
  activeSlug: string;
  roleName: string | null;
}

function Leaf({ node, level, activeSlug, roleName }: LeafProps) {
  const resolved = manifest.resolve(node)!;
  const isActive = resolved.slug === activeSlug;
  const hidden = !visibleForRole(node, roleName);
  const cls = ['ax-nav__item', 'ax-nav__item--child'];
  if (isActive) cls.push('ax-nav__item--active', 'is-active');
  if (hidden) cls.push('is-hidden');
  return (
    <Link
      className={cls.join(' ')}
      role="treeitem"
      aria-level={level}
      aria-current={isActive ? 'page' : undefined}
      href={hrefForSlug(resolved.slug)}
      tabIndex={isActive ? 0 : -1}
    >
      <span className="ax-nav__bar" aria-hidden="true"></span>
      <span className="ax-nav__label">{node.title}</span>
      <Badge badge={node.badge} />
    </Link>
  );
}

interface GroupProps {
  node: NavNode;
  level: number;
  activeSlug: string;
  roleName: string | null;
}

function Group({ node, level, activeSlug, roleName }: GroupProps) {
  const children = manifest.childrenOf(node.id).filter((c) => c.inMenu && visibleForRole(c, roleName));
  const containsActive = useMemo(
    () => subtreeContainsSlug(node, activeSlug),
    [node, activeSlug],
  );
  const [open, setOpen] = useState(containsActive || level === 1 && node.section === 'MAIN');
  const isOpen = open || containsActive;

  const parentCls = ['ax-nav__item', 'ax-nav__item--parent'];
  if (level > 1) parentCls.push('ax-nav__item--child');
  if (containsActive) parentCls.push('ax-nav__item--trail');

  return (
    <div
      className={`ax-nav__group${isOpen ? ' is-open' : ''}`}
      data-ax-collapse
    >
      <button
        type="button"
        className={parentCls.join(' ')}
        role="treeitem"
        aria-level={level}
        aria-expanded={isOpen}
        data-ax-group={node.id}
        onClick={() => setOpen((o) => !o)}
        tabIndex={containsActive ? 0 : -1}
      >
        {level === 1 && <Icon name={node.icon} className="ax-nav__icon" />}
        <span className="ax-nav__label">{node.title}</span>
        <Badge badge={node.badge} />
        {CARET}
      </button>
      <div
        className="ax-nav__children"
        role="group"
        data-ax-collapse-panel
        hidden={!isOpen}
      >
        {children.map((child) =>
          manifest.childrenOf(child.id).filter((c) => c.inMenu && visibleForRole(c, roleName)).length > 0 ? (
            <Group
              key={child.id}
              node={child}
              level={level + 1}
              activeSlug={activeSlug}
              roleName={roleName}
            />
          ) : (
            <Leaf
              key={child.id}
              node={child}
              level={level + 1}
              activeSlug={activeSlug}
              roleName={roleName}
            />
          ),
        )}
      </div>
    </div>
  );
}

export function Sidebar({ drawerOpen = false }: { drawerOpen?: boolean }) {
  const activeSlug = slugFromPath(usePathname() || '/');
  const rootRef = useRef<HTMLElement>(null);
  const { marcas, activeMarcaId, adminMode } = useAuth();
  const isAdmin = marcas.some((m) => m.rol.nombre.toLowerCase() === 'admin');
  const roleName = adminMode
    ? (isAdmin ? 'admin' : (marcas[0]?.rol.nombre ?? null))
    : (marcas.find((m) => m.marcaId === activeMarcaId)?.rol.nombre ?? null);
  useFocusTrap(rootRef, drawerOpen, '.ax-marcaswitch__trigger');

  return (
    <aside className="ax-sidebar" role="navigation" aria-label="Primary" ref={rootRef}>
      {/* ===== BRAND ===== */}
      <div className="ax-sidebar__brand">
        <Link className="ax-sidebar__logo" href="/" aria-label="FPTecnologi home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-fptecnologi.svg" alt="FPTecnologi" width={150} style={{ height: 'auto', maxWidth: '100%' }} />
        </Link>
      </div>

      {/* ===== MARCA SWITCHER ===== */}
      <MarcaSwitcher />

      {/* ===== NAV TREE ===== */}
      <nav className="ax-sidebar__nav" role="tree" aria-label="Main menu">
        {sections().map((section) => {
          const groups = groupsInSection(section).filter((g) => g.inMenu && visibleForRole(g, roleName) && (g.id !== 'grp.marca' || !adminMode));
          if (groups.length === 0) return null;
          return (
            <div key={section}>
              <p className="ax-sidebar__section" role="presentation">
                {sectionLabel(section)}
              </p>
              {groups.map((g) => (
                <Group
                  key={g.id}
                  node={g}
                  level={1}
                  activeSlug={activeSlug}
                  roleName={roleName}
                />
              ))}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}

/* ── helpers ── */
function sectionLabel(s: string): string {
  // Manifest sections are upper-case; reference renders them title-ish.
  const map: Record<string, string> = {
    GENERAL: 'General',
    MARCA: 'Marca activa',
    MAIN: 'Principal',
    APPLICATIONS: 'Applications',
    MODULES: 'Modules',
    PAGES: 'Pages',
    'UI & FORMS': 'UI & Forms',
    DOCS: 'Docs',
  };
  return map[s] || s;
}

function subtreeContainsSlug(node: NavNode, slug: string): boolean {
  const kids = manifest.childrenOf(node.id);
  return kids.some((c) => {
    const r = manifest.resolve(c)!;
    if (r.slug === slug) return true;
    return subtreeContainsSlug(c, slug);
  });
}

export default Sidebar;
