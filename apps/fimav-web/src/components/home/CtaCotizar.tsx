'use client';
import { usePathname } from 'next/navigation';
import { FileText } from 'lucide-react';
import Reveal from '@/components/motion/Reveal';
import SeccionTitulo from '@/components/SeccionTitulo';
import BotonHex from '@/components/hex/BotonHex';

/** CTA de cotización: es el tramo superior del pie (un solo bloque carbón). En /cotizar no se muestra (ya estás ahí). */
export default function CtaCotizar() {
  if (usePathname() === '/cotizar') return null;
  return (
    <Reveal className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 pb-4 pt-6 sm:px-6 md:flex-row md:items-center md:justify-between">
      <SeccionTitulo nivel="h2" claroSobreOscuro claro="Cotiza con" rojo="Fimav Perú" subtitulo="Cuéntanos qué necesitas y te respondemos con una propuesta" />
      <BotonHex href="/cotizar" size="lg" icono={FileText} className="font-display font-bold uppercase tracking-widest">Cotizar ahora</BotonHex>
    </Reveal>
  );
}
