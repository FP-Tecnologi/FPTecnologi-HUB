import { Forma } from '@/components/hex/BotonHex';

/** Marco hexagonal (mismo contorno que los botones de la web) para un campo de formulario: el control va dentro, sin borde propio.
 *  `rojo`: borde rojo para los desplegables, así se distinguen del buscador (borde oscuro). */
export default function CampoHex({ children, className = '', rojo = false }: { children: React.ReactNode; className?: string; rojo?: boolean }) {
  return (
    <span className={`group/campo relative isolate flex min-h-11 items-center px-7 ${className}`}>
      <Forma className={`inset-0 ${rojo ? 'text-rojo-hondo group-focus-within/campo:text-boton' : 'text-carbon group-focus-within/campo:text-rojo-hondo'}`} />
      <Forma className="inset-[2px] text-white" />
      {children}
    </span>
  );
}
