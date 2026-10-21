import { contacto } from './contacto';

const PENDIENTE = 'Texto referencial pendiente de validación por el responsable legal de Fimav Perú.';

// Los párrafos que empiezan con "## " se muestran como subtítulo (h2).
export const legal: Record<string, { titulo: string; parrafos: string[] }> = {
  privacidad: {
    titulo: 'Política de privacidad',
    parrafos: [
      `${contacto.razonSocial}, con domicilio en ${contacto.direccion}, es responsable del tratamiento de los datos personales que recibe a través de este sitio web.`,
      '## Qué datos recopilamos',
      'Cuando solicitas una cotización o nos escribes, te pedimos tus nombres, documento de identidad o RUC, correo electrónico, número de celular y, si corresponde, el nombre de tu empresa o entidad, además del detalle de los productos que necesitas.',
      '## Para qué los usamos',
      'Usamos estos datos únicamente para responder tu solicitud: preparar y enviarte la cotización, coordinar la venta, la entrega y la facturación, y contactarte sobre ese pedido. No vendemos ni cedemos tus datos a terceros con fines comerciales; solo los compartimos cuando es indispensable para cumplir la entrega o una obligación legal.',
      '## Tus derechos',
      `Conforme a la Ley N.° 29733, Ley de Protección de Datos Personales, puedes ejercer tus derechos de acceso, rectificación, cancelación y oposición (ARCO) escribiendo a ${contacto.ventas}, indicando tu nombre completo, documento de identidad y el derecho que deseas ejercer.`,
      '## Conservación',
      'Conservamos tus datos mientras sean necesarios para atender tu solicitud y cumplir obligaciones tributarias y contractuales. Luego los eliminamos o anonimizamos.',
      PENDIENTE,
    ],
  },
  terminos: {
    titulo: 'Términos y condiciones',
    parrafos: [
      `Estos términos regulan la relación comercial entre ${contacto.razonSocial} y quienes solicitan cotizaciones o compran a través de este sitio y nuestros canales de atención.`,
      '## Cotizaciones',
      'Vendemos bajo cotización a entidades del Estado (incluido Perú Compras) y a empresas privadas. Una cotización es una propuesta informativa y no obliga a ninguna de las partes hasta que el cliente la acepte por escrito o emita su orden de compra y Fimav Perú la confirme.',
      'Cada cotización indica su vigencia, la disponibilidad del producto y si los precios incluyen o no el IGV. Pasada la vigencia, los precios y el stock pueden variar.',
      '## Entregas',
      'Los plazos y el lugar de entrega son los indicados en cada cotización u orden de compra. Los plazos son referenciales y pueden verse afectados por la disponibilidad del fabricante o del transporte.',
      '## Garantía',
      'Los productos cuentan con la garantía del fabricante de cada marca, según sus condiciones y plazos. La garantía no cubre daños por mal uso, manipulación indebida ni desgaste normal.',
      '## Contacto',
      `Para cualquier consulta sobre estos términos escríbenos a ${contacto.ventas} o llámanos al ${contacto.telefono}.`,
      PENDIENTE,
    ],
  },
  devoluciones: {
    titulo: 'Devoluciones',
    parrafos: [
      'Las devoluciones y cambios se rigen por la garantía del fabricante de cada marca y por el Código de Protección y Defensa del Consumidor (Ley N.° 29571), en lo que resulte aplicable a cada operación.',
      '## Cómo solicitarla',
      `Escribe a ${contacto.ventas} indicando el número de cotización u orden de compra, el producto y el motivo de la devolución o del reclamo de garantía. Nuestro equipo te indicará los pasos a seguir.`,
      '## Condiciones',
      'Los plazos, el estado en que debe encontrarse el producto y los costos asociados son los indicados en cada cotización u orden de compra. Por lo general, el producto debe devolverse en su empaque original y con todos sus accesorios.',
      'Los equipos con defecto de fábrica se atienden por garantía con el fabricante o su servicio técnico autorizado.',
      PENDIENTE,
    ],
  },
  reclamaciones: {
    titulo: 'Libro de reclamaciones',
    parrafos: [
      `Conforme al Código de Protección y Defensa del Consumidor, ${contacto.razonSocial} pone a tu disposición su libro de reclamaciones. Puedes presentar un reclamo o una queja por correo electrónico o por teléfono.`,
      '## Datos del proveedor',
      `${contacto.razonSocial}. Domicilio: ${contacto.direccion}.`,
      '## Cómo presentarlo',
      `Escribe a ${contacto.comercial} o llama al ${contacto.telefono} indicando: tu nombre completo, documento de identidad, domicilio, correo y teléfono de contacto; la identificación del bien o servicio contratado; si se trata de un reclamo (disconformidad con el producto o servicio) o de una queja (disconformidad no relacionada con ellos); el detalle de lo ocurrido; y tu pedido concreto.`,
      '## Respuesta',
      'Atenderemos tu reclamo y te daremos respuesta en un plazo no mayor a treinta (30) días calendario, conforme a ley. Presentar un reclamo no impide acudir a Indecopi.',
      PENDIENTE,
    ],
  },
  'preguntas-frecuentes': {
    titulo: 'Preguntas frecuentes',
    parrafos: [
      '## ¿Cómo solicito una cotización?',
      'Desde la sección Cotizar, indica los productos que necesitas y tus datos de contacto. Te respondemos por correo o celular con la propuesta.',
      '## ¿En cuánto tiempo recibo la cotización?',
      'Respondemos en el menor tiempo posible, normalmente dentro de un día hábil. El tiempo de entrega de los productos se indica en la propia cotización.',
      '## ¿Emiten factura?',
      'Sí. Emitimos factura electrónica a nombre de tu empresa o entidad; los precios indican si incluyen IGV.',
      '## ¿Los productos tienen garantía?',
      'Sí, cuentan con la garantía del fabricante de cada marca. Te ayudamos a gestionarla si la necesitas.',
      '## ¿Atienden compras a través de Perú Compras?',
      'Sí. Somos proveedores de equipos de cómputo, oficina y afines para entidades del Estado. Escríbenos con tu requerimiento y te orientamos.',
      '## ¿Hacen entregas fuera de Lima?',
      'Consúltanos según tu ubicación; la cobertura y los plazos de entrega se detallan en cada cotización.',
      PENDIENTE,
    ],
  },
};
