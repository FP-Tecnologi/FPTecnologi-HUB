'use client';

import { useEffect, useState } from 'react';
import { Check, Link2 } from 'lucide-react';
import { FacebookIcon, LinkedinIcon, WhatsAppIcon } from '@/components/site/icons';

/* Compartir el artículo: WhatsApp, LinkedIn, Facebook y copiar enlace. */
export function CompartirArticulo({ titulo }: { titulo: string }) {
  const [copiado, setCopiado] = useState(false);
  // La URL se lee recién en el navegador (evita diferencias con el HTML del servidor).
  const [url, setUrl] = useState('');
  useEffect(() => setUrl(window.location.href), []);
  const u = encodeURIComponent(url);
  const redes = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${titulo} ${url}`)}`, Icon: WhatsAppIcon },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: LinkedinIcon },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: FacebookIcon },
  ];
  const btn =
    'flex h-10 w-10 items-center justify-center rounded-xl border border-brand-dark/10 bg-paper text-brand-dark transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary hover:bg-brand-primary hover:text-white';

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg shadow-brand-dark/10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink">
        Compartir
        <span className="mt-2 block h-0.5 w-8 rounded-full bg-brand-primary" />
      </p>
      <div className="mt-4 flex gap-2.5">
        {redes.map(({ label, href, Icon }) => (
          <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={`Compartir en ${label}`} title={label} className={btn}>
            <Icon className="h-[18px] w-[18px]" />
          </a>
        ))}
        <button
          type="button"
          aria-label="Copiar enlace"
          title="Copiar enlace"
          className={btn}
          onClick={() => {
            navigator.clipboard?.writeText(window.location.href);
            setCopiado(true);
            window.setTimeout(() => setCopiado(false), 1800);
          }}
        >
          {copiado ? <Check className="h-[18px] w-[18px]" strokeWidth={2.2} /> : <Link2 className="h-[18px] w-[18px]" strokeWidth={2} />}
        </button>
      </div>
    </div>
  );
}
