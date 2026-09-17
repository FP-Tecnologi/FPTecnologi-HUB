import Image from 'next/image';

export function About10() {
  return (
    <section id="nosotros" className="mx-auto max-w-7xl px-6 py-20">
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className="relative">
          <div className="overflow-hidden rounded-[2rem]">
            <Image src="/images/modelo7/equipo.jpg" alt="Equipo comercial FPTecnologi en reunión" width={900} height={506} className="h-full w-full object-cover" />
          </div>
          <div className="absolute -bottom-6 -right-6 hidden h-28 w-40 overflow-hidden rounded-2xl border-4 border-white shadow-lg sm:block">
            <Image src="/images/modelo7/cat-laptops.jpg" alt="" width={200} height={140} className="h-full w-full object-cover" />
          </div>
        </div>

        <div>
          <span className="text-sm font-semibold uppercase tracking-wide text-brand-primary">Sobre nosotros</span>
          <h2 className="mt-2 font-display text-3xl font-bold text-ink sm:text-4xl">
            Equipamiento TI y soluciones tecnológicas para empresas
          </h2>
          <p className="mt-5 text-base text-ink/60">
            Distribución autorizada de las principales marcas del mercado, con stock local y cotización sin
            compromiso. Un especialista te ayuda a armar la propuesta a medida de tu operación.
          </p>
          <a href="#categorias" className="btn-sweep mt-7 inline-flex rounded-full bg-brand-primary px-7 py-3.5 text-sm font-semibold text-white before:bg-brand-dark">
            Explorar catálogo
          </a>
        </div>
      </div>
    </section>
  );
}
