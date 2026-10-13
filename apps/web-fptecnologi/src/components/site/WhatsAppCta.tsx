'use client';

import { MoreInfoButton } from '@/components/home/MoreInfoButton';
import { whatsappHref } from '@/lib/chatActions';

/** Botón sweep que abre WhatsApp en otra pestaña (única excepción a "no abrir pestañas", DESIGN.md §4). */
export function WhatsAppCta({
  label = 'WhatsApp',
  texto,
  tone = 'dark',
  className,
}: {
  label?: string;
  texto?: string;
  tone?: 'light' | 'dark';
  className?: string;
}) {
  return <MoreInfoButton tone={tone} label={label} className={className} onClick={() => window.open(whatsappHref(texto), '_blank', 'noreferrer')} />;
}
