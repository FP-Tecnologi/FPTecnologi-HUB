import { BookOpen } from 'lucide-react';
import BotonHex from './hex/BotonHex';

/** Acceso visible al Libro de Reclamaciones (pie y inicio). */
export default function LibroBadge() {
  return (
    <BotonHex href="/libro-de-reclamaciones" className="text-sm">
      <BookOpen aria-hidden="true" className="h-5 w-5" /> Libro de Reclamaciones
    </BotonHex>
  );
}
