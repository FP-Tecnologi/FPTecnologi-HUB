import { useId } from 'react';
import { rutaHexagono } from './rutaHexagono';

type Props = { src: string; alt: string; className?: string; orientacion?: 'punta-arriba' | 'punta-lado'; sizes?: string };

/** Foto recortada en hexágono de vértices redondeados (clipPath SVG en objectBoundingBox). */
export default function HexImagen({ src, alt, className = '', orientacion = 'punta-arriba', sizes }: Props) {
  const id = `hex${useId().replace(/[^\w-]/g, '')}`;
  return (
    <div className={`relative ${orientacion === 'punta-arriba' ? 'aspect-[1/1.1]' : 'aspect-[1.1/1]'} ${className}`}>
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <clipPath id={id} clipPathUnits="objectBoundingBox"><path d={rutaHexagono({ orientacion, radio: 0.08 })} /></clipPath>
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} sizes={sizes} loading="lazy" className="size-full object-cover" style={{ clipPath: `url(#${id})` }} />
    </div>
  );
}
