'use client';

import { useNavLinks } from '@/context/ServiciosContext';

// `darkAccent` -- mismo fondo oscuro que `dark`, pero pensado para el nav
// del Hero (Navbar9): blanco en mayúscula, siempre el mismo color (el
// usuario probó un cambio a celeste en hover y no le gustó cómo se veía) --
// el único indicador de hover es el subrayado (.nav-underline) + un
// aumento leve de tamaño de letra. `dark` a secas sigue igual para
// HeaderDark, que no pidió este cambio.
type Tone = 'light' | 'dark' | 'darkAccent';
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
  // Blanco sólido (antes white/70) -- el usuario pidió que se note más el
  // submenú del Hero (Modelo 5).
  accent: 'text-white hover:bg-brand-primary hover:text-white',
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
  // Sin cambio de color al hover -- solo el subrayado + tamaño de letra
  // marcan el hover (ver className en DesktopNav).
  darkAccent: 'text-white',
};

const MOBILE_TOP_TONE: Record<Tone, string> = {
  light: 'text-ink/80 hover:bg-brand-primary/5',
  dark: 'text-white/85 hover:bg-white/5',
  darkAccent: 'text-white/85 hover:bg-white/5',
};

const MOBILE_CHILD_BORDER_TONE: Record<Tone, string> = {
  light: 'border-black/10',
  dark: 'border-white/15',
  darkAccent: 'border-white/15',
};

const MOBILE_CHILD_LINK_TONE: Record<Tone, string> = {
  light: 'text-ink/60 hover:bg-brand-primary/5 hover:text-brand-700',
  dark: 'text-white/80 hover:bg-white/5 hover:text-white',
  darkAccent: 'text-white/80 hover:bg-white/5 hover:text-white',
};

const MOBILE_CHEVRON_TONE: Record<Tone, string> = {
  light: 'text-ink/65',
  dark: 'text-white/80',
  darkAccent: 'text-white/80',
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
            <a
              href={link.href}
              // Sin subrayado (.nav-underline) cuando tiene submenú -- ya
              // se nota que está "activo" porque se abre el submenú, tener
              // las dos cosas a la vez era redundante. En darkAccent el
              // hover no cambia de color (no gustó el celeste) -- solo el
              // subrayado + un aumento leve de tamaño de letra.
              // Tamaño por vista: tablet horizontal (lg), laptop (xl, 15px =
              // mismo que Cotizar) y pantalla grande (2xl). Debajo de lg este
              // nav no se muestra (va MobileNav).
              className={`flex items-center gap-1 px-3 py-2 font-medium transition-[font-size] duration-200 2xl:px-4 ${hasChildren ? '' : 'nav-underline'} ${TRIGGER_TONE[tone]} ${
                tone === 'darkAccent'
                  ? 'text-[13px] uppercase tracking-wide hover:text-sm xl:text-[15px] xl:hover:text-base 2xl:text-base 2xl:hover:text-[17px]'
                  : 'text-sm 2xl:text-base'
              }`}
            >
              {link.label}
              {hasChildren && <Chevron />}
            </a>

            {hasChildren && (
              <div
                className={`invisible absolute left-0 top-full z-50 w-64 p-2 2xl:w-72 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100 ${DROPDOWN_PANEL[dropdownVariant]}`}
              >
                <ul>
                  {link.children.map((child) => (
                    <li key={child.href}>
                      <a href={child.href} className={`block rounded-lg px-3 py-2 text-sm transition-colors 2xl:text-base ${DROPDOWN_ITEM[dropdownVariant]}`}>
                        {child.label}
                      </a>
                    </li>
                  ))}
                </ul>
                {'viewAllHref' in link && (
                  <a
                    href={link.viewAllHref}
                    className={`mt-1 block rounded-lg px-3 py-2.5 text-sm font-semibold 2xl:text-base ${DROPDOWN_VIEWALL[dropdownVariant]}`}
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
            <a key={link.href} href={link.href} onClick={onNavigate} className={`block rounded-lg px-3 py-2.5 text-sm font-medium md:text-base ${MOBILE_TOP_TONE[tone]}`}>
              {link.label}
            </a>
          );
        }

        return (
          <details key={link.href} className="group">
            <summary className={`flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium md:text-base ${MOBILE_TOP_TONE[tone]}`}>
              <a href={link.href} onClick={onNavigate}>
                {link.label}
              </a>
              <span className={`transition-transform group-open:rotate-180 ${MOBILE_CHEVRON_TONE[tone]}`}>
                <Chevron />
              </span>
            </summary>
            <div className={`ml-3 flex flex-col gap-0.5 border-l pl-3 ${MOBILE_CHILD_BORDER_TONE[tone]}`}>
              {link.children.map((child) => (
                <a key={child.href} href={child.href} onClick={onNavigate} className={`rounded-lg px-3 py-2 text-sm md:text-base ${MOBILE_CHILD_LINK_TONE[tone]}`}>
                  {child.label}
                </a>
              ))}
              {'viewAllHref' in link && (
                <a href={link.viewAllHref} onClick={onNavigate} className={`rounded-lg px-3 py-2 text-sm font-semibold md:text-base ${tone === 'dark' ? 'text-brand-teal-light' : 'text-brand-700'}`}>
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
