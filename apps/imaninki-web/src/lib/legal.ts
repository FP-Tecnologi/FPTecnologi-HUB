/*
 * Textos legales de Imaninki (BORRADOR basado en los de Fimav Perú, adaptado a Imaninki): política de privacidad, términos y
 * condiciones, y devoluciones. Se editan en el dashboard (Web Imaninki → Textos legales) y NO se publican hasta que alguien
 * los revise y active «Publicar textos legales». Párrafos separados por una línea en blanco; «## » = subtítulo.
 *
 * Marcadores que se completan al mostrar el texto: {{titular}} (razón social, RUC y domicilio cargados en
 * Admin → Marcas), {{correo}} y {{telefono}}.
 */
import { contacto } from './contenido';

export const LEGAL_SLUGS = ["privacidad","terminos","devoluciones"] as const;
export type LegalSlug = (typeof LEGAL_SLUGS)[number];

export const LEGAL_DEFAULTS: Record<LegalSlug, { titulo: string; texto: string }> = {
  privacidad: {
    titulo: "Política de privacidad",
    texto: `Esta política informa cómo {{titular}} (en adelante, “Imaninki”) trata los datos personales que recibe a través de este sitio web, formularios, correo electrónico, teléfono, WhatsApp, redes sociales y cualquier otro canal digital o presencial equivalente. Al enviarnos tus datos aceptas esta política.

## A quién va dirigida

A toda persona que visite el sitio, solicite una cotización o información, se comunique con nosotros o adquiera nuestros productos (los “Usuarios”). No se aplica a sitios web, productos o servicios de terceros a los que se pueda acceder desde este sitio.

## Qué información recopilamos

Datos personales: nombres y apellidos, documento de identidad (DNI) o RUC, correo electrónico, número de celular o teléfono, domicilio o dirección fiscal y, si corresponde, el nombre de tu empresa o entidad, además del detalle de los productos que consultas.

Datos de navegación: dirección IP, navegador, páginas visitadas, página de origen, ubicación aproximada y estadísticas de uso y tráfico del sitio.

Formularios (contacto, tickets de soporte y Libro de Reclamaciones): los datos que escribes se usan solo para atender tu solicitud, responderte y, en el caso del Libro de Reclamaciones, cumplir la normativa de protección al consumidor.

## Veracidad de los datos

La información que proporcionas debe ser verdadera, completa y exacta. Cada Usuario es responsable de su veracidad y vigencia. Imaninki puede verificarla con fuentes de acceso público cuando sea necesario para atender tu solicitud.

## Para qué la usamos

Usamos tus datos para responder tu solicitud: preparar y enviarte la cotización o la información que pediste, coordinar la venta, la entrega, la facturación y la garantía, y contactarte sobre ese pedido. No vendemos tus datos ni los cedemos a terceros con fines comerciales; solo los compartimos cuando es indispensable para cumplir la entrega o una obligación legal.

## Banco de datos y consentimiento

De acuerdo con la Ley N.° 29733, Ley de Protección de Datos Personales, y su Reglamento (Decreto Supremo N.° 003-2013-JUS), tus datos se incorporarán a un banco de datos de titularidad de Imaninki una vez que nos des tu consentimiento al enviarlos.

## Por cuánto tiempo los conservamos

Conservamos tus datos mientras sean necesarios para la finalidad para la que fueron recabados, incluso después de terminada la relación comercial, salvo que solicites su cancelación o supresión. Cumplimos siempre las obligaciones del artículo 28 de la Ley de Protección de Datos Personales.

## Tus derechos

Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (ARCO) escribiendo a {{correo}}, con tu nombre completo, documento de identidad y el derecho que deseas ejercer. También puedes acudir a la Autoridad Nacional de Protección de Datos Personales si consideras que tus derechos no fueron atendidos.`,
  },
  terminos: {
    titulo: "Términos y condiciones",
    texto: `Estos términos regulan el uso del sitio web www.imaninki.com (el “Sitio”), operado por {{titular}} (“Imaninki”), y la relación comercial con quienes solicitan cotizaciones o compran a través del Sitio y de nuestros canales de atención.

## Aceptación

Al acceder, navegar o utilizar el Sitio, el Usuario declara haber leído y aceptado estos términos y ser mayor de 18 años. Si no está de acuerdo, debe dejar de usarlo. Imaninki puede actualizar estos términos en cualquier momento publicando la nueva versión en esta página; el uso posterior del Sitio implica su aceptación.

## Cotizaciones y compras

Ofrecemos pinturas, mobiliario corporativo y productos para construcción y emergencia mediante venta directa y licitaciones públicas y privadas (incluido Perú Compras). Una cotización es una propuesta informativa y no obliga a ninguna de las partes hasta que el cliente la acepte por escrito o emita su orden de compra y Imaninki la confirme.

Cada cotización indica su vigencia, la disponibilidad del producto y si los precios incluyen o no el IGV. Pasada la vigencia, los precios y el stock pueden variar. Una vez confirmada la compra, el pedido no admite cancelaciones ni cambios, salvo lo indicado en la política de devoluciones.

## Facturación

Emitimos comprobantes de pago electrónicos. Para facturas, el cliente debe indicar su razón social, RUC y dirección fiscal.

## Entregas

Los plazos, el lugar y el costo de entrega son los indicados en cada cotización u orden de compra y dependen de la distancia del envío. Los plazos son referenciales y pueden verse afectados por la disponibilidad de los productos o del transporte.

## Garantía

Los productos cuentan con la garantía que corresponda según su tipo y condiciones, indicada en la cotización o la ficha del producto. La garantía no cubre daños por mal uso, manipulación o almacenamiento indebido, ni el desgaste normal.

## Disponibilidad del Sitio y de la información

Imaninki no garantiza la disponibilidad ni el funcionamiento ininterrumpido del Sitio, que puede verse afectado por fallas técnicas, de internet o de proveedores. Tampoco garantiza que la información publicada (descripciones, imágenes, especificaciones, colores, stock) esté libre de errores tipográficos o desactualizaciones; la información válida es la de la cotización. Imaninki no responde por daños en el equipo del Usuario originados por fallas de sistema, servidor, internet o virus.

## Obligaciones del Usuario

El Usuario se compromete a usar el Sitio conforme a la ley, a estos términos, a la moral y a las buenas costumbres. Está prohibido usar datos falsos, vulnerar la seguridad del Sitio o de sus servidores, intentar acceder a información no destinada al Usuario, introducir virus o programas dañinos, sobrecargar o interrumpir el servicio, transmitir contenido ilícito u ofensivo, o impedir a otras personas el uso del Sitio.

## Propiedad intelectual

El diseño, textos, imágenes, logotipos, marcas y demás contenidos del Sitio pertenecen a Imaninki o a sus titulares y están protegidos por las leyes del Perú y los tratados internacionales. No pueden reproducirse, distribuirse ni modificarse sin autorización. Las marcas de terceros pertenecen a sus respectivos titulares.

## Restricción de acceso

Imaninki puede denegar o retirar el acceso al Sitio a cualquier Usuario que incumpla estos términos, sin necesidad de aviso previo.

## Ley aplicable

Estos términos se rigen por las leyes de la República del Perú. Cualquier reclamo relacionado con el Sitio se somete a ellas.

## Contacto

Para cualquier consulta sobre estos términos escríbenos a {{correo}} o llámanos al {{telefono}}.`,
  },
  devoluciones: {
    titulo: "Devoluciones y cambios",
    texto: `Las devoluciones, cambios y reembolsos se rigen por esta política, por la garantía aplicable a cada producto y por el Código de Protección y Defensa del Consumidor (Ley N.° 29571), en lo que resulte aplicable a cada operación.

## Condiciones para una devolución o cambio

El producto debe estar en las mismas condiciones en que se entregó, conservar su embalaje original (y, en el caso de pinturas, el envase sellado y sin uso) y estar acompañado del comprobante de compra.

El envío de regreso está a cargo del cliente, salvo error nuestro.

## Cómo solicitarla

Escribe a {{correo}} indicando el número de cotización u orden de compra, el producto y el motivo. Nuestro equipo te indicará los pasos a seguir.

## Producto dañado, incorrecto o con falla

Si recibes un producto dañado o distinto al solicitado, repórtalo a Imaninki lo antes posible para atender tu solicitud. Cuando corresponda, se repone el producto o se atiende por garantía.

## Reembolsos

Cuando corresponda un reembolso, Imaninki devuelve el monto pagado por el mismo medio de pago o por depósito en la cuenta bancaria del cliente.

## Cancelaciones

Una vez realizada la compra, el pedido no puede cancelarse ni modificarse, salvo lo dispuesto en esta política o por ley.`,
  },
};

/** Texto legal en párrafos ("## " = subtítulo), como lo dibuja la página. */
export const parrafosDe = (texto: string) => texto.replace(/\r/g, '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

/** Razón social, RUC y domicilio de la marca (lo cargado en Admin → Marcas); sin ellos queda solo el nombre comercial. */
export function titularDe(p: { razonSocial: string; ruc: string; direccion: string }) {
  return `${p.razonSocial}${p.ruc ? `, con RUC N.° ${p.ruc}` : ''}${p.direccion ? ` y domicilio en ${p.direccion}` : ''}`;
}

/** Completa los marcadores {{titular}}, {{correo}} y {{telefono}} del texto. */
export const rellenar = (texto: string, titular: string) => texto.replaceAll('{{titular}}', titular).replaceAll('{{correo}}', contacto.correo).replaceAll('{{telefono}}', contacto.telefono);
