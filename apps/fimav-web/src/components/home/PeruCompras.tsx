import { contenido } from '@/lib/contenido';

export default function PeruCompras() {
  return (
    <section className="bg-boton py-14 text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 sm:px-6 md:grid-cols-[1fr_auto]">
        <div>
          <h2 className="text-2xl font-medium sm:text-3xl">Sector Estatal</h2>
          <p className="mt-3 leading-relaxed text-white">{contenido.perucompras}</p>
        </div>
        <p className="rounded-xl border-2 border-white px-6 py-4 text-center text-xl font-bold tracking-widest">PERÚ COMPRAS</p>
      </div>
    </section>
  );
}
