import Image from 'next/image';

export function Hero10() {
  return (
    <section id="inicio" className="relative flex min-h-[560px] items-center overflow-hidden bg-ink text-white lg:min-h-[640px]">
      <Image
        src="/images/modelo7/rendimiento.jpg"
        alt="Infraestructura de red — FPTecnologi"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/25" />

      <div className="relative mx-auto w-full max-w-7xl px-6 py-20">
        <div className="max-w-lg">
          <h1 className="font-display text-4xl font-bold leading-[1.1] sm:text-5xl">
            La plataforma definitiva para modernizar tu empresa
          </h1>
          <p className="mt-5 text-base text-white/70 sm:text-lg">
            Gestioná tu equipamiento TI, cotizá con stock local y accedé a distribución autorizada de las
            principales marcas del mercado.
          </p>
          <a href="#categorias" className="btn-sweep mt-7 inline-flex rounded-full bg-brand-primary px-7 py-3.5 text-sm font-semibold text-white before:bg-brand-dark">
            Explorar catálogo
          </a>
        </div>
      </div>
    </section>
  );
}
