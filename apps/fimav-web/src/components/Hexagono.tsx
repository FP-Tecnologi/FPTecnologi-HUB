import type { LucideIcon } from 'lucide-react';
import { rutaHexagono } from './hex/rutaHexagono';

const HEX = rutaHexagono({ orientacion: 'punta-arriba', radio: 0.1 });

export default function Hexagono({ icono: Icono, tam = 64 }: { icono: LucideIcon; tam?: number }) {
  return (
    <span className="relative inline-grid place-items-center" style={{ width: tam, height: tam }}>
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="absolute left-[6%] top-0 h-full w-[88%]" aria-hidden="true">
        <path d={HEX} fill="#e02424" />
      </svg>
      <Icono className="relative text-white" size={tam * 0.42} strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}
