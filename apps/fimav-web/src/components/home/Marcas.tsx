import { contenido } from '@/lib/contenido';

export default function Marcas() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-rojo">Marcas aliadas</h2>
        <ul className="mt-6 flex flex-wrap justify-center gap-x-10 gap-y-4 text-2xl font-semibold text-carbon/70">
          {contenido.marcas.map((m) => <li key={m}>{m}</li>)}
        </ul>
      </div>
    </section>
  );
}
