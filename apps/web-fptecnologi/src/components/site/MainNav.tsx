'use client';

import { useNavLinks } from '@/context/ServiciosContext';

type Tone = 'light' | 'dark';
type DropdownVariant = 'default' | 'dark' | 'sharp' | 'minimal' | 'accent' | 'glass';

const DROPDOWN_PANEL: Record<DropdownVariant, string> = {
  default: 'rounded-xl border border-black/5 bg-white shadow-xl shadow-black/10',
  dark: 'rounded-xl border border-white/10 bg-brand-primary shadow-2xl shadow-black/50',
  sharp: 'rounded-lg border-x border-b border-black/5 border-t-2 border-t-brand-primary bg-white shadow-xl shadow-black/10',
  minimal: 'rounded-none border-0 border-t-2 border-t-ink/10 bg-white shadow-lg shadow-black/5',
  accent: 'rounded-xl border-x border-b border-white/10 border-t-2 border-t-brand-primary bg-brand-primary shadow-2xl shadow-black/50',
  glass: 'rounded-2xl border border-white/50 bg-white/80 shadow-xl shadow-black/10 backdrop-blur-md',
};

const DROPDOWN_ITEM: Record<DropdownVariant, string> = {
  default: 'text-ink/75 hover:bg-brand-primary/5 hover:text-brand-700',
  dark: 'text-white/70 hover:bg-white/10 hover:text-white',
  sharp: 'text-ink/75 hover:bg-brand-primary hover:text-white',
  minimal: 'text-ink/70 hover:text-brand-700',
  accent: 'text-white/70 hover:bg-brand-primary hover:text-white',
  glass: 'text-ink/80 hover:bg-white/70 hover:text-brand-700',
};

const DROPDOWN_VIEWALL: Record<DropdownVariant, string> = {
  default: 'border-t border-black/5 text-brand-700 hover:bg-brand-primary/5',
  dark: 'border-t border-white/10 text-brand-teal-light hover:bg-white/5',
  sharp: 'border-t border-black/5 text-brand-700 hover:bg-brand-primary/5',
  minimal: 'border-t border-black/5 text-brand-700 hover:bg-transparent',
  accent: 'border-t border-white/10 text-brand-teal-light hover:bg-brand-primary hover:text-white',
  glass: 'border-t border-white/40 text-brand-700 hover:bg-white/40',
};

const TRIGGER_TONE: Record<Tone, string> = {
  light: 'text-ink/70 hover:text-brand-700',
  dark: 'text-white/85 hover:text-white',
};

const MOBILE_TOP_TONE: Record<Tone, string> = {
  light: 'text-ink/80 hover:bg-brand-primary/5',
  dark: 'text-white/85 hover:bg-white/5',
};

const MOBILE_CHILD_BORDER_TONE: Record<Tone, string> = {
  light: 'border-black/10',
  dark: 'border-white/15',
};

const MOBILE_CHILD_LINK_TONE: Record<Tone, string> = {
  light: 'text-ink/60 hover:bg-brand-primary/5 hover:text-brand-700',
  dark: 'text-white/60 hover:bg-white/5 hover:text-white',
};

const MOBILE_CHEVRON_TONE: Record<Tone, string> = {
  light: 'text-ink/40',
  dark: 'text-white/40',
};

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:rotate-180">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Nav de escritorio — items con `children` abren un submenú real al hover,
 * no un placeholder: cada link va a su página (hoy en blanco, sirve para
 * navegar el sitemap completo). `dropdownVariant` da a cada modelo su propio
 * estilo de submenú (no todos comparten la misma tarjeta blanca genérica). */
export function DesktopNav({ tone = 'light', dropdownVariant = 'default' }: { tone?: Tone; dropdownVariant?: DropdownVariant }) {
  const links = useNavLinks();
  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {links.map((link) => {
        const hasChildren = 'children' in link && link.children.length > 0;
        return (
          <div key={link.href} className={hasChildren ? 'group relative' : ''}>
            <a href={link.href} className={`nav-underline flex items-center gap-1 px-3 py-2 text-sm font-medium ${TRIGGER_TONE[tone]}`}>
              {link.label}
              {hasChildren && <Chevron />}
            </a>

            {hasChildren && (
              <div
                className={`invisible absolute left-0 top-full z-50 w-64 p-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 ${DROPDOWN_PANEL[dropdownVariant]}`}
              >
                <ul>
                  {link.children.map((child) => (
                    <li key={child.href}>
                      <a href={child.href} className={`block rounded-lg px-3 py-2 text-sm transition-colors ${DROPDOWN_ITEM[dropdownVariant]}`}>
                        {child.label}
                      </a>
                    </li>
                  ))}
                </ul>
                {'viewAllHref' in link && (
                  <a
                    href={link.viewAllHref}
                    className={`mt-1 block rounded-lg px-3 py-2.5 text-sm font-semibold ${DROPDOWN_VIEWALL[dropdownVariant]}`}
                  >
                    {link.viewAllLabel} →
                  </a>
                )}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

/** Nav de mobile — acordeón simple: tocar el label expande los hijos in-place. */
export function MobileNav({ tone = 'light', onNavigate }: { tone?: Tone; onNavigate?: () => void }) {
  const links = useNavLinks();
  return (
    <nav className="flex flex-col gap-1">
      {links.map((link) => {
        const hasChildren = 'children' in link && link.children.length > 0;

        if (!hasChildren) {
          return (
            <a key={link.href} href={link.href} onClick={onNavigate} className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${MOBILE_TOP_TONE[tone]}`}>
              {link.label}
            </a>
          );
        }

        return (
          <details key={link.href} className="group">
            <summary className={`flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium ${MOBILE_TOP_TONE[tone]}`}>
              <a href={link.href} onClick={onNavigate}>
                {link.label}
              </a>
              <span className={`transition-transform group-open:rotate-180 ${MOBILE_CHEVRON_TONE[tone]}`}>
                <Chevron />
              </span>
            </summary>
            <div className={`ml-3 flex flex-col gap-0.5 border-l pl-3 ${MOBILE_CHILD_BORDER_TONE[tone]}`}>
              {link.children.map((child) => (
                <a key={child.href} href={child.href} onClick={onNavigate} className={`rounded-lg px-3 py-2 text-sm ${MOBILE_CHILD_LINK_TONE[tone]}`}>
                  {child.label}
                </a>
              ))}
              {'viewAllHref' in link && (
                <a href={link.viewAllHref} onClick={onNavigate} className={`rounded-lg px-3 py-2 text-sm font-semibold ${tone === 'dark' ? 'text-brand-teal-light' : 'text-brand-700'}`}>
                  {link.viewAllLabel} →
                </a>
              )}
            </div>
          </details>
        );
      })}
    </nav>
  );
}
