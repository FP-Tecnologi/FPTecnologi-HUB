/*
 * Vireo Next.js — (app) route-group layout.
 *
 * The 13 standalone full-screen apps (apps/**) live in this group. They render
 * WITHOUT the dashboard shell — no sidebar, no dashboard header, no footer, no
 * breadcrumb, no page <h1> — inside the client <AppLayout>: a slim .ax-appbar
 * plus <main class="ax-appmain">, with the customizer + ⌘K palette still wired.
 *
 * The group name is parenthesised, so it does NOT appear in the URL:
 * app/(app)/apps/email/page.tsx still serves "/apps/email".
 *
 * Every other route stays in (shell) — do not move a dashboard page here.
 */
import type { ReactNode } from 'react';
import { AppLayout } from '../../src/components/shell/AppLayout';

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
