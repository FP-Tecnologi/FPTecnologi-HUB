import { Award, CalendarCheck, LayoutGrid } from 'lucide-react';
import Hexagono from '@/components/Hexagono';
import Carrusel from '@/components/slider/Carrusel';
import { categorias } from '@/lib/categorias';

// Datos del brochure, sin adornos.
const datos = [
  { icono: CalendarCheck, cifra: 'Más de 10 años', linea: 'en el mercado Corporativo/Gobierno' },
  { icono: Award, cifra: 'Primeros puestos', linea: 'en el ranking comercial de gobierno en Perú Compras' },
  { icono: LayoutGrid, cifra: `${categorias.length} categorías`, linea: 'de bienes y servicios' },
];

export default function DatosConfianza() {
  return (
    <section className="bg-white pb-10 pt-2">
      <Carrusel
        etiqueta="Fimav Perú en datos"
        auto={8000}
        controles="lg:hidden"
        ancho="basis-[85%] sm:basis-[calc((100%-1rem)/2)] lg:basis-[calc((100%-2rem)/3)]"
        gap="gap-4"
        className="mx-auto max-w-6xl px-4 sm:px-6"
        diapositivas={datos.map((d) => (
          <div key={d.cifra} className="flex h-full items-center gap-4 rounded-2xl bg-gris px-5 py-4">
            <Hexagono icono={d.icono} tam={56} />
            <div>
              <p className="font-display text-2xl font-bold uppercase leading-none tracking-wide text-carbon">{d.cifra}</p>
              <p className="mt-1 text-sm leading-snug text-carbon/80">{d.linea}</p>
            </div>
          </div>
        ))}
      />
    </section>
  );
}
