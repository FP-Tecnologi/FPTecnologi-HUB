import { Header } from '@/components/site/Header';
import { Header2 } from '@/components/site2/Header2';
import { Header3 } from '@/components/site3/Header3';
import { Header4 } from '@/components/site4/Header4';
import { Header5 } from '@/components/site5/Header5';
import { Header6 } from '@/components/site6/Header6';
import { Solutions } from '@/components/site/Solutions';
import { Services2 } from '@/components/site2/Services2';
import { Services3 } from '@/components/site3/Services3';
import { Services4 } from '@/components/site4/Services4';
import { Services5 } from '@/components/site5/Services5';
import { Services6 } from '@/components/site6/Services6';
import { FeaturedProducts } from '@/components/site2/FeaturedProducts';
import { WhyChooseUs } from '@/components/site2/WhyChooseUs';
import { QuoteIcon } from '@/components/site/icons';
import { Icon } from '@/components/site/Icon';
import { SOLUTIONS, WHY_CHOOSE_US, FEATURED_PRODUCTS } from '@/lib/content';
import { ClickConfirmButton } from './ClickConfirmButton';
import { PulseClickButton } from './PulseClickButton';
import { RippleClickButton } from './RippleClickButton';
import { FaqAccordion } from './FaqAccordion';
import { DismissibleChip } from './DismissibleChip';
import { BagAddButton } from './BagAddButton';
import { MiniCartPreview } from './MiniCartPreview';
import { CheckoutSummaryCard } from './CheckoutSummaryCard';
import { ProductGalleryDemo } from './ProductGalleryDemo';
import { CartButton } from '@/components/site/CartButton';
import { ProductComparisonCard } from './ProductComparisonCard';
import { GlassCartPreview } from './GlassCartPreview';
import { CompactCartPreview } from './CompactCartPreview';
import { HeaderCartDropdownA } from './HeaderCartDropdownA';
import { HeaderCartDropdownB } from './HeaderCartDropdownB';
import { HeaderBg, VARIANTS as CHAT_VARIANTS, DEFAULT_VARIANT as CHAT_DEFAULT_VARIANT } from '@/components/site/chatVariants';
import { ReplayAnimation } from './ReplayAnimation';
import { TestimonialCarouselDemo } from './TestimonialCarouselDemo';
import { CurrencyToggle } from '@/components/site/CurrencyToggle';
import {
  CurrencyToggleSolid,
  CurrencyToggleSwitch,
  CurrencyToggleBump,
  CurrencyToggleCoinFlip,
} from './CurrencyToggleVariants';
import type { CSSProperties, ReactNode } from 'react';

export const metadata = { title: 'Guía de estilos' };

const HEADERS = [
  {
    id: 'modelo-1',
    name: 'Modelo 1',
    href: '/',
    headerType: 'Sticky claro',
    headerDesc: 'Header blanco fijo al hacer scroll, con barra superior de contacto arriba.',
    Header: Header,
    previewHeight: undefined as number | undefined,
  },
  {
    id: 'modelo-2',
    name: 'Modelo 2',
    href: '/modelo-2',
    headerType: 'Fixed oscuro',
    headerDesc: 'Transparente sobre el hero, se vuelve sólido oscuro al bajar. Barra de contacto arriba.',
    Header: Header2,
    previewHeight: 132 as number | undefined,
  },
  {
    id: 'modelo-3',
    name: 'Modelo 3',
    href: '/modelo-3',
    headerType: 'Sticky con topbar oscura',
    headerDesc: 'Header blanco sticky + una franja oscura arriba con redes sociales y contacto.',
    Header: Header3,
    previewHeight: undefined as number | undefined,
  },
  {
    id: 'modelo-4',
    name: 'Modelo 4',
    href: '/modelo-4',
    headerType: 'Fixed transparente-a-claro',
    headerDesc: 'Igual mecánica que el Modelo 2 pero al bajar pasa a blanco (no oscuro). Sin topbar.',
    Header: Header4,
    previewHeight: 96 as number | undefined,
  },
  {
    id: 'modelo-5',
    name: 'Modelo 5',
    href: '/modelo-5',
    headerType: 'Estático con corte diagonal',
    headerDesc: 'No es sticky ni fixed — vive en el flujo normal. La franja de contacto tiene un recorte diagonal (clip-path).',
    Header: Header5,
    previewHeight: undefined as number | undefined,
  },
  {
    id: 'modelo-6',
    name: 'Modelo 6',
    href: '/modelo-6',
    headerType: 'Sticky con blur',
    headerDesc: 'Header blanco semitransparente con backdrop-blur — se ve el contenido desenfocado detrás al hacer scroll.',
    Header: Header6,
    previewHeight: undefined as number | undefined,
  },
] as const;

const ArrowIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CartIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M3 4h2l.4 2M7 14h10l3-8H5.4M7 14 5.4 6M7 14l-1.5 4h12M10 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm7 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CheckIcon = ({ className = 'h-4 w-4' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BubbleDotsIcon = ({ className = 'h-6 w-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 3a8 8 0 0 0-8 8c0 1.6.5 3.1 1.4 4.3L4 20l4.9-1.3c1.2.7 2.6 1.1 4.1 1.1a8 8 0 0 0 0-16Z"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinejoin="round"
    />
    <circle cx="8.6" cy="11" r="1.1" fill="currentColor" />
    <circle cx="12" cy="11" r="1.1" fill="currentColor" />
    <circle cx="15.4" cy="11" r="1.1" fill="currentColor" />
  </svg>
);

const HeadsetIcon = ({ className = 'h-6 w-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M4 14v-2a8 8 0 0 1 16 0v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <rect x="2.5" y="14" width="4" height="6" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <rect x="17.5" y="14" width="4" height="6" rx="2" stroke="currentColor" strokeWidth="1.7" />
    <path d="M20 19.5v.5a2 2 0 0 1-2 2h-2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const BotIcon = ({ className = 'h-6 w-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M12 8V5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="12" cy="4" r="1" fill="currentColor" />
    <rect x="5" y="8" width="14" height="10" rx="3" stroke="currentColor" strokeWidth="1.7" />
    <path d="M3 12.5h2M19 12.5h2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="9.5" cy="13" r="1.1" fill="currentColor" />
    <circle cx="14.5" cy="13" r="1.1" fill="currentColor" />
  </svg>
);

const QuestionIcon = ({ className = 'h-6 w-6' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
    <path d="M9.3 9.6a2.7 2.7 0 1 1 3.9 2.4c-.8.4-1.2.9-1.2 1.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    <circle cx="12" cy="16.8" r="1" fill="currentColor" />
  </svg>
);

const LAUNCHER_ICONS = [
  { name: 'Burbuja + puntos (actual)', icon: <BubbleDotsIcon /> },
  { name: 'Auriculares', icon: <HeadsetIcon /> },
  { name: 'Robot', icon: <BotIcon /> },
  { name: 'Ayuda', icon: <QuestionIcon /> },
] as const;

const LAUNCHER_EFFECTS = [
  {
    name: 'Anillo de pulso (actual)',
    desc: 'El que está aplicado hoy — `.launcher-ring`, un anillo que crece y se desvanece en loop. Acá se ve más marcado que en el botón real para que se note en la comparación (en el launcher real es más sutil).',
    wrapClassName: 'demo-ring-pulse',
    iconClassName: '',
  },
  { name: 'Sin efecto extra', desc: 'Solo el botón — sin nada animándose alrededor ni adentro.', wrapClassName: '', iconClassName: '' },
  {
    name: 'Ícono rebota',
    desc: 'En el sitio real es solo al hover (`.icon-hop`, la misma clase de 2.1/2.2) — acá se deja en loop para que se vea sin pasar el cursor.',
    wrapClassName: '',
    iconClassName: 'animate-icon-hop-loop',
  },
  {
    name: 'Ícono gira',
    desc: 'En el sitio real es solo al hover (`.icon-flip`) — acá se deja en loop para que se vea sin pasar el cursor.',
    wrapClassName: '',
    iconClassName: 'animate-icon-flip-loop',
  },
] as const;

const FILLS = [
  {
    name: 'Relleno plano',
    where: 'Modelo 1 — botón "Cotizador" del header',
    hover: 'Hover: solo escala un poco y oscurece el fondo (bg-brand-dark). El más simple, sin capas extra.',
    demoLeft: (
      <a
        href="#botones"
        className="flex w-fit items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-primary/30 transition-transform hover:scale-[1.03] hover:bg-brand-dark"
      >
        <QuoteIcon />
        Cotizador
      </a>
    ),
    demoRight: (
      <a
        href="#botones"
        className="flex w-fit items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-primary/30 transition-transform hover:scale-[1.03] hover:bg-brand-dark"
      >
        Cotizador
        <ArrowIcon />
      </a>
    ),
    demoSoft: (
      <a
        href="#botones"
        className="flex w-fit items-center gap-2 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-primary/30 transition-transform hover:scale-[1.03] hover:bg-brand-dark"
      >
        <QuoteIcon />
        Cotizador
      </a>
    ),
    demoHop: (
      <a
        href="#botones"
        className="group flex w-fit items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-primary/30"
      >
        <QuoteIcon className="icon-hop h-4 w-4" />
        Cotizador
      </a>
    ),
    demoFlip: (
      <a
        href="#botones"
        className="group flex w-fit items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-sm shadow-brand-primary/30"
      >
        <QuoteIcon className="icon-flip h-4 w-4" />
        Cotizador
      </a>
    ),
  },
  {
    name: 'Sweep (barrido)',
    where: 'Modelos 2, 3, 4, 5, 6 — CTA "Cotizador" del header, y catálogo/servicios',
    hover: 'Hover: el fondo NO cambia de color — un segundo color (before:bg-…) entra deslizando desde la izquierda al 100% del botón en 0.4s. Patrón tomado tal cual de la plantilla Techon (.btn-style-one).',
    demoLeft: (
      <button type="button" className="btn-sweep flex w-fit items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white before:bg-brand-dark">
        <QuoteIcon />
        Cotizador
      </button>
    ),
    demoRight: (
      <button
        type="button"
        className="group btn-sweep w-fit rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-ink before:bg-brand-primary hover:text-white"
      >
        <span className="inline-flex items-center gap-2">
          Ver catálogo
          <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </button>
    ),
    demoSoft: (
      <button type="button" className="btn-sweep flex w-fit items-center gap-2 rounded-lg bg-brand-primary px-6 py-3 text-sm font-semibold text-white before:bg-brand-dark">
        <QuoteIcon />
        Cotizador
      </button>
    ),
    demoHop: (
      <button type="button" className="group btn-sweep flex w-fit items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white before:bg-brand-dark">
        <QuoteIcon className="icon-hop h-4 w-4" />
        Cotizador
      </button>
    ),
    demoFlip: (
      <button type="button" className="group btn-sweep flex w-fit items-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white before:bg-brand-dark">
        <QuoteIcon className="icon-flip h-4 w-4" />
        Cotizador
      </button>
    ),
  },
  {
    name: 'Glow (estilo Vireo)',
    where: 'Chat, "Agregar al carrito", "Ver carrito", "Escribir por WhatsApp" — en los 6 modelos',
    hover: 'Hover: no barrido ni escala — sube el brillo (filter: brightness) y la sombra de color se intensifica. Es el degradé + glow de los botones primarios del dashboard (Vireo/Aurora), traído a la web pública.',
    demoLeft: (
      <button type="button" className="btn-glow flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white">
        <CartIcon />
        Agregar al carrito
      </button>
    ),
    demoRight: (
      <button type="button" className="btn-glow flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white">
        Comprar ahora
        <ArrowIcon />
      </button>
    ),
    demoSoft: (
      <button type="button" className="btn-glow flex w-fit items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white">
        <CartIcon />
        Agregar al carrito
      </button>
    ),
    demoHop: (
      <button type="button" className="group btn-glow flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white">
        <CartIcon className="icon-hop h-4 w-4" />
        Agregar al carrito
      </button>
    ),
    demoFlip: (
      <button type="button" className="group btn-glow flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white">
        <CartIcon className="icon-flip h-4 w-4" />
        Agregar al carrito
      </button>
    ),
  },
] as const;

const HIERARCHY = [
  {
    name: 'Primario',
    desc: 'Fondo de color, para la única acción principal de la sección. Usa uno de los 3 rellenos de arriba según el modelo — acá con glow.',
    demoLeft: (
      <button type="button" className="btn-glow flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white">
        <CartIcon />
        Comprar ahora
      </button>
    ),
    demoRight: (
      <button type="button" className="btn-glow flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white">
        Comprar ahora
        <ArrowIcon />
      </button>
    ),
    demoSoft: (
      <button type="button" className="btn-glow flex w-fit items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-white">
        <CartIcon />
        Comprar ahora
      </button>
    ),
    demoHop: (
      <button type="button" className="group btn-glow flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white">
        <CartIcon className="icon-hop h-4 w-4" />
        Comprar ahora
      </button>
    ),
    demoFlip: (
      <button type="button" className="group btn-glow flex w-fit items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white">
        <CartIcon className="icon-flip h-4 w-4" />
        Comprar ahora
      </button>
    ),
  },
  {
    name: 'Secundario (borde)',
    desc: 'Transparente con borde y texto oscuro — no compite con el primario. Al hover se rellena con el mismo barrido (before:bg-…) partiendo de fondo transparente. Ya existe en el sitio: "Ver catálogo completo".',
    demoLeft: (
      <button
        type="button"
        className="btn-sweep flex w-fit items-center gap-2 rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-ink before:bg-brand-primary hover:text-white"
      >
        <QuoteIcon />
        Ver más
      </button>
    ),
    demoRight: (
      <button
        type="button"
        className="btn-sweep flex w-fit items-center gap-2 rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-ink before:bg-brand-primary hover:text-white"
      >
        Ver más
        <ArrowIcon />
      </button>
    ),
    demoSoft: (
      <button
        type="button"
        className="btn-sweep flex w-fit items-center gap-2 rounded-lg border border-black/15 px-6 py-3 text-sm font-semibold text-ink before:bg-brand-primary hover:text-white"
      >
        <QuoteIcon />
        Ver más
      </button>
    ),
    demoHop: (
      <button
        type="button"
        className="group btn-sweep flex w-fit items-center gap-2 rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-ink before:bg-brand-primary hover:text-white"
      >
        <QuoteIcon className="icon-hop h-4 w-4" />
        Ver más
      </button>
    ),
    demoFlip: (
      <button
        type="button"
        className="group btn-sweep flex w-fit items-center gap-2 rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-ink before:bg-brand-primary hover:text-white"
      >
        <QuoteIcon className="icon-flip h-4 w-4" />
        Ver más
      </button>
    ),
  },
  {
    name: 'Texto (solo texto)',
    desc: 'Sin fondo ni borde — únicamente color de marca y una flecha que se separa al hover. Patrón usado en "Consultar" / "Leer más" dentro de las tarjetas de servicio.',
    demoLeft: (
      <a href="#botones" className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-primary">
        <QuoteIcon className="h-4 w-4" />
        Ver más
      </a>
    ),
    demoRight: (
      <a href="#botones" className="group inline-flex w-fit items-center gap-1 text-sm font-semibold text-brand-primary">
        Ver más
        <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </a>
    ),
    demoSoft: undefined as ReactNode | undefined,
    demoHop: (
      <a href="#botones" className="group inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-primary">
        <QuoteIcon className="icon-hop h-4 w-4" />
        Ver más
      </a>
    ),
    demoFlip: (
      <a href="#botones" className="group inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-brand-primary">
        <QuoteIcon className="icon-flip h-4 w-4" />
        Ver más
      </a>
    ),
  },
] as const;

const CLICK_EFFECTS = [
  {
    name: 'Confirmación al clic',
    desc: 'El ícono se desliza de izquierda a derecha mientras el texto se borra progresivamente en su camino (900ms) — recién cuando termina, pasa al estado final. Mismo patrón que usa "Agregar al carrito" en la tienda, con el paso de barrido de más.',
    primario: <ClickConfirmButton icon={<CartIcon />} label="Agregar al carrito" doneIcon={<CheckIcon />} doneLabel="Agregado" />,
    secundario: (
      <ClickConfirmButton
        icon={<QuoteIcon />}
        label="Ver más"
        doneIcon={<CheckIcon />}
        doneLabel="Listo"
        className="rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-ink"
        doneClassName="rounded-full border-2 border-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-600"
      />
    ),
    texto: (
      <ClickConfirmButton
        icon={<QuoteIcon />}
        label="Ver más"
        doneIcon={<CheckIcon />}
        doneLabel="Listo"
        className="text-sm font-semibold text-brand-primary"
        doneClassName="text-sm font-semibold text-emerald-600"
      />
    ),
  },
  {
    name: 'Pulso',
    desc: 'El botón entero da un pulso corto (crece y vuelve, 350ms) — feedback táctil de "acción registrada". Es el mismo `bump` que ya usa el badge del carrito al agregar un producto.',
    primario: (
      <PulseClickButton>
        <CartIcon />
        Agregar al carrito
      </PulseClickButton>
    ),
    secundario: (
      <PulseClickButton className="rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-ink">
        <QuoteIcon />
        Ver más
      </PulseClickButton>
    ),
    texto: (
      <PulseClickButton className="text-sm font-semibold text-brand-primary">
        <QuoteIcon />
        Ver más
      </PulseClickButton>
    ),
  },
  {
    name: 'Ondas (propuesta)',
    desc: 'Un círculo nace justo en el punto donde hiciste clic y crece desvaneciéndose — estilo "ripple" de Material Design. Es una propuesta para comparar, no un efecto real del sitio.',
    primario: (
      <RippleClickButton>
        <CartIcon />
        Agregar al carrito
      </RippleClickButton>
    ),
    secundario: (
      <RippleClickButton className="rounded-full border border-black/15 px-6 py-3 text-sm font-semibold text-ink" rippleClassName="bg-brand-primary/20">
        <QuoteIcon />
        Ver más
      </RippleClickButton>
    ),
    texto: (
      <RippleClickButton className="text-sm font-semibold text-brand-primary" rippleClassName="bg-brand-primary/20">
        <QuoteIcon />
        Ver más
      </RippleClickButton>
    ),
  },
] as const;

const SEMANTIC_TONES = [
  {
    name: 'Éxito',
    example: 'Pedido confirmado',
    solidClass: 'bg-emerald-500 text-white',
    softClass: 'bg-emerald-500/10 text-emerald-600',
    outlineClass: 'border border-emerald-500 text-emerald-600',
  },
  {
    name: 'Alerta',
    example: 'Stock bajo',
    solidClass: 'bg-amber-500 text-white',
    softClass: 'bg-amber-500/10 text-amber-600',
    outlineClass: 'border border-amber-500 text-amber-600',
  },
  {
    name: 'Peligro',
    example: 'Sin stock',
    solidClass: 'bg-red-500 text-white',
    softClass: 'bg-red-500/10 text-red-600',
    outlineClass: 'border border-red-500 text-red-600',
  },
  {
    name: 'Info',
    example: 'Nuevo ingreso',
    solidClass: 'bg-sky-500 text-white',
    softClass: 'bg-sky-500/10 text-sky-600',
    outlineClass: 'border border-sky-500 text-sky-600',
  },
] as const;

const SERVICE_CARDS = [
  {
    name: 'Modelo 1',
    desc: 'Tarjeta grande vertical (4:5), imagen de fondo a sangre con degradé oscuro. Hover: zoom de imagen + flecha "Consultar" se desliza.',
    Card: Solutions,
    wrapClassName: '',
  },
  {
    name: 'Modelo 2',
    desc: 'Imagen arriba + ícono circular blanco superpuesto (-mt-8). Hover: el ícono gira 180° y su fondo pasa a azul.',
    Card: Services2,
    wrapClassName: '',
  },
  {
    name: 'Modelo 3',
    desc: 'Tarjeta cuadrada oscura sobre fondo de sección oscuro, overlay + texto abajo. Hover: zoom + rotación leve de la imagen.',
    Card: Services3,
    wrapClassName: '',
  },
  {
    name: 'Modelo 4',
    desc: 'Tarjeta blanca con borde, ícono cuadrado superpuesto en la esquina de la imagen. Hover: sombra grande + ícono invierte color.',
    Card: Services4,
    wrapClassName: '',
  },
  {
    name: 'Modelo 5',
    desc: 'Tarjeta blanca flotante con sombra fuerte (pensada para superponerse al hero). Hover: se eleva y el ícono gira 180°.',
    Card: Services5,
    wrapClassName: 'pt-24',
  },
  {
    name: 'Modelo 6',
    desc: 'Fila horizontal (ícono + texto en línea), ícono con forma orgánica irregular. Hover: toda la tarjeta se pinta de azul.',
    Card: Services6,
    wrapClassName: '',
  },
] as const;

const VIREO_CHIP_CARDS = [
  { sol: SOLUTIONS[0], iconWrap: 'flex h-11 w-11 items-center justify-center rounded-lg bg-brand-primary/12 text-brand-primary' },
  { sol: SOLUTIONS[1], iconWrap: 'flex h-11 w-11 items-center justify-center rounded-lg bg-brand-teal/12 text-brand-teal' },
  { sol: SOLUTIONS[2], iconWrap: 'flex h-11 w-11 items-center justify-center rounded-lg bg-brand-dark/12 text-brand-dark' },
  { sol: SOLUTIONS[4], iconWrap: 'flex h-11 w-11 items-center justify-center rounded-lg bg-brand-teal-light/20 text-brand-teal-light' },
] as const;

const CHAT_MODELS = [
  { name: 'Modelo 1', variant: CHAT_DEFAULT_VARIANT },
  { name: 'Modelo 2', variant: CHAT_VARIANTS['modelo-2'] },
  { name: 'Modelo 3', variant: CHAT_VARIANTS['modelo-3'] },
  { name: 'Modelo 4', variant: CHAT_VARIANTS['modelo-4'] },
  { name: 'Modelo 5', variant: CHAT_VARIANTS['modelo-5'] },
  { name: 'Modelo 6', variant: CHAT_VARIANTS['modelo-6'] },
] as const;

const LAUNCHER_SHAPES = [
  { name: 'Círculo', desc: 'La forma original — antes de este cambio.', className: 'rounded-full' },
  { name: 'Cuadrado suave (actual)', desc: 'La que está aplicada ahora en el sitio.', className: 'rounded-2xl' },
  { name: 'Cuadrado marcado', desc: 'Esquinas bien poco redondeadas — más geométrico, menos "amigable".', className: 'rounded-lg' },
  { name: 'Burbuja (propuesta)', desc: 'Un borde queda menos redondeado, como la colita de una burbuja de chat.', className: 'rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-md' },
] as const;

const TOC = [
  { href: '#headers', label: 'Headers' },
  { href: '#botones', label: 'Botones' },
  { href: '#tarjetas-servicio', label: 'Tarjetas de servicio' },
  { href: '#tarjeta-producto', label: 'Tarjeta de producto' },
  { href: '#tarjeta-diferenciador', label: 'Tarjeta "por qué elegirnos"' },
  { href: '#badges', label: 'Badges' },
  { href: '#acordeon', label: 'Acordeón (FAQ)' },
  { href: '#ribbons', label: 'Ribbons' },
  { href: '#chat', label: 'Chat / Asistente virtual' },
  { href: '#efectos', label: 'Efectos' },
  { href: '#carrito', label: 'Carrito' },
  { href: '#comparacion', label: 'Comparación de productos' },
  { href: '#testimonios', label: 'Testimonios' },
  { href: '#moneda', label: 'Selector de moneda' },
];

export default function GuiaEstilosPage() {
  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <a href="/modelos" className="text-sm font-semibold text-brand-primary">
        ← Volver a los modelos
      </a>
      <h1 className="mt-4 font-display text-3xl font-bold text-ink sm:text-4xl">Guía de estilos</h1>
      <p className="mt-3 max-w-2xl text-ink/60">
        Los 6 modelos comparten contenido y estructura de negocio, pero cada uno tiene su propio header, su
        propio tratamiento de botón y su propio estilo de tarjeta. Acá están los componentes reales — no
        capturas — de cada uno.
      </p>

      <nav className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-y border-black/5 py-3 text-sm font-medium text-ink/60">
        {TOC.map((item) => (
          <a key={item.href} href={item.href} className="hover:text-brand-primary">
            {item.label}
          </a>
        ))}
      </nav>

      {/* Headers */}
      <section id="headers" className="mt-14">
        <h2 className="font-display text-2xl font-bold text-ink">1. Headers</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          6 mecánicas distintas de posicionamiento — sticky, fixed, o estático en el flujo normal. Pasa el
          mouse sobre "Tienda" en cada uno para ver su submenú — cada modelo tiene su propio estilo de
          submenú, no todos comparten la misma tarjeta.
        </p>

        <div className="mt-8 flex flex-col gap-96">
          {HEADERS.map(({ id, name, href, headerType, headerDesc, Header: HeaderComp, previewHeight }) => (
            <div key={id}>
              <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {name} <span className="text-sm font-normal text-ink/40">— {headerType}</span>
                  </h3>
                  <p className="mt-1 max-w-xl text-sm text-ink/55">{headerDesc}</p>
                </div>
                <a href={href} className="text-sm font-semibold text-brand-primary hover:underline">
                  Ver página completa →
                </a>
              </div>

              <div className="border border-black/10 shadow-sm" style={{ contain: 'layout' }}>
                <div className="relative bg-paper" style={previewHeight ? { height: previewHeight } : undefined}>
                  <HeaderComp />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Botones */}
      <section id="botones" className="mt-96">
        <h2 className="font-display text-2xl font-bold text-ink">2. Botones y su hover</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Pasa el mouse sobre cada botón para ver el efecto real — nada de esto es una captura.
        </p>

        <h3 className="mt-8 font-display text-lg font-bold text-ink">2.1 Jerarquía: primario, secundario, texto</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Toda sección con más de un botón necesita distinguir la acción principal de las de apoyo — nunca dos
          primarios compitiendo. En cada uno: ícono a la izquierda (ancla la acción) vs. a la derecha (empuja
          hacia adelante), la propuesta de esquinas suaves cuando aplica, y 2 formas de mover el ícono al
          pasar el cursor.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {HIERARCHY.map((b) => (
            <div key={b.name} className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h4 className="font-semibold text-ink">{b.name}</h4>
              <div className="flex flex-col gap-3 rounded-xl bg-paper p-4">
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink/35">Ícono izq.</p>
                  <div className="flex justify-center">{b.demoLeft}</div>
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink/35">Ícono der.</p>
                  <div className="flex justify-center">{b.demoRight}</div>
                </div>
                {b.demoSoft && (
                  <div>
                    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink/35">Esquinas suaves (propuesta)</p>
                    <div className="flex justify-center">{b.demoSoft}</div>
                  </div>
                )}
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink/35">Hover — ícono salta</p>
                  <div className="flex justify-center">{b.demoHop}</div>
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink/35">Hover — ícono gira</p>
                  <div className="flex justify-center">{b.demoFlip}</div>
                </div>
              </div>
              <p className="text-xs text-ink/55">{b.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-12 font-display text-lg font-bold text-ink">2.2 Relleno del primario</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          3 formas distintas de animar el relleno de un botón primario — cada modelo elige una. También con
          ícono a la izquierda, a la derecha, la propuesta de esquinas suaves, y 2 formas de mover el ícono al
          pasar el cursor.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {FILLS.map((b) => (
            <div key={b.name} className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <div>
                <h4 className="font-semibold text-ink">{b.name}</h4>
                <p className="mt-1 text-xs text-ink/50">{b.where}</p>
              </div>
              <div className="flex flex-col gap-3 rounded-xl bg-paper p-4">
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink/35">Ícono izq.</p>
                  <div className="flex justify-center">{b.demoLeft}</div>
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink/35">Ícono der.</p>
                  <div className="flex justify-center">{b.demoRight}</div>
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink/35">Esquinas suaves (propuesta)</p>
                  <div className="flex justify-center">{b.demoSoft}</div>
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink/35">Hover — ícono salta</p>
                  <div className="flex justify-center">{b.demoHop}</div>
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink/35">Hover — ícono gira</p>
                  <div className="flex justify-center">{b.demoFlip}</div>
                </div>
              </div>
              <p className="text-xs text-ink/55">{b.hover}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-12 font-display text-lg font-bold text-ink">2.3 Al hacer clic</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          No son hover — son cambios de estado reales al hacer clic. En cada uno, los 3 niveles de jerarquía
          de 2.1: primario, secundario, texto.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {CLICK_EFFECTS.map((e) => (
            <div key={e.name} className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <h4 className="font-semibold text-ink">{e.name}</h4>
              <div className="flex flex-col gap-3 rounded-xl bg-paper p-4">
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink/35">Primario</p>
                  <div className="flex justify-center">{e.primario}</div>
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink/35">Secundario</p>
                  <div className="flex justify-center">{e.secundario}</div>
                </div>
                <div>
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-ink/35">Texto</p>
                  <div className="flex justify-center">{e.texto}</div>
                </div>
              </div>
              <p className="text-xs text-ink/55">{e.desc}</p>
            </div>
          ))}
        </div>

        <h3 className="mt-12 font-display text-lg font-bold text-ink">2.4 Tonos semánticos (propuesta)</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Referencia de Vireo: además de "primario" el sistema tiene tonos con significado propio — útiles
          para mensajes de estado (stock, envíos, confirmaciones), no para acciones de marca. No están
          aplicados en el sitio todavía.
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {SEMANTIC_TONES.map((t) => (
            <div key={t.name} className="flex flex-col gap-3 rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold text-ink/50">{t.name}</p>
              <span className={`w-fit rounded-full px-4 py-2 text-xs font-semibold ${t.solidClass}`}>{t.example}</span>
              <span className={`w-fit rounded-full px-4 py-2 text-xs font-semibold ${t.softClass}`}>{t.example}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Tarjetas de servicio */}
      <section id="tarjetas-servicio" className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink">3. Tarjetas de servicio</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Las 8 categorías de <code className="text-ink/70">SOLUTIONS</code> (mismo contenido en los 6 modelos)
          se muestran con un layout y un hover distinto en cada uno. Pasa el mouse sobre las tarjetas.
        </p>

        <h3 className="mt-8 font-display text-lg font-bold text-ink">3.1 Modelos actuales</h3>
        <div className="mt-3 flex flex-col gap-10">
          {SERVICE_CARDS.map(({ name, desc, Card, wrapClassName }) => (
            <div key={name}>
              <h4 className="font-display text-base font-bold text-ink">{name}</h4>
              <p className="mt-1 max-w-xl text-sm text-ink/55">{desc}</p>
              <div className="mt-3 max-h-[520px] overflow-y-auto overflow-x-hidden rounded-2xl border border-black/10 shadow-sm">
                <div className={wrapClassName}>
                  <Card />
                </div>
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-12 font-display text-lg font-bold text-ink">3.2 Propuesta: estilo Vireo</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Referencia tomada del dashboard Vireo/Aurora (mismo sistema de diseño que ya trajimos para los
          botones glow): tarjeta base con sombra suave y esquinas más redondeadas que las de los 6 modelos.
          Ninguna de estas 4 está aplicada en el sitio — son propuestas para comparar.
        </p>

        <div className="mt-5">
          <h4 className="font-semibold text-ink">Ícono en chip de color</h4>
          <p className="mt-1 max-w-xl text-sm text-ink/55">Ícono en un chip con fondo tintado — un color distinto por tarjeta, como en las tiles de precios de Vireo.</p>
          <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {VIREO_CHIP_CARDS.map(({ sol, iconWrap }) => (
              <div key={sol.slug} className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition-shadow hover:shadow-lg">
                <span className={iconWrap}>
                  <Icon name={sol.icon} className="h-5 w-5" />
                </span>
                <h5 className="mt-4 text-sm font-semibold text-ink">{sol.title}</h5>
                <p className="mt-1 text-xs text-ink/50">{sol.tag}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div>
            <h4 className="font-semibold text-ink">Imagen banner + badge</h4>
            <p className="mt-1 text-sm text-ink/55">Imagen arriba con un badge superpuesto, en vez de ícono circular o degradé sobre la foto.</p>
            <div className="mt-3 overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
              <div className="relative h-36">
                <img src={SOLUTIONS[2].image} alt={SOLUTIONS[2].title} className="h-full w-full object-cover" />
                <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-[11px] font-bold text-brand-primary shadow-sm">Destacado</span>
              </div>
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-brand-primary">{SOLUTIONS[2].tag}</p>
                <h5 className="mt-1 text-base font-semibold text-ink">{SOLUTIONS[2].title}</h5>
                <p className="mt-2 text-xs text-ink/55">Stock local y distribución autorizada de las principales marcas internacionales.</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-ink">Riel de acento lateral</h4>
            <p className="mt-1 text-sm text-ink/55">Una franja de color en el borde izquierdo, para marcar una tarjeta como destacada dentro de la grilla.</p>
            <div className="relative mt-3 overflow-hidden rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <span className="absolute inset-y-0 left-0 w-1 bg-brand-primary" />
              <div className="flex items-center justify-between">
                <Icon name={SOLUTIONS[1].icon} className="h-6 w-6 text-brand-primary" />
                <span className="rounded-full bg-brand-primary/10 px-2.5 py-1 text-[10px] font-bold text-brand-primary">Destacado</span>
              </div>
              <h5 className="mt-4 text-base font-semibold text-ink">{SOLUTIONS[1].title}</h5>
              <p className="mt-1 text-xs text-ink/50">{SOLUTIONS[1].tag}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-ink">Degradé + círculo decorativo</h4>
            <p className="mt-1 text-sm text-ink/55">Fondo con degradé de marca y un círculo translúcido en la esquina — para destacar UNA tarjeta entre varias planas.</p>
            <div className="relative mt-3 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-primary to-brand-dark p-6 text-white shadow-lg">
              <span className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-white/15" />
              <Icon name={SOLUTIONS[3].icon} className="relative h-7 w-7" />
              <h5 className="relative mt-4 text-base font-semibold">{SOLUTIONS[3].title}</h5>
              <p className="relative mt-1 text-xs text-white/70">{SOLUTIONS[3].tag}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tarjeta de producto */}
      <section id="tarjeta-producto" className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink">4. Tarjeta de producto</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          A diferencia de las tarjetas de servicio, esta es una sola — la misma en los 6 modelos, porque la
          Tienda es una sección de negocio compartida, no parte del diseño de cada modelo.
        </p>

        <h3 className="mt-8 font-display text-lg font-bold text-ink">4.1 Modelo actual</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Imagen sobre fondo blanco, badge de descuento, y el botón "Agregar al carrito" de ancho completo con
          estado de éxito (ícono + verde) al hacer clic.
        </p>
        <div className="mt-3 rounded-2xl border border-black/10 shadow-sm">
          <FeaturedProducts />
        </div>

        <h3 className="mt-12 font-display text-lg font-bold text-ink">4.2 Propuesta: estilo Vireo</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Referencia de la sección de e-commerce real de Vireo (<code className="text-ink/70">screens/ecommerce/Products.tsx</code>),
          no del kit de UI genérico. Misma idea de imagen + descuento + precio tachado que ya tenemos, pero la
          fila de abajo cambia: en vez de un botón de ancho completo, un badge de stock a la izquierda y un
          botón de carrito solo-ícono a la derecha — más compacto. No se agregó la fila de estrellas de reseña
          que trae el original porque no tenemos calificaciones reales todavía.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {FEATURED_PRODUCTS.map((p) => {
            const discount = Math.round(((p.priceBefore - p.price) / p.priceBefore) * 100);
            return (
              <div key={p.sku} className="overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
                <div className="relative aspect-square bg-brand-primary/8">
                  <span className="absolute left-2 top-2 z-10 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">-{discount}%</span>
                  <img src={p.image} alt={p.name} className="h-full w-full object-contain p-6" />
                </div>
                <div className="flex flex-col gap-1.5 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">{p.brand}</p>
                  <h5 className="line-clamp-2 min-h-[2.2rem] text-sm font-semibold text-ink">{p.name}</h5>
                  <div className="mt-0.5 flex items-baseline gap-2 font-mono">
                    <span className="text-base font-bold text-ink">${p.price.toFixed(2)}</span>
                    <span className="text-xs text-ink/40 line-through">${p.priceBefore.toFixed(2)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-600">En stock</span>
                    <button type="button" aria-label="Agregar al carrito" className="btn-glow flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white">
                      <CartIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <h3 className="mt-12 font-display text-lg font-bold text-ink">4.3 Propuesta: horizontal / lista</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Un tercer modelo, distinto en estructura (no solo en color): fila horizontal en vez de tarjeta
          apilada — pensado para una vista de lista/carrito rápido, no para una grilla. Además: un ícono de
          bolsa en vez del carrito de siempre, un botón cuadrado chico en vez de círculo o ancho completo, y
          su propio feedback al clic — hacé clic para verlo (pulso + cambia a un check por 1.2s).
        </p>
        <div className="mt-3 flex max-w-xl flex-col gap-3">
          {FEATURED_PRODUCTS.map((p) => (
            <div key={p.sku} className="flex items-center gap-4 rounded-2xl border border-black/5 bg-white p-3 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-primary/6">
                <img src={p.image} alt={p.name} className="h-full w-full object-contain p-2" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-primary">{p.brand}</p>
                <h5 className="truncate text-sm font-semibold text-ink">{p.name}</h5>
                <p className="text-xs text-ink/40">SKU: {p.sku}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="flex items-baseline gap-1.5 font-mono">
                  <span className="text-sm font-bold text-ink">${p.price.toFixed(2)}</span>
                  <span className="text-[11px] text-ink/40 line-through">${p.priceBefore.toFixed(2)}</span>
                </div>
                <BagAddButton />
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-12 font-display text-lg font-bold text-ink">4.4 Propuesta: galería de producto</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Adaptado de un ejemplo que pasó el usuario: imagen grande + tira de miniaturas + flechas, con
          favorito/compartir flotando sobre la foto. Hacé clic en las miniaturas o las flechas — cambia la
          imagen de verdad. El catálogo real hoy solo tiene 1 foto por producto (no fotografía por ángulos),
          así que se repite esa misma imagen en las 3 miniaturas nada más para mostrar el mecanismo — y no
          se agregó fila de reseñas porque no hay calificaciones reales todavía.
        </p>
        <div className="mt-3 flex justify-center">
          <ProductGalleryDemo
            name={FEATURED_PRODUCTS[0].name}
            brand={FEATURED_PRODUCTS[0].brand}
            image={FEATURED_PRODUCTS[0].image}
            price={FEATURED_PRODUCTS[0].price}
            priceBefore={FEATURED_PRODUCTS[0].priceBefore}
            discount={Math.round(((FEATURED_PRODUCTS[0].priceBefore - FEATURED_PRODUCTS[0].price) / FEATURED_PRODUCTS[0].priceBefore) * 100)}
          />
        </div>
      </section>

      {/* Tarjeta "por qué elegirnos" */}
      <section id="tarjeta-diferenciador" className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink">5. Tarjeta "por qué elegirnos"</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          También compartida entre los 6 modelos.
        </p>

        <h3 className="mt-8 font-display text-lg font-bold text-ink">5.1 Modelo actual</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Número grande de fondo, texto, y hover que invierte todo el fondo de la tarjeta a azul de marca.
        </p>
        <div className="mt-3 rounded-2xl border border-black/10 shadow-sm">
          <WhyChooseUs />
        </div>

        <h3 className="mt-12 font-display text-lg font-bold text-ink">5.2 Propuesta: glass claro</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Tarjetas "esmeriladas" (fondo blanco translúcido + <code className="text-ink/70">backdrop-blur</code>)
          flotando sobre el mismo fondo <code className="text-ink/70">.brand-mesh</code> que ya usan el hero de
          los Modelos 1/4/6 y el header del chat — el efecto glass solo se nota sobre un fondo con textura o
          color detrás, por eso no funciona sobre blanco liso.
        </p>
        <div className="brand-mesh mt-3 rounded-3xl p-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_CHOOSE_US.map((item, i) => (
              <div
                key={item.title}
                className="rounded-2xl border border-white/50 bg-white/25 p-6 shadow-lg shadow-black/10 backdrop-blur-md transition-colors hover:bg-white/35"
              >
                <span className="font-display text-3xl font-bold text-white/40">0{i + 1}</span>
                <h5 className="mt-3 text-base font-semibold text-white">{item.title}</h5>
                <p className="mt-2 text-sm text-white/75">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <h3 className="mt-12 font-display text-lg font-bold text-ink">5.3 Propuesta: glass oscuro (widget de chat)</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Reusa tal cual las clases reales <code className="text-ink/70">.glass-panel</code>/
          <code className="text-ink/70">.glass-card</code> del widget de chat (el mismo ADN Vireo/Aurora que ya
          trajimos para los botones glow) — no son clases nuevas, es aplicar el glass oscuro que ya existe a
          este contexto.
        </p>
        <div className="glass-panel mt-3 rounded-3xl p-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {WHY_CHOOSE_US.map((item, i) => (
              <div key={item.title} className="glass-card rounded-2xl p-6 transition-colors">
                <span className="font-display text-3xl font-bold text-white/25">0{i + 1}</span>
                <h5 className="mt-3 text-base font-semibold text-white">{item.title}</h5>
                <p className="mt-2 text-sm text-white/65">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Badges */}
      <section id="badges" className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink">6. Badges</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Referencia de Vireo (Badges.tsx). Hoy el sitio solo tiene un badge real: el contador del carrito.
        </p>

        <h3 className="mt-8 font-display text-lg font-bold text-ink">6.1 Real: contador del carrito</h3>
        <div className="mt-3 flex justify-center rounded-2xl border border-black/10 bg-white p-8 shadow-sm">
          <span className="relative flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink/70">
            <CartIcon className="h-4.5 w-4.5" />
            <span className="absolute -right-1 -top-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-brand-primary px-1 text-[10px] font-bold text-white">3</span>
          </span>
        </div>

        <h3 className="mt-8 font-display text-lg font-bold text-ink">6.2 Propuesta: tonos y variantes</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">Mismos 4 tonos de 2.4, en 3 tratamientos: relleno, suave, y solo borde.</p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wide text-ink/40">
                <th className="pb-3">Tono</th>
                <th className="pb-3">Relleno</th>
                <th className="pb-3">Suave</th>
                <th className="pb-3">Borde</th>
              </tr>
            </thead>
            <tbody>
              {SEMANTIC_TONES.map((t) => (
                <tr key={t.name} className="border-t border-black/5">
                  <td className="py-3 pr-4 text-ink/60">{t.name}</td>
                  <td className="py-3 pr-4">
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${t.solidClass}`}>{t.example}</span>
                  </td>
                  <td className="py-3 pr-4">
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${t.softClass}`}>{t.example}</span>
                  </td>
                  <td className="py-3">
                    <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${t.outlineClass}`}>{t.example}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="mt-8 font-display text-lg font-bold text-ink">6.3 Propuesta: chip descartable</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">Para filtros activos de catálogo — hacé clic en la X para sacar uno.</p>
        <div className="mt-3 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
          <DismissibleChip initialLabels={['Monitores', 'En stock', 'Envío gratis']} />
        </div>
      </section>

      {/* Acordeón */}
      <section id="acordeon" className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink">7. Acordeón (FAQ, propuesta)</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Referencia de Vireo (Accordions.tsx). No existe una sección de preguntas frecuentes en el sitio
          todavía — cada respuesta de abajo reusa texto real que ya existe (`WHY_CHOOSE_US`/`CONTACT_INFO` en
          `content.ts`), reformulado como pregunta, no es copy inventado.
        </p>
        <div className="mt-5 max-w-2xl">
          <FaqAccordion />
        </div>
      </section>

      {/* Ribbons */}
      <section id="ribbons" className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink">8. Ribbons / banderines (propuesta)</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Referencia de Vireo (Ribbons.tsx). Banderín rotado en la esquina — una alternativa al badge plano
          que ya usan los descuentos en la tienda.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Sobre imagen</p>
            <div className="relative overflow-hidden rounded-2xl border border-black/10 shadow-sm">
              <img src={SOLUTIONS[4].image} alt={SOLUTIONS[4].title} className="h-48 w-full object-cover" />
              <div className="absolute -right-11 top-6 w-40 rotate-45 bg-brand-primary py-1 text-center text-[11px] font-bold uppercase tracking-wide text-white shadow-md">
                Destacado
              </div>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Sobre tarjeta blanca</p>
            <div className="relative overflow-hidden rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
              <div className="absolute -right-10 top-5 w-36 rotate-45 bg-emerald-500 py-1 text-center text-[10px] font-bold uppercase tracking-wide text-white shadow-md">
                Oferta
              </div>
              <Icon name={SOLUTIONS[4].icon} className="h-7 w-7 text-brand-primary" />
              <h5 className="mt-4 text-base font-semibold text-ink">{SOLUTIONS[4].title}</h5>
              <p className="mt-1 text-xs text-ink/50">{SOLUTIONS[4].tag}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Chat / Asistente virtual */}
      <section id="chat" className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink">9. Chat / Asistente virtual</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          El widget de chat (<code className="text-ink/70">ChatWidget.tsx</code>) vive una sola vez, global en
          las 6 páginas — no se muestra acá el componente real flotante (ya está flotando abajo a la derecha
          en esta misma página) sino una reconstrucción estática, contenida, de sus dos piezas.
        </p>

        <h3 className="mt-8 font-display text-lg font-bold text-ink">9.1 Ícono del launcher</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">Los 2 estados reales del botón flotante — burbuja con puntos cuando está cerrado, X cuando está abierto.</p>
        <div className="mt-3 flex gap-8 rounded-2xl border border-black/10 bg-paper p-8">
          <div className="flex flex-col items-center gap-2">
            <span className="btn-glow launcher-ring relative flex h-14 w-14 items-center justify-center rounded-2xl text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path
                  d="M12 3a8 8 0 0 0-8 8c0 1.6.5 3.1 1.4 4.3L4 20l4.9-1.3c1.2.7 2.6 1.1 4.1 1.1a8 8 0 0 0 0-16Z"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinejoin="round"
                />
                <circle cx="8.6" cy="11" r="1.1" fill="currentColor" />
                <circle cx="12" cy="11" r="1.1" fill="currentColor" />
                <circle cx="15.4" cy="11" r="1.1" fill="currentColor" />
              </svg>
            </span>
            <p className="text-xs text-ink/50">Cerrado</p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="btn-glow flex h-14 w-14 items-center justify-center rounded-2xl text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </span>
            <p className="text-xs text-ink/50">Abierto</p>
          </div>
        </div>

        <p className="mt-5 max-w-2xl text-sm text-ink/55">Más opciones de forma para comparar — mismo ícono, distinto radio de esquina.</p>
        <div className="mt-3 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {LAUNCHER_SHAPES.map((s) => (
            <div key={s.name} className="flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white p-5 text-center shadow-sm">
              <span className={`btn-glow flex h-14 w-14 items-center justify-center text-white ${s.className}`}>
                <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                  <path
                    d="M12 3a8 8 0 0 0-8 8c0 1.6.5 3.1 1.4 4.3L4 20l4.9-1.3c1.2.7 2.6 1.1 4.1 1.1a8 8 0 0 0 0-16Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <circle cx="8.6" cy="11" r="1.1" fill="currentColor" />
                  <circle cx="12" cy="11" r="1.1" fill="currentColor" />
                  <circle cx="15.4" cy="11" r="1.1" fill="currentColor" />
                </svg>
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{s.name}</p>
                <p className="mt-1 text-xs text-ink/50">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-sm text-ink/55">Otros glifos para comparar — misma forma y efecto, distinto ícono adentro.</p>
        <div className="mt-3 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {LAUNCHER_ICONS.map((i) => (
            <div key={i.name} className="flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white p-5 text-center shadow-sm">
              <span className="btn-glow launcher-ring relative flex h-14 w-14 items-center justify-center rounded-2xl text-white">{i.icon}</span>
              <p className="text-sm font-semibold text-ink">{i.name}</p>
            </div>
          ))}
        </div>

        <p className="mt-8 max-w-2xl text-sm text-ink/55">Tipos de efecto para el botón — con y sin animación alrededor o adentro del ícono.</p>
        <div className="mt-3 grid grid-cols-2 gap-5 sm:grid-cols-4">
          {LAUNCHER_EFFECTS.map((e) => (
            <div key={e.name} className="flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white p-5 text-center shadow-sm">
              <span className={`btn-glow flex h-14 w-14 items-center justify-center rounded-2xl text-white ${e.wrapClassName}`}>
                <BubbleDotsIcon className={e.iconClassName ? `h-6 w-6 ${e.iconClassName}` : 'h-6 w-6'} />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{e.name}</p>
                <p className="mt-1 text-xs text-ink/50">{e.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-8 font-display text-lg font-bold text-ink">9.2 Cómo se ve al abrirse</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Vista inicial ("¿Cómo te ayudamos?") de cada modelo — mismo header (<code className="text-ink/70">HeaderBg</code>),
          radio de esquina y tipografía de label que usa el componente real, solo importados directo del mismo archivo.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CHAT_MODELS.map(({ name, variant }) => (
            <div key={name}>
              <p className="mb-2 text-sm font-semibold text-ink">{name}</p>
              <div className={`glass-panel relative w-full overflow-hidden ${variant.panelRadius}`}>
                {variant.cornerAccent && <div className="absolute -right-8 -top-8 z-10 h-16 w-16 rotate-45 bg-brand-primary" aria-hidden />}
                <div className="relative flex items-center px-4 py-3.5 text-white">
                  <HeaderBg look={variant.header} />
                  <p className={`relative ${variant.labelClass}`}>¿Cómo te ayudamos?</p>
                </div>
                <div className="flex flex-col gap-2.5 p-4">
                  <div style={{ '--tint': '#10b981' } as CSSProperties} className="option-card flex items-center gap-3 rounded-2xl p-3 text-left">
                    <span className="icon-hop flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                        <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2Zm0 18a8 8 0 0 1-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1 1 12 20Zm4.4-5.9c-.2-.1-1.4-.7-1.6-.8-.2-.1-.4-.1-.5.1-.2.2-.6.8-.8 1-.1.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4c.1-.1.2-.3.2-.4.1-.2 0-.3 0-.4l-.7-1.7c-.2-.4-.4-.4-.5-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 1.9s.8 2.2.9 2.4c.1.2 1.6 2.5 4 3.5.6.2 1 .4 1.3.5.6.2 1.1.1 1.5 0 .5-.1 1.4-.6 1.6-1.1.2-.5.2-1 .1-1.1-.1-.1-.2-.2-.4-.3Z" />
                      </svg>
                    </span>
                    <span>
                      <p className="text-sm font-semibold text-ink">WhatsApp</p>
                      <p className="text-xs text-ink/55">Hablá directo con un asesor</p>
                    </span>
                  </div>
                  <div style={{ '--tint': 'var(--color-brand-primary)' } as CSSProperties} className="option-card flex items-center gap-3 rounded-2xl p-3 text-left">
                    <span className="icon-hop flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-primary text-white shadow-sm shadow-brand-primary/30">
                      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                        <path d="M12 3a8 8 0 0 0-8 8c0 1.6.5 3.1 1.4 4.3L4 20l4.9-1.3c1.2.7 2.6 1.1 4.1 1.1a8 8 0 0 0 0-16Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                        <circle cx="9" cy="11" r="1" fill="currentColor" />
                        <circle cx="12" cy="11" r="1" fill="currentColor" />
                        <circle cx="15" cy="11" r="1" fill="currentColor" />
                      </svg>
                    </span>
                    <span>
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                        Asistente virtual
                        <span className="online-dot h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      </p>
                      <p className="text-xs text-ink/55">Respuestas rápidas, al instante</p>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Efectos */}
      <section id="efectos" className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink">10. Efectos</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Catálogo de las animaciones reutilizables de <code className="text-ink/70">globals.css</code>, más
          allá de los efectos de botón (sección 2) y de ícono en hover (2.1/2.2). Todas están en uso real en
          el sitio hoy — ninguna es propuesta.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white p-6 text-center shadow-sm">
            <h4 className="text-sm font-semibold text-ink">Pulso — grande</h4>
            <div className="flex h-16 items-center justify-center">
              <span className="btn-glow launcher-ring relative flex h-10 w-10 items-center justify-center rounded-xl text-white">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                </svg>
              </span>
            </div>
            <p className="text-xs text-ink/55">
              <code className="text-ink/70">.launcher-ring</code> — anillo detrás del ícono del chat (ver 9.1). Usa la keyframe{' '}
              <code className="text-ink/70">ring-pulse</code>.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white p-6 text-center shadow-sm">
            <h4 className="text-sm font-semibold text-ink">Pulso — chico</h4>
            <div className="flex h-16 items-center justify-center">
              <span className="online-dot h-3 w-3 rounded-full bg-emerald-500" />
            </div>
            <p className="text-xs text-ink/55">
              <code className="text-ink/70">.online-dot</code> — punto "en línea" junto a "Asistente virtual" en el chat. Misma
              keyframe <code className="text-ink/70">ring-pulse</code>, más rápida y sin ícono adentro.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white p-6 text-center shadow-sm">
            <h4 className="text-sm font-semibold text-ink">Flotación continua</h4>
            <div className="flex h-16 items-center justify-center">
              <div className="animate-float-slow flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                <Icon name="cloud" className="h-5 w-5" />
              </div>
            </div>
            <p className="text-xs text-ink/55">
              <code className="text-ink/70">.animate-float-slow</code> — sube y baja en loop. La usa la imagen/forma del hero en
              los 6 modelos.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white p-6 text-center shadow-sm">
            <h4 className="text-sm font-semibold text-ink">Zoom lento</h4>
            <div className="flex h-16 items-center justify-center overflow-hidden">
              <div className="animate-zoom-slow h-14 w-14 rounded-full bg-brand-primary/25 blur-md" />
            </div>
            <p className="text-xs text-ink/55">
              <code className="text-ink/70">.animate-zoom-slow</code> — el círculo decorativo desenfocado detrás del hero del
              Modelo 2.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white p-6 text-center shadow-sm">
            <h4 className="text-sm font-semibold text-ink">Marquee</h4>
            <div className="flex h-16 w-full items-center overflow-hidden">
              <div className="animate-marquee flex w-max items-center gap-6 text-xs font-semibold text-ink/40">
                {[...Array(2)].map((_, r) => (
                  <div key={r} className="flex items-center gap-6">
                    {['ASUS', 'DELL', 'HP', 'LENOVO', 'AXIS'].map((b) => (
                      <span key={b}>{b}</span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-ink/55">
              <code className="text-ink/70">.animate-marquee</code> — la franja de marcas aliadas se desliza sola en loop
              (BrandMarquee.tsx).
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white p-6 text-center shadow-sm">
            <h4 className="text-sm font-semibold text-ink">Puntos "escribiendo..."</h4>
            <div className="flex h-16 items-center justify-center gap-1 rounded-2xl bg-ink px-4">
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/60" style={{ animationDelay: '0ms' }} />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/60" style={{ animationDelay: '150ms' }} />
              <span className="typing-dot h-1.5 w-1.5 rounded-full bg-white/60" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-xs text-ink/55">
              <code className="text-ink/70">.typing-dot</code> — indicador de "escribiendo..." antes de cada respuesta del
              asistente virtual.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white p-6 text-center shadow-sm">
            <h4 className="text-sm font-semibold text-ink">Aparece con fade</h4>
            <ReplayAnimation>
              <div className="animate-fade-up flex h-16 items-center justify-center">
                <span className="rounded-xl bg-brand-primary/10 px-4 py-2 text-sm font-semibold text-brand-primary">Tecnología para tu negocio</span>
              </div>
            </ReplayAnimation>
            <p className="text-xs text-ink/55">
              <code className="text-ink/70">.animate-fade-up</code> — entrada del texto de los heroes y, con delay escalonado
              por índice, de las tarjetas del Modelo 1.
            </p>
          </div>

          <div className="flex flex-col items-center gap-3 rounded-2xl border border-black/10 bg-white p-6 text-center shadow-sm">
            <h4 className="text-sm font-semibold text-ink">Aparece con pop</h4>
            <ReplayAnimation>
              <div className="animate-pop-in flex h-16 items-center justify-center">
                <span className="glass-card rounded-2xl bg-ink px-4 py-2.5 text-sm text-white/90">Hola 👋</span>
              </div>
            </ReplayAnimation>
            <p className="text-xs text-ink/55">
              <code className="text-ink/70">.animate-pop-in</code> — entrada de cada mensaje del chat y de los menús
              desplegables del header (ver 1).
            </p>
          </div>
        </div>
      </section>

      {/* Carrito */}
      <section id="carrito" className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink">11. Carrito</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          El mini-carrito desplegable ya existe en el header de los 6 modelos (<code className="text-ink/70">CartButton.tsx</code>)
          — acá abajo, propuestas de vista previa distintas, adaptadas de ejemplos que pasó el usuario.
        </p>

        <h3 className="mt-8 font-display text-lg font-bold text-ink">11.1 Mini-carrito del header: real + propuestas</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Mismo tipo de componente en los 3: ícono con contador → dropdown que se cierra solo al hacer clic
          afuera (no una tarjeta suelta, eso empieza en 11.2). Probalos: hacé clic en cualquier ícono.
        </p>
        <div className="mt-3 flex flex-col items-center justify-center gap-8 rounded-2xl border border-black/10 bg-paper p-8 sm:flex-row sm:gap-12">
          <div className="flex flex-col items-center gap-3">
            <CartButton />
            <p className="text-center text-xs font-semibold text-ink/60">
              Real
              <span className="mt-0.5 block max-w-[9.5rem] font-normal text-ink/40">agregar/quitar, sin stepper</span>
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <HeaderCartDropdownA initialItems={FEATURED_PRODUCTS.map((p) => ({ sku: p.sku, name: p.name, price: p.price, image: p.image, qty: 1 }))} />
            <p className="text-center text-xs font-semibold text-ink/60">
              Propuesta: con stepper
              <span className="mt-0.5 block max-w-[9.5rem] font-normal text-ink/40">cantidad por línea +/−</span>
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <HeaderCartDropdownB initialItems={FEATURED_PRODUCTS.map((p) => ({ sku: p.sku, name: p.name, price: p.price, qty: 1 }))} />
            <p className="text-center text-xs font-semibold text-ink/60">
              Propuesta: minimalista
              <span className="mt-0.5 block max-w-[9.5rem] font-normal text-ink/40">sin foto, ícono cuadrado</span>
            </p>
          </div>
        </div>

        <h3 className="mt-8 font-display text-lg font-bold text-ink">11.2 Tarjeta de carrito: propuestas tipo panel</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Mismo tipo de componente en las 4: tarjeta/panel independiente, no un dropdown de ícono (eso es
          11.1) — pensadas para una página de carrito completa o un widget lateral.
        </p>
        <div className="mt-3 grid grid-cols-1 gap-8 rounded-2xl border border-black/10 bg-paper p-8 sm:grid-cols-2">
          <div className="flex flex-col items-center gap-3">
            <MiniCartPreview initialItems={FEATURED_PRODUCTS.map((p) => ({ sku: p.sku, name: p.name, brand: p.brand, price: p.price, image: p.image, qty: 1 }))} />
            <p className="text-center text-xs font-semibold text-ink/60">
              Con stepper
              <span className="mt-0.5 block max-w-[14rem] font-normal text-ink/40">cantidad interactiva (+/−) y subtotal por línea</span>
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <CheckoutSummaryCard
              initialItems={FEATURED_PRODUCTS.slice(0, 3).map((p) => ({ sku: p.sku, name: p.name, price: p.price, image: p.image, qty: 1 }))}
              discount={20}
            />
            <p className="text-center text-xs font-semibold text-ink/60">
              Resumen tipo checkout
              <span className="mt-0.5 block max-w-[14rem] font-normal text-ink/40">look oscuro, ícono en chip circular, línea de descuento</span>
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="brand-mesh flex justify-center rounded-3xl p-4">
              <GlassCartPreview light initialItems={FEATURED_PRODUCTS.map((p) => ({ sku: p.sku, name: p.name, price: p.price, image: p.image, qty: 1 }))} />
            </div>
            <p className="text-center text-xs font-semibold text-ink/60">
              Glass claro
              <span className="mt-0.5 block max-w-[14rem] font-normal text-ink/40">mismo vidrio esmerilado en blanco, sobre .brand-mesh (misma tarjeta que 5.2)</span>
            </p>
          </div>

          <div className="flex flex-col items-center gap-3">
            <CompactCartPreview initialItems={FEATURED_PRODUCTS.map((p) => ({ sku: p.sku, name: p.name, brand: p.brand, price: p.price, qty: 1 }))} />
            <p className="text-center text-xs font-semibold text-ink/60">
              Minimalista compacta
              <span className="mt-0.5 block max-w-[14rem] font-normal text-ink/40">sin foto, stepper en línea, checkout solo-borde</span>
            </p>
          </div>
        </div>
      </section>

      {/* Comparación de productos */}
      <section id="comparacion" className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink">12. Comparación de productos</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Adaptado de un ejemplo que pasó el usuario (ProductComparisonCard). Cambio deliberado sobre el
          original: el ejemplo comparaba "features" técnicos (USB-C, panel IPS, etc.) — eso inventaría specs
          falsos sobre productos de marca real (ASUS/Dell) que no tenemos cargados. Acá se compara con datos
          reales del catálogo (SKU, precio, % de descuento) en vez de fichas técnicas inventadas.
        </p>

        <h3 className="mt-8 font-display text-lg font-bold text-ink">12.1 Propuesta: tarjeta 1 a 1</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">La del ejemplo — 2 productos lado a lado con imagen grande, pensada para comparar de a pares.</p>
        <div className="mt-3 flex justify-center">
          <ProductComparisonCard a={FEATURED_PRODUCTS[0]} b={FEATURED_PRODUCTS[1]} />
        </div>

        <h3 className="mt-8 font-display text-lg font-bold text-ink">12.2 Propuesta: tabla horizontal</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Diseño propio, no del ejemplo — mismos datos pero como tabla, para poder comparar más de 2 productos
          a la vez (acá los 4 de <code className="text-ink/70">FEATURED_PRODUCTS</code>) en vez de solo un par.
        </p>
        <div className="mt-3 overflow-x-auto rounded-2xl border border-black/5 bg-white shadow-sm">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr>
                <th className="w-28" />
                {FEATURED_PRODUCTS.map((p) => (
                  <th key={p.sku} className="p-4 text-center">
                    <div className="mx-auto mb-2 h-16 w-16 overflow-hidden rounded-lg bg-brand-primary/6">
                      <img src={p.image} alt={p.name} className="h-full w-full object-contain p-2" />
                    </div>
                    <p className="text-[10px] font-semibold uppercase text-brand-primary">{p.brand}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-center [&_td]:py-3 [&_th]:py-3">
              <tr className="border-t border-black/5">
                <th className="pl-4 text-left text-xs font-medium text-ink/45">SKU</th>
                {FEATURED_PRODUCTS.map((p) => (
                  <td key={p.sku} className="font-mono text-xs text-ink/70">
                    {p.sku}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-black/5">
                <th className="pl-4 text-left text-xs font-medium text-ink/45">Precio</th>
                {FEATURED_PRODUCTS.map((p) => (
                  <td key={p.sku} className="font-mono text-sm font-bold text-ink">
                    ${p.price.toFixed(2)}
                  </td>
                ))}
              </tr>
              <tr className="border-t border-black/5">
                <th className="pl-4 text-left text-xs font-medium text-ink/45">Descuento</th>
                {FEATURED_PRODUCTS.map((p) => (
                  <td key={p.sku} className="font-mono text-xs font-semibold text-brand-primary">
                    -{Math.round(((p.priceBefore - p.price) / p.priceBefore) * 100)}%
                  </td>
                ))}
              </tr>
              <tr className="border-t border-black/5">
                <th className="pl-4 text-left text-xs font-medium text-ink/45">Stock local</th>
                {FEATURED_PRODUCTS.map((p) => (
                  <td key={p.sku}>
                    <CheckIcon className="mx-auto h-4 w-4 text-emerald-500" />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Testimonios */}
      <section id="testimonios" className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink">13. Testimonios</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Regla del sitio: no se inventan testimonios ni reseñas de personas que no existen (ver AGENTS.md).
          Ningún modelo tiene reseñas reales todavía — el Modelo 12 es el único con la sección ya armada, con
          un estado vacío honesto en vez de nombres y frases falsas, mientras se conecta con reseñas reales
          de Google.
        </p>

        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="font-display text-lg font-bold text-ink">13.1 Diseño de la tarjeta (original)</h3>
          <a href="/modelo-12" className="text-sm font-semibold text-brand-primary hover:underline">
            Ver en Modelo 12 →
          </a>
        </div>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Diseño real de la plantilla Riteflow, home-v1 (<code className="text-ink/70">TestimonialOne</code>):
          columnas que se desplazan solas en loop vertical (2 hacia abajo, 1 en reversa hacia arriba en la
          original — acá 2 para la guía), foto + nombre + rol arriba de cada tarjeta, línea divisoria en
          degradé, texto de la reseña abajo. Con marcadores de posición en vez de nombres inventados — cuando
          haya reseñas reales de Google entran en estos mismos campos.
        </p>
        <div className="relative mt-3 grid grid-cols-1 gap-4 overflow-hidden rounded-2xl border border-black/10 bg-paper p-6 sm:grid-cols-2" style={{ height: 340 }}>
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-paper to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-paper to-transparent" />
          {[0, 1].map((col) => (
            <div key={col} className="overflow-hidden">
              <div className={`flex flex-col gap-4 ${col === 0 ? 'animate-auto-scroll-y' : 'animate-auto-scroll-y-reverse'}`}>
                {[1, 2, 1, 2].map((n, i) => (
                  <div key={i} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10.5 w-10.5 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-sm font-bold text-brand-primary">
                        ?
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">Nombre del cliente {n}</p>
                        <p className="truncate text-xs text-ink/45">Cargo / empresa</p>
                      </div>
                    </div>
                    <div className="my-4 h-px w-full bg-gradient-to-r from-brand-primary/0 via-brand-primary/30 to-brand-primary/0" />
                    <p className="text-sm text-ink/70">Texto real de la reseña, tal cual quedó publicada en Google — sin editar el contenido.</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <h3 className="mt-10 font-display text-lg font-bold text-ink">13.2 Estado actual en Modelo 12 — todavía sin reseñas</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Mientras no haya reseñas reales conectadas, la grilla de arriba no se muestra vacía ni con datos
          falsos — se reemplaza por este aviso + link a la ficha de Google del negocio (mismo componente,
          props <code className="text-ink/70">emptyStateHref</code> / <code className="text-ink/70">emptyStateLabel</code>).
        </p>
        <div className="mt-3 rounded-2xl border border-black/10 bg-paper p-10 shadow-sm">
          <div className="mx-auto max-w-[500px] text-center">
            <span className="rounded-full bg-brand-primary/10 px-3 py-1.5 text-sm font-medium text-brand-primary">Opiniones</span>
            <h4 className="mt-4 font-display text-xl font-bold text-ink">Lo que dicen quienes ya trabajaron con nosotros</h4>
            <div className="mt-5 rounded-2xl border border-black/10 bg-white px-6 py-8 shadow-sm">
              <p className="text-sm text-ink/60">
                Todavía no tenemos reseñas verificadas para mostrar acá — en vez de inventar testimonios, esta
                sección va a conectar con las reseñas reales de Google de FPTecnologi &amp; System.
              </p>
              <a
                href="https://www.google.com/maps?q=FP+Tecnologi+%26+System,+Jr.+Huaraz+1841,+Bre%C3%B1a,+Lima"
                target="_blank"
                rel="noreferrer"
                className="btn-glow mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white"
              >
                Ver reseñas en Google
              </a>
            </div>
          </div>
        </div>

        <h3 className="mt-10 font-display text-lg font-bold text-ink">13.3 Testimonio dinámico (carrusel)</h3>
        <p className="mt-1 max-w-2xl text-sm text-ink/55">
          Propuesta aparte del diseño original — carrusel horizontal (arrastrá o usá las flechas, se mueve
          solo cada 2.8s) con el orden invertido: texto de la reseña arriba, avatar + nombre + cargo/empresa
          abajo. Avatar genérico (ícono, no foto) en vez de inventar la cara de alguien que no existe.
        </p>
        <div className="mt-3">
          <TestimonialCarouselDemo />
        </div>
      </section>

      {/* Selector de moneda */}
      <section id="moneda" className="mt-16">
        <h2 className="font-display text-2xl font-bold text-ink">14. Selector de moneda (USD / PEN)</h2>
        <p className="mt-2 max-w-2xl text-sm text-ink/60">
          Todas las variantes de acá abajo usan el mismo <code className="text-ink/70">useCurrency()</code> real
          del header (<code className="text-ink/70">CurrencyContext</code>, persistido en localStorage) — no son
          mockups sueltos, es el mismo estado: tocar cualquiera cambia las demás también. Lo que cambia es
          solo el envoltorio visual.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div>
              <h4 className="font-semibold text-ink">Actual (header)</h4>
              <p className="mt-1 text-xs text-ink/50">El que está en producción hoy — outline neutro, sin animación.</p>
            </div>
            <div className="flex justify-center rounded-xl bg-paper p-6">
              <CurrencyToggle tone="light" />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div>
              <h4 className="font-semibold text-ink">Sólido con color por moneda</h4>
              <p className="mt-1 text-xs text-ink/50">Fondo lleno: azul de marca en USD, dorado (alusión a la moneda de un sol) en PEN.</p>
            </div>
            <div className="flex justify-center rounded-xl bg-paper p-6">
              <CurrencyToggleSolid />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div>
              <h4 className="font-semibold text-ink">Switch deslizante</h4>
              <p className="mt-1 text-xs text-ink/50">Las 2 opciones siempre visibles, un thumb se desliza entre ellas — se entiende de entrada que hay 2 estados.</p>
            </div>
            <div className="flex justify-center rounded-xl bg-paper p-6">
              <CurrencyToggleSwitch />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div>
              <h4 className="font-semibold text-ink">Salto al cambiar</h4>
              <p className="mt-1 text-xs text-ink/50">Mismo diseño de hoy + el `bump` de escala que ya usa el badge del carrito al agregar un producto — hacé clic para sentirlo.</p>
            </div>
            <div className="flex justify-center rounded-xl bg-paper p-6">
              <CurrencyToggleBump />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
            <div>
              <h4 className="font-semibold text-ink">Moneda al aire</h4>
              <p className="mt-1 text-xs text-ink/50">El símbolo gira 360° como una moneda real al voltear, cada vez que cambiás — hacé clic para verlo.</p>
            </div>
            <div className="flex justify-center rounded-xl bg-paper p-6">
              <CurrencyToggleCoinFlip />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
