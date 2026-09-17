'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
    <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    <path d="M5 20c1.2-3.5 4-5.2 7-5.2s5.8 1.7 7 5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

/* 4 marcadores de posición -- ni nombres ni frases inventadas, solo para
   mostrar la forma del carrusel. Cuando haya reseñas reales de Google
   entran acá con los mismos 3 campos (texto, nombre, cargo/empresa). */
const PLACEHOLDERS = [
  { avatarBg: 'bg-brand-primary/12 text-brand-primary' },
  { avatarBg: 'bg-brand-teal/12 text-brand-teal' },
  { avatarBg: 'bg-amber-500/12 text-amber-600' },
  { avatarBg: 'bg-brand-dark/12 text-brand-dark' },
];

/*
 * "Otro modelo de testimonio, dinámico" -- pedido aparte del diseño
 * original de Riteflow (13.1): un carrusel horizontal (Swiper, ya
 * instalado en el proyecto para Modelo 12/Riteflow) con el orden invertido
 * respecto al original -- texto de la reseña ARRIBA, avatar + nombre +
 * cargo/empresa ABAJO -- y avatar genérico (ícono, no foto) en vez de
 * inventar la cara de alguien que no existe.
 */
export function TestimonialCarouselDemo() {
  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={20}
        slidesPerView={1.1}
        breakpoints={{ 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
        autoplay={{ delay: 2800, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop
        navigation={{ prevEl: '.tcd-prev', nextEl: '.tcd-next' }}
        className="!overflow-visible"
      >
        {PLACEHOLDERS.map((t, i) => (
          <SwiperSlide key={i}>
            <div className="flex h-full flex-col rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <p className="flex-1 text-sm text-ink/70">
                Texto real de la reseña, tal cual quedó publicada en Google — sin editar el contenido.
              </p>
              <div className="my-4 h-px w-full bg-black/5" />
              <div className="flex items-center gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${t.avatarBg}`}>
                  <UserIcon />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">Nombre del cliente</p>
                  <p className="truncate text-xs text-ink/45">Cargo / empresa</p>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="mt-5 flex justify-center gap-2">
        <button type="button" className="tcd-prev flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-ink/60 transition-colors hover:border-brand-primary hover:text-brand-primary" aria-label="Anterior">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        <button type="button" className="tcd-next flex h-9 w-9 items-center justify-center rounded-full border border-black/10 text-ink/60 transition-colors hover:border-brand-primary hover:text-brand-primary" aria-label="Siguiente">
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4"><path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
      </div>
    </div>
  );
}
