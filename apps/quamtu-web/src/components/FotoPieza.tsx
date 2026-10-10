import { Box, CircuitBoard, Cpu, Fan, HardDrive, MemoryStick, PlugZap, Zap } from 'lucide-react';
import type { Cat } from '@/lib/piezas';

const ICONOS = { gabinete: Box, cpu: Cpu, placa: CircuitBoard, ram: MemoryStick, gpu: Zap, ssd: HardDrive, cooler: Fan, fuente: PlugZap };

// Marcador de foto: se reemplaza por la imagen real del producto cuando venga de la API del HUB.
export default function FotoPieza({ cat, color, className = '' }: { cat: Cat; color: string; className?: string }) {
  const Icono = ICONOS[cat];
  return (
    <div className={`relative grid place-items-center overflow-hidden bg-gradient-to-br from-panel to-bg ${className}`}>
      <div className="rejilla absolute inset-0 opacity-70" />
      <div className="absolute h-2/3 w-2/3 rounded-full blur-3xl" style={{ background: color, opacity: 0.25 }} />
      <Icono className="relative" size={72} strokeWidth={1.2} style={{ color }} />
    </div>
  );
}
