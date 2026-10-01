'use client';

import { useState } from 'react';
import Image from 'next/image';
import { CONTACT_INFO, TIENDA_CATEGORIES } from '@/lib/content';

/* Footer propio de Modelo 12 -- el Footer.tsx compartido de Riteflow es
   inglés, marca Riteflow (logo/wordmark grande "Riteflow" al pie) y ese
   componente también lo usan /preview/* (deben quedar intactos). Mismo
   fondo azul oscuro de marca (brand-dark) en vez del navy de la plantilla,
   ancho completo (sin la tarjeta "flotante" bg-blue/rounded-20 del
   original), logo real de FPTecnologi (blanco, para fondo oscuro) en vez
   del isotipo de Riteflow. El botón "suscribirse" no tiene backend de
   correo (ver AGENTS.md) -- al enviar abre WhatsApp con el correo escrito,
   no simula un alta que no ocurre. */
export function FooterSection() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(
      `https://wa.me/51908856286?text=${encodeURIComponent(`Hola, quiero suscribirme con este correo: ${email}`)}`,
      '_blank',
      'noreferrer'
    );
  };

  return (
    <footer className="w-full bg-[#0c2f47] pb-8 pt-16 text-white sm:pt-20">
      <div className="mx-auto w-full max-w-[1440px] px-4 md:px-6 lg:px-12 xl:px-16">
        <div className="flex flex-col items-start justify-between gap-10 border-b border-white/10 pb-12 lg:flex-row">
          <div className="w-full max-w-[320px]">
            <h2 className="text-2xl font-semibold">Suscribite</h2>
            <p className="mt-3 text-white/70">Recibí novedades de stock, marcas y ofertas de FPTecnologi.</p>
            <form onSubmit={handleSubscribe} className="relative mt-5 max-w-[292px]">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="h-[58px] w-full rounded-[10px] border border-white/15 bg-white/10 p-3 pr-20 text-sm font-medium text-white outline-none placeholder:text-white/40"
              />
              <button type="submit" className="button-secondary absolute right-[6px] top-[6px] h-11.5">
                Unirme
              </button>
            </form>
          </div>

          <div className="flex w-full flex-col justify-between gap-8 sm:flex-row lg:max-w-[560px]">
            <div>
              <p className="text-lg font-medium">Tienda</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                {TIENDA_CATEGORIES.map((c) => (
                  <li key={c.slug}>
                    <a href={`/tienda/${c.slug}`} className="text-white/70 transition-colors hover:text-white">
                      {c.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-lg font-medium">Empresa</p>
              <ul className="mt-4 flex flex-col gap-2.5">
                <li><a href="/nosotros" className="text-white/70 transition-colors hover:text-white">Sobre nosotros</a></li>
                <li><a href="/servicios" className="text-white/70 transition-colors hover:text-white">Servicios</a></li>
                <li><a href="/marcas" className="text-white/70 transition-colors hover:text-white">Marcas</a></li>
                <li><a href="#contacto" className="text-white/70 transition-colors hover:text-white">Contacto</a></li>
              </ul>
            </div>
            <div>
              <p className="text-lg font-medium">Contacto</p>
              <ul className="mt-4 flex flex-col gap-2.5 text-white/70">
                <li><a href={`mailto:${CONTACT_INFO.email}`} className="transition-colors hover:text-white">{CONTACT_INFO.email}</a></li>
                <li>{CONTACT_INFO.phoneVentas}</li>
                <li>{CONTACT_INFO.address}</li>
              </ul>
            </div>
          </div>
        </div>

        <p className="pt-6 text-center text-white/60">
          © {new Date().getFullYear()} FP Tecnologi &amp; System. Todos los derechos reservados.
        </p>

        {/* Logo grande, ancho completo -- reemplaza el wordmark "Riteflow"
            que ocupaba todo el ancho al pie del footer original. */}
        <div className="relative mt-8 h-16 w-full sm:h-24 lg:h-28">
          <Image
            src="/images/modelo12/logo-fptecnologi-blanco.png"
            alt="FP Tecnologi & System"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </footer>
  );
}
