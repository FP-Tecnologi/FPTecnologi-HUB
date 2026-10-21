import Espiral from '@/components/Espiral';
import Titulo from '@/components/Titulo';
import BotonHex, { Forma } from '@/components/hex/BotonHex';
import HexImagen from '@/components/hex/HexImagen';
import Parallax from '@/components/motion/Parallax';
import { categorias } from '@/lib/categorias';
import { contenido } from '@/lib/contenido';

const retraso = (ms: number, extra: Record<string, string> = {}) => ({ '--retraso': `${ms}ms`, ...extra }) as React.CSSProperties;

// Datos del brochure, sin adornos.
const chips = ['Más de 10 años', 'Primeros puestos en el ranking de gobierno en Perú Compras', `${categorias.length} categorías`];

// Fotos que orbitan la espiral: posición, profundidad del parallax (px, negativo = sentido contrario) y ritmo del flote.
const orbitas = [
  { src: '/fotos/escritorios-2.jpg', alt: 'Notebook', pos: 'left-[-3%] top-[2%] w-[31%]', prof: '28px', dur: '7s', ms: 500, movil: true },
  { src: '/fotos/impresoras-2.jpg', alt: 'Impresora multifuncional', pos: 'bottom-[0%] right-[-2%] w-[33%]', prof: '-22px', dur: '8.5s', ms: 650, movil: false },
];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white">
      <Espiral contorno className="aparecer pointer-events-none absolute -bottom-32 -left-28 w-56 opacity-40 sm:-bottom-24 sm:-left-24 sm:opacity-60" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-4 lg:py-20">
        <div>
          {/* Título visible desde el primer pintado: la entrada es solo CSS, no depende de JS. */}
          <Titulo nivel="h1" palabras claro={contenido.hero.linea1} rojo={contenido.hero.linea2} className="max-w-xl text-4xl sm:text-5xl lg:text-6xl" />
          <p className="entrada mt-5 max-w-md text-carbon/80 sm:mt-6 sm:text-lg" style={retraso(420)}>
            Organización comercial especializada en el sector Corporativo y Gobierno, con el respaldo de las marcas más representativas del segmento tecnológico.
          </p>
          <div className="entrada mt-8 flex flex-wrap gap-4" style={retraso(520)}>
            <BotonHex href="/cotizar" size="lg">Solicitar cotización</BotonHex>
            <BotonHex href="/catalogo" size="lg" variante="contorno">Ver catálogo</BotonHex>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2.5" aria-label="Fimav Perú en datos">
            {chips.map((c, i) => (
              <li key={c} className="entrada relative isolate inline-flex min-h-8 items-center px-5 py-1 text-sm font-medium text-carbon" style={retraso(640 + i * 90)}>
                <Forma className="inset-0 text-gris" />
                {c}
              </li>
            ))}
          </ul>
        </div>

        <Parallax className="relative mx-auto aspect-square w-full max-w-[300px] sm:max-w-[440px] lg:max-w-[540px]">
          <div aria-hidden="true" className="capa aparecer absolute inset-[6%] [--prof:12px]" style={retraso(150)}>
            <Espiral className="size-full animate-[giro_60s_linear_infinite]" />
          </div>
          {/* En el hueco blanco de la espiral: misma profundidad que la espiral para no salirse del hueco. */}
          <div className="capa aparecer absolute left-[33.5%] top-[31.85%] w-[33%] [--prof:12px]" style={retraso(350)}>
            <HexImagen src="/fotos/servidores-1.jpg" alt="Servidores" carga="eager" sizes="180px" />
          </div>
          {orbitas.map((o) => (
            <div key={o.src} className={`capa entrada absolute ${o.pos} ${o.movil ? '' : 'hidden sm:block'}`} style={retraso(o.ms, { '--prof': o.prof })}>
              <div className="flotar drop-shadow-[0_14px_22px_rgb(56_56_60/0.22)]" style={retraso(o.ms, { '--duracion': o.dur })}>
                <HexImagen src={o.src} alt={o.alt} carga="eager" sizes="180px" />
              </div>
            </div>
          ))}
        </Parallax>
      </div>
    </section>
  );
}
