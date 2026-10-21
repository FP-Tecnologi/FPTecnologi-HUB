import { useId } from 'react';
import { rutaHexagono } from './rutaHexagono';

type Props = {
  src: string;
  alt: string;
  className?: string;
  orientacion?: 'punta-arriba' | 'punta-lado';
  sizes?: string;
  /** `eager` para fotos sobre el pliegue (hero). */
  carga?: 'lazy' | 'eager';
};

/** Foto recortada en hexágono de vértices redondeados (clipPath SVG en objectBoundingBox).
 *  El recorte va en el contenedor para que la foto pueda hacer zoom al hover sin deformar el marco;
 *  un trazo plata dibuja el borde para que las fotos de producto (fondo blanco) no se pierdan sobre blanco. */
export default function HexImagen({ src, alt, className = '', orientacion = 'punta-arriba', sizes, carga = 'lazy' }: Props) {
  const id = `hex${useId().replace(/[^\w-]/g, '')}`;
  const d = rutaHexagono({ orientacion, radio: 0.08 });
  return (
    <div className={`group/foto relative ${orientacion === 'punta-arriba' ? 'aspect-[1/1.1]' : 'aspect-[1.1/1]'} ${className}`}>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <clipPath id={id} clipPathUnits="objectBoundingBox"><path d={d} /></clipPath>
      </svg>
      <div className="size-full bg-white" style={{ clipPath: `url(#${id})` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} sizes={sizes} loading={carga} className="size-full object-cover transition-transform duration-700 ease-out motion-safe:group-hover/foto:scale-[1.06]" />
      </div>
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 size-full overflow-visible" aria-hidden="true">
        <path d={d} fill="none" stroke="#c9ced2" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  );
}
