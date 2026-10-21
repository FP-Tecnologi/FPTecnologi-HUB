import { MessageCircle } from 'lucide-react';
import { waUrl } from '@/lib/contacto';

export default function WhatsAppFlotante() {
  return (
    <a
      href={waUrl('Hola Fimav Perú, quisiera información.')}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribir por WhatsApp"
      className="print:hidden fixed bottom-5 right-5 z-50 rounded-full bg-boton p-4 text-white shadow-lg focus-visible:outline-white focus-visible:outline-offset-2"
    >
      <MessageCircle size={28} />
    </a>
  );
}
