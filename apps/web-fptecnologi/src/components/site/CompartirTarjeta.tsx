'use client';

import { useState } from 'react';
import { Check, Share2 } from 'lucide-react';

/* Compartir la tarjeta: menú nativo del celular (WhatsApp, correo…) o, si no existe, copiar el enlace. */
export function CompartirTarjeta({ url, nombre, className }: { url: string; nombre: string; className: string }) {
  const [copiado, setCopiado] = useState(false);
  async function compartir() {
    // El enlace es el de la página abierta (el dominio real donde se está viendo), no uno configurado en otro lado.
    // En la vista previa del dashboard (/tarjeta/vista-previa) se usa el enlace de la tarjeta.
    const aqui = typeof window !== 'undefined' && !window.location.pathname.startsWith('/tarjeta/vista-previa') ? `${window.location.origin}${window.location.pathname}` : url;
    try {
      if (navigator.share) return await navigator.share({ title: nombre, text: `Tarjeta digital de ${nombre}`, url: aqui });
      await navigator.clipboard.writeText(aqui);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      /* el usuario cerró el menú de compartir */
    }
  }
  return (
    <button type="button" onClick={compartir} className={className}>
      {copiado ? <Check className="h-[18px] w-[18px]" strokeWidth={2} /> : <Share2 className="h-[18px] w-[18px]" strokeWidth={2} />}
      {copiado ? 'Enlace copiado' : 'Compartir'}
    </button>
  );
}
