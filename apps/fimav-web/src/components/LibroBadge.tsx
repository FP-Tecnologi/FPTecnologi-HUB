import { BookOpen } from 'lucide-react';
import BotonHex from './hex/BotonHex';

/** Acceso visible al Libro de Reclamaciones (pie). */
export default function LibroBadge() {
  return (
    <BotonHex href="/libro-de-reclamaciones" icono={BookOpen} className="text-sm">
      Libro de Reclamaciones
    </BotonHex>
  );
}
