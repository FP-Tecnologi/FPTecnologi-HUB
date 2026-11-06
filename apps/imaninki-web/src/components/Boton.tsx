import type { LucideIcon } from 'lucide-react';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { icono?: LucideIcon; cargando?: boolean; variante?: 'solido' | 'contorno'; size?: 'md' | 'lg' };

/** Botón de acción de los formularios (Libro de Reclamaciones). */
export default function Boton({ icono: Icono, cargando, variante = 'solido', size = 'md', className = '', children, type = 'button', ...resto }: Props) {
  const estilo = variante === 'solido' ? 'bg-rojo text-white shadow-lg shadow-rojo-hondo/30 hover:bg-rojo-hondo' : 'bg-rojo/10 text-rojo-hondo hover:bg-rojo/20';
  return (
    <button type={type} className={`boton inline-flex items-center justify-center gap-2 rounded-md px-6 font-semibold disabled:opacity-70 ${size === 'lg' ? 'h-13' : 'h-12'} ${estilo} ${className}`} {...resto}>
      {Icono && <Icono aria-hidden="true" size={18} className={cargando ? 'animate-spin' : undefined} />}{children}
    </button>
  );
}
