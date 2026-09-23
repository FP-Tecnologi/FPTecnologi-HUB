const MODELS = [
  {
    href: '/',
    title: 'Modelo 1',
    text: 'Hero con degradé de marca a pantalla completa, sin formas sueltas.',
    style: 'Gradiente de marca',
    styleDesc: 'Hero con degradé + blobs de color propios de la marca. Corporativo, sin blanco y negro puro.',
    sections: ['Barra superior', 'Header', 'Hero', 'Marcas (marquesina)', 'Servicios', 'Productos destacados', 'Por qué elegirnos', 'Estadísticas', 'Sé partner', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-2',
    title: 'Modelo 2',
    text: 'Hero oscuro con manchas de luz difuminadas, botón con barrido y flip de ícono.',
    style: 'Oscuro con resplandores',
    styleDesc: 'Fondo negro/tinta con manchas de luz difuminadas (blur) detrás del contenido. Dinámico, alto contraste.',
    sections: ['Header', 'Hero', 'Tienda / Servicios (2 caminos)', 'Estadísticas', 'Servicios', 'Productos destacados', 'Marcas (marquesina)', 'Por qué elegirnos', 'Sé partner', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-3',
    title: 'Modelo 3',
    text: 'Degradé de esquina y patrón triangular sutil sobre fondo claro.',
    style: 'Claro minimalista',
    styleDesc: 'Fondo blanco/papel, un solo blob de color en la esquina y patrón diagonal sutil. Limpio, aire.',
    sections: ['Header', 'Hero', 'Tienda / Servicios (2 caminos)', 'Estadísticas', 'Servicios', 'Productos destacados', 'Marcas (marquesina)', 'Por qué elegirnos', 'Sé partner', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-4',
    title: 'Modelo 4',
    text: 'Tarjetas de servicio con foto de fondo y overlay oscuro, ícono flotante.',
    style: 'Oscuro degradado',
    styleDesc: 'Hero con degradé de marca de fondo a fondo (sin blobs sueltos) y tarjetas de servicio con foto + overlay oscuro.',
    sections: ['Header', 'Hero', 'Tienda / Servicios (2 caminos)', 'Estadísticas', 'Servicios', 'Productos destacados', 'Marcas (marquesina)', 'Por qué elegirnos', 'Sé partner', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-5',
    title: 'Modelo 5',
    text: 'Acentos en fuente monoespaciada estilo comentario de código, tarjetas elevadas.',
    style: 'Oscuro tipo consola',
    styleDesc: 'Fondo oscuro con acentos en fuente monoespaciada (estilo comentario de código, "// SERVICIOS"). Técnico.',
    sections: ['Header', 'Hero', 'Servicios', 'Tienda / Servicios (2 caminos)', 'Estadísticas', 'Productos destacados', 'Marcas (marquesina)', 'Por qué elegirnos', 'Sé partner', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-6',
    title: 'Modelo 6',
    text: 'Imágenes recortadas en formas curvas/orgánicas, header con vidrio esmerilado.',
    style: 'Claro orgánico + glass',
    styleDesc: 'Fondo blanco, imágenes recortadas en formas curvas/blob (no rectángulos) y header con vidrio esmerilado (glassmorfismo) al hacer scroll.',
    sections: ['Header', 'Hero', 'Tienda / Servicios (2 caminos)', 'Estadísticas', 'Servicios', 'Productos destacados', 'Marcas (marquesina)', 'Por qué elegirnos', 'Sé partner', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-7',
    title: 'Modelo 7',
    text: 'Hero con foto de escritorio + badges de confianza, categorías en grilla y bloque de rendimiento circular.',
    style: 'Claro tipo producto',
    styleDesc: 'Fondo claro, fotos de stock reales (no genéricas), tarjetas blancas con sombra suave y un bloque circular de "rendimiento" rodeado de features. Más orientado a catálogo que los otros 6.',
    sections: ['Header', 'Hero', 'Categorías de producto', 'Productos destacados', 'Rendimiento (circular)', 'Soluciones por entorno', 'Por qué elegirnos', 'CTA', 'Marcas (marquesina)', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-8',
    title: 'Modelo 8',
    text: 'Negro puro, nav en pastillas de metal líquido y titular con reveal enmascarado -- ahora con la home completa.',
    style: 'Negro metal líquido',
    styleDesc: 'Fondo negro con glow radial, pastillas de nav con degradé metálico + brillo diagonal al pasar el mouse, y CTAs "vidrio esmerilado". Entrada escalonada (fade+scale/mask) en CSS puro, sin librería de animación.',
    sections: ['Header (pastillas de metal líquido)', 'Hero (badge + titular + CTAs)', 'Estadísticas', 'Categorías', 'Servicios', 'Productos destacados', 'Por qué elegirnos', 'CTA', 'Marcas (marquesina)', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-9',
    title: 'Modelo 9',
    text: 'Tarjeta hero a pantalla completa con foto de oficina, nav de vidrio y una tarjeta flotante con esquina recortada -- ahora con la home completa.',
    style: 'Glass sobre foto',
    styleDesc: 'Una sola tarjeta redondeada ocupando casi toda la pantalla, foto de fondo con overlay claro, badge y titular centrados, y dos paneles de vidrio esmerilado flotantes (uno con esquina "recortada" en SVG puro). El resto de la home sigue el mismo acento navy + tarjetas de vidrio.',
    sections: ['Header (nav de vidrio sobre foto)', 'Hero (tarjeta con esquinas recortadas)', 'Categorías', 'Servicios', 'Productos destacados', 'Por qué elegirnos', 'CTA', 'Marcas (marquesina)', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-10',
    title: 'Modelo 10',
    text: 'Hero con foto oscura, favoritos numerados con carrito real, banner partido Tienda/Servicios y FAQ en acordeón.',
    style: 'E-commerce editorial',
    styleDesc: 'Header blanco minimal con buscador y carrito real (CartContext), hero con foto oscura a pantalla completa, tarjetas de producto numeradas con "Top Pick" y favoritos, banner partido en 2, métricas reales en vez de testimonios inventados, y FAQ nativo en acordeón (<details>, sin JS).',
    sections: ['Header (buscador + carrito)', 'Hero', 'Marcas (marquesina)', 'Favoritos del mes', 'Tienda/Servicios (banner partido)', 'Estadísticas de confianza', 'Sobre nosotros', 'Cómo comprar (pasos)', 'FAQ', 'CTA', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-11',
    title: 'Modelo 11',
    text: 'Tienda oscura con acento violeta, hero en carrusel y grid de productos con carrito real.',
    style: 'Oscuro violeta',
    styleDesc: 'Header y footer negro-violeta, hero con carrusel (flechas + puntos) reusando los 3 slides reales del home, tarjetas de producto con favorito decorativo y "Añadir al carrito" real. Deliberadamente corto -- la referencia tampoco tenía más secciones que estas.',
    sections: ['Header (buscador + carrito)', 'Hero (carrusel)', 'Productos destacados', 'Footer'],
  },
  {
    href: '/modelo-riteflow',
    title: 'Modelo Riteflow',
    text: 'Único modelo portado desde código real (plantilla Riteflow del usuario, home-v2) en vez de solo una captura.',
    style: 'Indigo + gradiente animado',
    styleDesc: 'Título con gradient-text (blanco a violeta), animaciones de entrada GSAP + ScrollTrigger reales (no CSS), tarjetas de estadísticas con conteo animado (IntersectionObserver) y bento de beneficios con foto. Única dependencia nueva: gsap (necesaria para que la animación real del template funcione, ver comentario en app/modelo-riteflow/page.tsx sobre qué se portó y qué se dejó afuera).',
    sections: ['Header', 'Hero', 'Marcas (marquesina)', 'Sobre nosotros + estadísticas animadas', 'Por qué elegirnos (bento)', 'Contacto', 'Footer'],
  },
  {
    href: '/modelo-claude',
    title: 'Modelo Claude (snapshot)',
    text: 'Copia congelada de la home real (/) tomada el 2026-09-22 -- referencia de cómo se veía antes de seguir mezclando piezas de otros modelos sobre Modelo 1.',
    style: 'Snapshot, no es un modelo nuevo',
    styleDesc: 'La raíz (/) es donde se arma la versión final del sitio (ver docs/notas-rediseno-web-publica.md): se sigue editando en vivo. Esta ruta usa su propia copia de componentes en src/components/site-claude/, así que NO cambia cuando la raíz siga cambiando -- sirve para comparar el antes/después.',
    sections: ['Header', 'Hero (Modelo 9)', 'Marcas', 'Nosotros', 'Servicios', 'Por qué elegirnos', 'Categorías de producto', 'Productos destacados', 'Sé partner', 'Contacto', 'Footer'],
  },
] as const;

export const metadata = { title: 'Modelos — FPTecnologi' };

export default function ModelosPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-6 py-16">
      <h1 className="font-bold text-3xl text-ink">Modelos de home — fptecnologi.com</h1>
      <p className="mt-2 text-ink/60">{MODELS.length} propuestas para comparar y elegir.</p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {MODELS.map((m) => (
          <a key={m.href} href={m.href} className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-brand-primary">{m.title}</h2>
              <span className="shrink-0 rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-brand-primary">
                {m.style}
              </span>
            </div>
            <p className="mt-2 text-sm text-ink/60">{m.text}</p>
            <p className="mt-2 text-sm text-ink/50">{m.styleDesc}</p>
            <p className="mt-3 border-t border-black/5 pt-3 text-xs leading-relaxed text-ink/45">
              <span className="font-semibold text-ink/60">Estructura: </span>
              {m.sections.join(' → ')}
            </p>
          </a>
        ))}
      </div>
    </main>
  );
}
