'use client';

import { useEffect, useState } from 'react';
import { Check, Link2, Mail, Send, Share2 } from 'lucide-react';
import { FacebookIcon, LinkedinIcon, WhatsAppIcon } from '@/components/site/icons';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

/*
 * Compartir el artículo. La vista previa (imagen, título y resumen) la arman las
 * redes leyendo los metadatos Open Graph de la página; aquí solo se arma el texto
 * que acompaña al enlace, con el formato de cada red.
 */
export function CompartirArticulo({ titulo, resumen, url }: { titulo: string; resumen?: string | null; url: string }) {
  const [copiado, setCopiado] = useState(false);
  const [nativo, setNativo] = useState(false);
  useEffect(() => setNativo(typeof navigator !== 'undefined' && 'share' in navigator), []);

  const u = encodeURIComponent(url);
  const t = encodeURIComponent(titulo);
  const r = resumen?.trim() ?? '';
  // WhatsApp: título en negrita, resumen y enlace al final (así WhatsApp muestra la tarjeta grande).
  const textoWhatsapp = `*${titulo}*${r ? `\n\n${r}` : ''}\n\n👉 Léelo aquí: ${url}`;
  const redes = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(textoWhatsapp)}`, Icon: WhatsAppIcon },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, Icon: LinkedinIcon },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, Icon: FacebookIcon },
    { label: 'X', href: `https://x.com/intent/post?text=${t}&url=${u}`, Icon: XIcon },
    { label: 'Telegram', href: `https://t.me/share/url?url=${u}&text=${encodeURIComponent(r ? `${titulo}\n\n${r}` : titulo)}`, Icon: Send },
    {
      label: 'Correo',
      href: `mailto:?subject=${t}&body=${encodeURIComponent(`Te comparto este artículo de FPTecnologi:\n\n${titulo}\n${r ? `${r}\n` : ''}\n${url}`)}`,
      Icon: Mail,
    },
  ];
  const btn =
    'flex h-10 w-10 items-center justify-center rounded-xl border border-brand-dark/10 bg-paper text-brand-dark transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-primary hover:bg-brand-primary hover:text-white';

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg shadow-brand-dark/10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-ink">
        Compartir
        <span className="mt-2 block h-0.5 w-8 rounded-full bg-brand-primary" />
      </p>
      <div className="mt-4 flex flex-wrap gap-2.5">
        {redes.map(({ label, href, Icon }) => (
          <a
            key={label}
            href={href}
            target={label === 'Correo' ? undefined : '_blank'}
            rel="noreferrer"
            aria-label={`Compartir por ${label}`}
            title={label}
            className={btn}
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        ))}
        <button
          type="button"
          aria-label="Copiar enlace"
          title="Copiar enlace"
          className={btn}
          onClick={() => {
            navigator.clipboard?.writeText(url);
            setCopiado(true);
            window.setTimeout(() => setCopiado(false), 1800);
          }}
        >
          {copiado ? <Check className="h-[18px] w-[18px]" strokeWidth={2.2} /> : <Link2 className="h-[18px] w-[18px]" strokeWidth={2} />}
        </button>
      </div>
      {nativo && (
        <button
          type="button"
          onClick={() => navigator.share({ title: titulo, text: r || titulo, url }).catch(() => {})}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark lg:hidden"
        >
          <Share2 className="h-4 w-4" strokeWidth={2} />
          Compartir desde el celular
        </button>
      )}
    </div>
  );
}
