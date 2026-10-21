import Link from 'next/link';
import { BookOpen } from 'lucide-react';

/** Acceso visible al Libro de Reclamaciones (pie y inicio). */
export default function LibroBadge({ className = '' }: { className?: string }) {
  return (
    <Link href="/libro-de-reclamaciones" className={`inline-flex items-center gap-3 rounded-xl bg-boton px-4 py-2 text-sm font-semibold text-white hover:bg-rojo-hondo focus-visible:outline-2 focus-visible:outline-offset-2 ${className}`}>
      <span className="rounded-lg bg-white/15 p-1.5"><BookOpen aria-hidden="true" className="h-5 w-5" /></span>
      Libro de Reclamaciones
    </Link>
  );
}
