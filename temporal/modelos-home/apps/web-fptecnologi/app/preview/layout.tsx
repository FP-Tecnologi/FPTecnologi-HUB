import '../../src/_riteflow-original/styles/globals.css';
import HeaderFooterWrapper from '@riteflow/components/Layouts/HeaderFooterWrapper';

/*
 * Layout SOLO para /preview/riteflow-home-v1 y /preview/riteflow-home-v2 --
 * páginas temporales que muestran la plantilla Riteflow TAL CUAL vino
 * (contenido, copy y assets originales en inglés, sin adaptar a
 * FPTecnologi), a pedido explícito del usuario: "quiero que copies primero
 * el home page indigo, no que ya lo edites según mi tema". Sirve para que
 * el usuario vea cada componente real antes de decidir qué adaptar --
 * comparar con /modelo-riteflow (la versión ya adaptada).
 *
 * Se importa acá (no en el layout raíz) para que el CSS/HeaderFooterWrapper
 * originales de Riteflow NO afecten el resto del sitio (los otros 12
 * modelos). Sin Preloader/LenisProvider/NextTopLoader del root layout
 * original -- son splash screen + smooth-scroll globales, no hacen falta
 * para revisar los componentes y tocarían el <body> real del sitio.
 *
 * Borrar junto con las dos páginas de /preview/riteflow-* y
 * src/_riteflow-original/ cuando se termine de decidir qué copiar al
 * modelo definitivo.
 */
export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  // El body/html reales del sitio (definidos en app/globals.css, layout raíz)
  // le ganan la cascada al `body { @apply bg-secondary }` del globals.css de
  // Riteflow (dos `@import "tailwindcss"` en la misma app, el de Riteflow no
  // termina pisando el body real) -- texto blanco quedaba sobre fondo claro,
  // invisible. Fix: fondo oscuro explícito acá en vez de depender del body.
  return (
    <div className="bg-[#0e1422] text-[#fbfbfb]">
      <HeaderFooterWrapper>{children}</HeaderFooterWrapper>
    </div>
  );
}
