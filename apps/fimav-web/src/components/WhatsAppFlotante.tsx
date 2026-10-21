import { MessageCircle } from 'lucide-react';
import { rutaHexagono } from './hex/rutaHexagono';
import { waUrl } from '@/lib/contacto';

const HEX = rutaHexagono({ orientacion: 'punta-arriba', radio: 0.12 });
const capa = (cls: string) => (
  <span aria-hidden="true" className={`pointer-events-none absolute -z-10 ${cls}`}>
    <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="block size-full"><path d={HEX} fill="currentColor" /></svg>
  </span>
);

export default function WhatsAppFlotante() {
  return (
    <a
      href={waUrl('Hola Fimav Perú, quisiera información.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="group print:hidden fixed bottom-5 right-5 z-50 isolate grid h-16 w-14 place-items-center text-white drop-shadow-lg focus-visible:outline-hidden"
    >
      {capa('-inset-[5px] text-tinta opacity-0 group-focus-visible:opacity-100')}
      {capa('-inset-[3px] text-white opacity-0 group-focus-visible:opacity-100')}
      {capa('inset-0 text-boton transition-colors group-hover:text-rojo-hondo')}
      <MessageCircle size={26} aria-hidden="true" />
    </a>
  );
}
