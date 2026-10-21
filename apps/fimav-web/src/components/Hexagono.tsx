import type { LucideIcon } from 'lucide-react';

export default function Hexagono({ icono: Icono, tam = 64 }: { icono: LucideIcon; tam?: number }) {
  return (
    <span className="relative inline-grid place-items-center" style={{ width: tam, height: tam }}>
      <svg viewBox="0 0 100 100" className="absolute inset-0" aria-hidden="true">
        <path d="M50 4 90 27v46L50 96 10 73V27z" fill="#e02424" stroke="#e02424" strokeWidth="8" strokeLinejoin="round" />
      </svg>
      <Icono className="relative text-white" size={tam * 0.42} strokeWidth={1.8} aria-hidden="true" />
    </span>
  );
}
