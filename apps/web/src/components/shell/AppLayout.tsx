'use client';
/*
 * Vireo Next.js — FULL-SCREEN APP LAYOUT (client component).
 *
 * The chrome for the 13 standalone app routes under app/(app)/apps/**. These
 * pages are NOT dashboard pages: no sidebar, no dashboard header, no footer, no
 * breadcrumb, no <h1>. They own the whole viewport the way a real mail/chat/
 * board client does, and each app scrolls inside its own panes.
 *
 * Reproduces the reference body structure (src/html/apps/*.html + appshell.css):
 *
 *   <body class="ax-app-body">          ← locks document scroll (overflow:hidden)
 *     {loader}
 *     <div class="ax-ambient"><i></i></div>
 *     <div class="ax-applayout">
 *       <header class="ax-appbar">…</header>
 *       <main class="ax-appmain" id="ax-main">{page}</main>
 *     </div>
 *     {customizer}{command palette}
 *
 * BODY CLASS LIFECYCLE — the <body> tag lives in the ROOT layout, shared with
 * every dashboard page, so `ax-app-body` can never be hard-coded there: it sets
 * overflow:hidden and would kill scrolling site-wide. This layout adds it on
 * mount and REMOVES it on unmount, so navigating Email → a dashboard restores
 * document scrolling, and dashboard → Email locks it again.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AppBar } from './AppBar';
import { Loader } from './Loader';
import { Customizer } from './Customizer';
import { CommandPalette } from './CommandPalette';
import { slugFromPath } from '../../lib/manifest';

export function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() || '/';
  const [commandOpen, setCommandOpen] = useState(false);
  const [customizerOpen, setCustomizerOpen] = useState(false);

  // Lock document scroll for as long as an app route is mounted — and only then.
  useEffect(() => {
    document.body.classList.add('ax-app-body');
    return () => document.body.classList.remove('ax-app-body');
  }, []);

  // Keep <html data-ax-route> aligned with the active route (parity with the shell).
  useEffect(() => {
    document.documentElement.setAttribute('data-ax-route', slugFromPath(pathname));
  }, [pathname]);

  // Global ⌘K / Ctrl+K opens the command palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <Loader />
      <div className="ax-ambient" aria-hidden="true"><i></i></div>
      <div className="ax-applayout">
        <AppBar onCommand={() => setCommandOpen(true)} onCustomizer={() => setCustomizerOpen(true)} />
        <main className="ax-appmain" id="ax-main">
          {children}
        </main>
      </div>
      <Customizer open={customizerOpen} onClose={() => setCustomizerOpen(false)} />
      <CommandPalette
        open={commandOpen}
        onClose={() => setCommandOpen(false)}
        onCustomizer={() => setCustomizerOpen(true)}
      />
    </>
  );
}

export default AppLayout;
