/*
 * Páginas legales (footer → Legales). BORRADOR: textos base redactados para
 * una empresa peruana de venta B2B y servicios TI -- deben revisarse con
 * asesoría legal y completarse con la razón social y el RUC antes de publicar.
 */
import { CONTACT_INFO } from './content';

export const LEGAL_LINKS = [
  { label: 'Política de privacidad', href: '/legal/privacidad' },
  { label: 'Términos y condiciones', href: '/legal/terminos' },
  { label: 'Cambios y devoluciones', href: '/legal/devoluciones' },
  { label: 'Libro de reclamaciones', href: '/libro-de-reclamaciones' },
] as const;

export type LegalDoc = {
  slug: string;
  titulo: string;
  destacado: string;
  resumen: string;
  actualizado: string;
  secciones: { id: string; titulo: string; parrafos: string[] }[];
};

const EMPRESA = 'FPTecnologi & System';
const CORREO = CONTACT_INFO.email;

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: 'privacidad',
    titulo: 'Política de',
    destacado: 'privacidad',
    resumen: 'Cómo recopilamos, usamos y protegemos tus datos personales, conforme a la Ley N.° 29733.',
    actualizado: '30 de septiembre de 2026',
    secciones: [
      {
        id: 'responsable',
        titulo: 'Responsable del tratamiento',
        parrafos: [
          `${EMPRESA}, con domicilio en ${CONTACT_INFO.address}, es responsable del tratamiento de los datos personales que nos compartes a través de este sitio web, el chat y nuestros canales de atención.`,
        ],
      },
      {
        id: 'datos',
        titulo: 'Datos que recopilamos',
        parrafos: [
          'Nombre, empresa, correo electrónico, teléfono y el contenido de tus mensajes o solicitudes de cotización.',
          'Las conversaciones con nuestro asistente virtual y con nuestros asesores, para darte seguimiento.',
          'Datos técnicos de navegación (tipo de dispositivo, páginas visitadas) de forma agregada, para mejorar el sitio.',
        ],
      },
      {
        id: 'finalidad',
        titulo: 'Para qué usamos tus datos',
        parrafos: [
          'Responder tus consultas, preparar cotizaciones, procesar pedidos y brindarte soporte técnico.',
          'Enviarte información comercial relacionada con nuestros productos y servicios, solo si nos das tu consentimiento. Puedes retirarlo en cualquier momento.',
        ],
      },
      {
        id: 'conservacion',
        titulo: 'Conservación y seguridad',
        parrafos: [
          'Guardamos tus datos mientras sean necesarios para las finalidades descritas o por los plazos que exige la ley, con medidas técnicas y organizativas para protegerlos de accesos no autorizados.',
        ],
      },
      {
        id: 'derechos',
        titulo: 'Tus derechos',
        parrafos: [
          `Puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (ARCO) escribiéndonos a ${CORREO}. Te responderemos dentro de los plazos de ley.`,
        ],
      },
    ],
  },
  {
    slug: 'terminos',
    titulo: 'Términos y',
    destacado: 'condiciones',
    resumen: 'Las reglas de uso de este sitio y las condiciones de nuestras cotizaciones, ventas y servicios.',
    actualizado: '30 de septiembre de 2026',
    secciones: [
      {
        id: 'uso',
        titulo: 'Uso del sitio',
        parrafos: [
          `Al navegar en este sitio aceptas estos términos. El contenido (textos, imágenes, marcas y logotipos) pertenece a ${EMPRESA} o a sus respectivos titulares y no puede usarse sin autorización.`,
        ],
      },
      {
        id: 'precios',
        titulo: 'Precios y cotizaciones',
        parrafos: [
          'Los precios de la tienda se muestran en dólares americanos (con conversión referencial a soles) y no incluyen IGV (18%), que se suma en el carrito.',
          'Las cotizaciones tienen la vigencia indicada en cada documento y están sujetas a disponibilidad de stock.',
        ],
      },
      {
        id: 'pedidos',
        titulo: 'Pedidos y entregas',
        parrafos: [
          'Un pedido se confirma cuando recibes nuestra confirmación por correo. Los plazos de entrega se coordinan según el producto, el stock y la ubicación.',
        ],
      },
      {
        id: 'garantia',
        titulo: 'Garantía',
        parrafos: [
          'Los productos cuentan con la garantía oficial del fabricante. Los servicios de implementación incluyen el soporte indicado en cada propuesta.',
        ],
      },
      {
        id: 'cambios',
        titulo: 'Cambios a estos términos',
        parrafos: ['Podemos actualizar estos términos. La versión vigente es la publicada en esta página, con su fecha de actualización.'],
      },
    ],
  },
  {
    slug: 'devoluciones',
    titulo: 'Cambios y',
    destacado: 'devoluciones',
    resumen: 'Qué hacer si un producto llega con fallas o no es lo que pediste.',
    actualizado: '30 de septiembre de 2026',
    secciones: [
      {
        id: 'plazo',
        titulo: 'Plazo para solicitarlo',
        parrafos: [
          'Puedes solicitar un cambio o devolución dentro de los 7 días calendario desde la entrega, siempre que el producto esté sin uso, con su empaque original, accesorios y comprobante.',
        ],
      },
      {
        id: 'fallas',
        titulo: 'Productos con fallas',
        parrafos: [
          'Si el producto presenta fallas de fábrica, lo evaluamos con el servicio técnico autorizado de la marca y aplicamos la garantía correspondiente: reparación, cambio o devolución.',
        ],
      },
      {
        id: 'excepciones',
        titulo: 'Excepciones',
        parrafos: ['No aplican cambios en productos con daños por mal uso, instalaciones de terceros, ni en equipos configurados o fabricados a pedido.'],
      },
      {
        id: 'como',
        titulo: 'Cómo solicitarlo',
        parrafos: [
          `Escríbenos a ${CORREO} o por WhatsApp con tu número de pedido y fotos del producto. Te indicaremos los pasos y, de corresponder, el reembolso se hace por el mismo medio de pago.`,
        ],
      },
    ],
  },
];
