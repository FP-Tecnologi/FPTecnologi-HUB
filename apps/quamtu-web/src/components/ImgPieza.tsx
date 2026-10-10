'use client';
import { useState } from 'react';
import FotoPieza from './FotoPieza';
import type { Cat } from '@/lib/piezas';

// Foto del producto: /productos/<id>.jpg. Sin archivo, ícono de la categoría.
export default function ImgPieza({ id, cat, color, className = '', ajuste = 'contain' }: { id: string; cat: Cat; color: string; className?: string; ajuste?: 'contain' | 'cover' }) {
  const [fallo, setFallo] = useState(false);
  if (fallo) return <FotoPieza cat={cat} color={color} className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/productos/${id}.jpg`} alt="" onError={() => setFallo(true)} className={`${className} ${ajuste === 'cover' ? 'object-cover' : 'object-contain'}`} />
  );
}
