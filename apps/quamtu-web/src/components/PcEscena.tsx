'use client';
import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';

// three.js solo en el cliente (no SSR).
const PcScene = dynamic(() => import('./PcScene'), { ssr: false });
export default function PcEscena(props: ComponentProps<typeof PcScene>) {
  return <PcScene {...props} />;
}
