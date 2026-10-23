'use client';
import { usePathname } from 'next/navigation';
import { FileText } from 'lucide-react';
import { rutaHexagono } from '@/components/hex/rutaHexagono';
import Reveal from '@/components/motion/Reveal';
import SeccionTitulo from '@/components/SeccionTitulo';
import BotonHex from '@/components/hex/BotonHex';
import type { CmsContenido } from '@/lib/cms';

const HEX = rutaHexagono({ orientacion: 'punta-arriba', radio: 0.12 });

/** CTA de cotización: es el tramo superior del pie (un solo bloque carbón). En /cotizar no se muestra (ya estás ahí). */
export default function CtaCotizar({ datos: d }: { datos: CmsContenido['ajustes']['cta'] }) {
  if (usePathname() === '/cotizar') return null;
  return (
    <>
      <Reveal className="mx-auto flex max-w-6xl flex-col items-start gap-8 px-4 pb-4 pt-6 sm:px-6 md:flex-row md:items-center md:justify-between">
        <SeccionTitulo nivel="h2" claroSobreOscuro eyebrow={d.eyebrow} claro={d.claro} rojo={d.rojo} />
        <BotonHex href="/cotizar" size="lg" icono={FileText} rotulo>{d.boton}</BotonHex>
      </Reveal>
      <div aria-hidden="true" className="mx-auto my-10 flex max-w-6xl items-center gap-4 px-4 sm:px-6">
        <span className="h-px flex-1 bg-white/20" />
        <svg viewBox="0 0 1 1" className="size-6 shrink-0"><path d={HEX} fill="none" stroke="var(--color-rojo)" strokeWidth="2" vectorEffect="non-scaling-stroke" /></svg>
        <span className="h-px flex-1 bg-white/20" />
      </div>
    </>
  );
}
