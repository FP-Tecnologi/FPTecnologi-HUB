import Image from 'next/image';

const STEPS = [
  { n: '1', title: 'Contanos qué necesitás', text: 'Elegí tu rubro y contanos el equipamiento que buscás.' },
  { n: '2', title: 'Compará opciones', text: 'Un especialista te arma una propuesta con marcas y precios reales.' },
  { n: '3', title: 'Elegí tu equipo', text: 'Cotización sin compromiso, vos decidís cuándo avanzar.' },
  { n: '4', title: 'Recibí con garantía', text: 'Stock local, distribución autorizada y soporte post-venta.' },
];

export function Steps10() {
  return (
    <section className="bg-paper px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="font-display text-3xl font-bold text-ink sm:text-4xl">Encontrá tu equipo ideal en minutos</h2>
        <p className="mt-2 max-w-xl text-sm text-ink/60">
          Catálogo curado, comparación de marcas y una cotización real armada por un especialista — sin trámites eternos.
        </p>

        <div className="mt-12 grid items-center gap-10 lg:grid-cols-2">
          <ol className="flex flex-col gap-6">
            {STEPS.map((s) => (
              <li key={s.n} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-primary text-sm font-bold text-white">{s.n}</span>
                <div>
                  <p className="font-semibold text-ink">{s.title}</p>
                  <p className="mt-0.5 text-sm text-ink/60">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="overflow-hidden rounded-[2rem]">
            <Image src="/images/modelo7/cat-pantallas.jpg" alt="Pantallas y monitores FPTecnologi" width={900} height={600} className="h-full w-full object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
