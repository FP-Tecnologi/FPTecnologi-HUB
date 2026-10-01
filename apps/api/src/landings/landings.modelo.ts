/*
 * Modelo de las landing pages: plantillas disponibles, tipos de campo del formulario, formularios
 * prediseñados y las funciones que LIMPIAN lo que llega del editor (el JSON se guarda y se pinta en la web
 * pública, así que se recorta a una lista blanca de claves y largos) y VALIDAN los registros contra el
 * formulario de esa landing. Única fuente de verdad: el dashboard pide las plantillas a la API.
 */

export const TIPOS_CAMPO = ['texto', 'textarea', 'email', 'telefono', 'documento', 'select', 'checkbox'] as const;
export type TipoCampo = (typeof TIPOS_CAMPO)[number];

export interface Campo {
  id: string; // clave en `datos`; minúsculas/números/guion bajo
  tipo: TipoCampo;
  etiqueta: string;
  requerido: boolean;
  placeholder?: string;
  opciones?: string[]; // solo select
  paso?: number; // 0-based, cuando el formulario es por pasos
}
export interface Formulario {
  pasos: string[]; // nombres de los pasos; 1 solo = formulario simple
  campos: Campo[];
  boton: string;
}
export interface Beneficio { titulo: string; texto: string }
export interface ItemAgenda { hora: string; titulo: string; texto: string }
export interface Faq { p: string; r: string }
export interface Contenido {
  badge: string;
  titulo: string;
  destacado: string;
  descripcion: string;
  imagenUrl: string;
  logoUrl: string;
  fecha: string; // texto libre: "15 al 17 de octubre de 2026"
  lugar: string;
  tema: 'azul' | 'oscuro' | 'claro';
  ctaTexto: string;
  formTitulo: string;
  formSubtitulo: string;
  exitoTitulo: string;
  exitoMensaje: string;
  beneficiosTitulo: string;
  beneficios: Beneficio[];
  agendaTitulo: string;
  agenda: ItemAgenda[];
  faqs: Faq[];
  whatsappTexto: string; // si hay, el mensaje de éxito ofrece escribir por WhatsApp con este texto
}

export interface Plantilla {
  id: 'evento' | 'oferta' | 'captacion';
  nombre: string;
  descripcion: string;
  usa: ('imagen' | 'beneficios' | 'agenda' | 'faqs' | 'fechaLugar')[]; // bloques que esa plantilla muestra
  contenido: Contenido;
  formulario: Formulario;
}

const base: Contenido = {
  badge: '',
  titulo: '',
  destacado: '',
  descripcion: '',
  imagenUrl: '',
  logoUrl: '',
  fecha: '',
  lugar: '',
  tema: 'azul',
  ctaTexto: 'Enviar',
  formTitulo: 'Déjanos tus datos',
  formSubtitulo: 'Te contactamos en menos de 24 horas.',
  exitoTitulo: '¡Gracias por registrarte!',
  exitoMensaje: 'Recibimos tus datos. Un asesor de FPTecnologi se pondrá en contacto contigo.',
  beneficiosTitulo: 'Por qué con nosotros',
  beneficios: [],
  agendaTitulo: 'Programa',
  agenda: [],
  faqs: [],
  whatsappTexto: '',
};

// ---- Formularios prediseñados (el editor deja elegir uno y luego quitar/agregar campos) ----
export const FORMULARIOS: Record<string, { nombre: string; descripcion: string; formulario: Formulario }> = {
  registro_evento: {
    nombre: 'Registro de evento (3 pasos)',
    descripcion: 'Nombres, cargo, empresa, RUC, rubro y contacto, como el registro de ferias.',
    formulario: {
      pasos: ['Sobre ti', 'Tu empresa', 'Contacto'],
      boton: 'Confirmar registro',
      campos: [
        { id: 'nombres', tipo: 'texto', etiqueta: 'Nombres', requerido: true, placeholder: 'Ej. Juan', paso: 0 },
        { id: 'apellidos', tipo: 'texto', etiqueta: 'Apellidos', requerido: true, placeholder: 'Ej. Pérez', paso: 0 },
        { id: 'cargo', tipo: 'select', etiqueta: 'Cargo', requerido: true, opciones: ['Gerencia', 'Jefatura', 'Analista', 'Ingeniero', 'Compras', 'Otro'], paso: 0 },
        { id: 'ruc', tipo: 'documento', etiqueta: 'RUC', requerido: false, placeholder: '20123456789', paso: 1 },
        { id: 'empresa', tipo: 'texto', etiqueta: 'Empresa', requerido: true, placeholder: 'Ej. Minera Andina SAC', paso: 1 },
        { id: 'rubro', tipo: 'select', etiqueta: 'Rubro', requerido: true, opciones: ['Minería', 'Construcción', 'Educación', 'Gobierno', 'Comercio', 'Otro'], paso: 1 },
        { id: 'telefono', tipo: 'telefono', etiqueta: 'Celular', requerido: true, placeholder: '999 999 999', paso: 2 },
        { id: 'email', tipo: 'email', etiqueta: 'Correo electrónico', requerido: true, placeholder: 'tucorreo@empresa.com', paso: 2 },
        { id: 'acepto', tipo: 'checkbox', etiqueta: 'Acepto que FPTecnologi use mis datos para contactarme.', requerido: true, paso: 2 },
      ],
    },
  },
  contacto_corto: {
    nombre: 'Contacto corto',
    descripcion: 'Nombre, correo y celular. Ideal para captar interesados rápido.',
    formulario: {
      pasos: ['Datos'],
      boton: 'Quiero que me contacten',
      campos: [
        { id: 'nombre', tipo: 'texto', etiqueta: 'Nombre completo', requerido: true, placeholder: 'Nombres y apellidos' },
        { id: 'email', tipo: 'email', etiqueta: 'Correo electrónico', requerido: true, placeholder: 'correo@empresa.com' },
        { id: 'telefono', tipo: 'telefono', etiqueta: 'Celular / WhatsApp', requerido: true, placeholder: '999 999 999' },
        { id: 'acepto', tipo: 'checkbox', etiqueta: 'Acepto que FPTecnologi use mis datos para contactarme.', requerido: true },
      ],
    },
  },
  cotizacion: {
    nombre: 'Pedido de cotización',
    descripcion: 'Datos de contacto, empresa y qué necesitan cotizar.',
    formulario: {
      pasos: ['Datos'],
      boton: 'Solicitar cotización',
      campos: [
        { id: 'nombre', tipo: 'texto', etiqueta: 'Nombre completo', requerido: true },
        { id: 'empresa', tipo: 'texto', etiqueta: 'Empresa o institución', requerido: false },
        { id: 'email', tipo: 'email', etiqueta: 'Correo electrónico', requerido: true },
        { id: 'telefono', tipo: 'telefono', etiqueta: 'Celular / WhatsApp', requerido: true },
        { id: 'interes', tipo: 'select', etiqueta: '¿Qué necesitas?', requerido: true, opciones: ['Equipos de cómputo', 'Servidores', 'Seguridad / cámaras', 'Videoconferencia', 'Redes', 'Otro'] },
        { id: 'detalle', tipo: 'textarea', etiqueta: 'Cuéntanos más (opcional)', requerido: false, placeholder: 'Cantidad, plazos, detalles…' },
        { id: 'acepto', tipo: 'checkbox', etiqueta: 'Acepto que FPTecnologi use mis datos para contactarme.', requerido: true },
      ],
    },
  },
};

export const PLANTILLAS: Plantilla[] = [
  {
    id: 'evento',
    nombre: 'Evento / feria',
    descripcion: 'Registro de asistencia en un evento (como EXPOMINA): título grande, fecha y lugar, formulario por pasos al costado, programa y beneficios.',
    usa: ['imagen', 'beneficios', 'agenda', 'faqs', 'fechaLugar'],
    contenido: {
      ...base,
      badge: 'Visítanos en el evento',
      titulo: 'Registra tu asistencia',
      destacado: 'a nuestro stand',
      descripcion: 'Estás en nuestro stand. Completa tus datos para dejar registrada tu visita y conocer las soluciones de FP Tecnologi & System para tu empresa.',
      fecha: '',
      lugar: '',
      ctaTexto: 'Confirmar registro',
      formTitulo: 'Registra tu asistencia',
      formSubtitulo: 'Completa tus datos y confirmamos tu ingreso.',
      beneficiosTitulo: 'F.P. Tecnologi & System',
      beneficios: [
        { titulo: 'Claridad', texto: 'Te escuchamos antes de recomendar. Sin tecnicismos ni propuestas sobredimensionadas.' },
        { titulo: 'Respaldo', texto: 'Productos originales, factura y garantía directa de un solo proveedor responsable.' },
        { titulo: 'Continuidad', texto: 'Respuesta ágil en menos de 24 horas para que tu operación nunca se detenga.' },
      ],
    },
    formulario: FORMULARIOS.registro_evento.formulario,
  },
  {
    id: 'oferta',
    nombre: 'Oferta / producto',
    descripcion: 'Promoción de un producto o servicio: imagen destacada, beneficios, preguntas frecuentes y formulario para pedir cotización.',
    usa: ['imagen', 'beneficios', 'faqs'],
    contenido: {
      ...base,
      badge: 'Oferta por tiempo limitado',
      titulo: 'Equipa tu empresa',
      destacado: 'al mejor precio',
      descripcion: 'Stock local, garantía oficial y atención personalizada. Cuéntanos qué necesitas y te enviamos tu cotización.',
      ctaTexto: 'Solicitar cotización',
      formTitulo: 'Pide tu cotización',
      formSubtitulo: 'Sin compromiso. Respondemos en menos de 24 horas.',
      beneficiosTitulo: 'Por qué comprar con nosotros',
      beneficios: [
        { titulo: 'Garantía oficial', texto: 'Equipos nuevos con garantía del fabricante.' },
        { titulo: 'Stock local', texto: 'Despacho inmediato desde Lima a todo el Perú.' },
        { titulo: 'Soporte técnico', texto: 'Instalación, configuración y soporte post venta.' },
      ],
      faqs: [{ p: '¿Emiten factura?', r: 'Sí, emitimos boleta y factura electrónica.' }],
    },
    formulario: FORMULARIOS.cotizacion.formulario,
  },
  {
    id: 'captacion',
    nombre: 'Captación simple',
    descripcion: 'Una sola pantalla: mensaje corto y formulario de contacto. Para campañas en redes o anuncios.',
    usa: ['beneficios'],
    contenido: {
      ...base,
      badge: 'Hablemos',
      titulo: 'Te ayudamos a elegir',
      destacado: 'la tecnología correcta',
      descripcion: 'Déjanos tus datos y un especialista te contacta con una propuesta a medida.',
      ctaTexto: 'Quiero que me contacten',
      beneficios: [
        { titulo: 'Asesoría personalizada', texto: 'Un especialista arma la propuesta según tu operación.' },
        { titulo: 'Sin compromiso', texto: 'Cotizar es gratis: tú decides si avanzas.' },
      ],
    },
    formulario: FORMULARIOS.contacto_corto.formulario,
  },
];

export const plantillaPorId = (id: string) => PLANTILLAS.find((p) => p.id === id);

// ------------------------------------------------------------------ limpieza

const txt = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const lista = <T>(v: unknown, max: number, f: (x: Record<string, unknown>) => T): T[] =>
  Array.isArray(v) ? v.slice(0, max).filter((x) => x && typeof x === 'object').map((x) => f(x as Record<string, unknown>)) : [];
const urlOk = (u: string) => u === '' || /^(https?:\/\/|\/)/i.test(u);

/** Recorta el contenido que manda el editor a la forma esperada (lista blanca de claves, largos máximos, URLs http/rutas). */
export function limpiarContenido(raw: unknown, previo: Contenido): Contenido {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const c = { ...previo };
  const set = <K extends keyof Contenido>(k: K, max: number) => {
    if (typeof r[k] === 'string') (c[k] as string) = txt(r[k], max);
  };
  set('badge', 80); set('titulo', 120); set('destacado', 120); set('descripcion', 600);
  set('fecha', 120); set('lugar', 160); set('ctaTexto', 60); set('formTitulo', 100); set('formSubtitulo', 200);
  set('exitoTitulo', 100); set('exitoMensaje', 400); set('beneficiosTitulo', 100); set('agendaTitulo', 100); set('whatsappTexto', 300);
  for (const k of ['imagenUrl', 'logoUrl'] as const) {
    if (typeof r[k] === 'string') {
      const u = txt(r[k], 500);
      c[k] = urlOk(u) ? u : '';
    }
  }
  if (r.tema === 'azul' || r.tema === 'oscuro' || r.tema === 'claro') c.tema = r.tema;
  if (Array.isArray(r.beneficios)) c.beneficios = lista(r.beneficios, 6, (x) => ({ titulo: txt(x.titulo, 80), texto: txt(x.texto, 240) })).filter((b) => b.titulo);
  if (Array.isArray(r.agenda)) c.agenda = lista(r.agenda, 12, (x) => ({ hora: txt(x.hora, 40), titulo: txt(x.titulo, 100), texto: txt(x.texto, 240) })).filter((a) => a.titulo);
  if (Array.isArray(r.faqs)) c.faqs = lista(r.faqs, 8, (x) => ({ p: txt(x.p, 160), r: txt(x.r, 500) })).filter((f) => f.p && f.r);
  return c;
}

/** Valida y normaliza el formulario del editor: ids únicos y seguros, tipos permitidos, opciones para select, pasos coherentes. */
export function limpiarFormulario(raw: unknown): Formulario {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const pasos = Array.isArray(r.pasos) ? r.pasos.map((p) => txt(p, 40)).filter(Boolean).slice(0, 5) : [];
  if (pasos.length === 0) pasos.push('Datos');
  const vistos = new Set<string>();
  const campos: Campo[] = [];
  for (const x of Array.isArray(r.campos) ? r.campos.slice(0, 30) : []) {
    if (!x || typeof x !== 'object') continue;
    const o = x as Record<string, unknown>;
    const tipo = TIPOS_CAMPO.find((t) => t === o.tipo);
    const id = txt(o.id, 40).toLowerCase().replace(/[^a-z0-9_]/g, '');
    const etiqueta = txt(o.etiqueta, 120);
    if (!tipo || !id || !etiqueta || vistos.has(id)) continue;
    vistos.add(id);
    const campo: Campo = { id, tipo, etiqueta, requerido: o.requerido === true };
    const ph = txt(o.placeholder, 100);
    if (ph) campo.placeholder = ph;
    if (tipo === 'select') {
      const opciones = Array.isArray(o.opciones) ? o.opciones.map((p) => txt(p, 80)).filter(Boolean).slice(0, 30) : [];
      if (opciones.length === 0) continue; // un select sin opciones no sirve
      campo.opciones = [...new Set(opciones)];
    }
    const paso = typeof o.paso === 'number' ? Math.floor(o.paso) : 0;
    campo.paso = Math.min(Math.max(paso, 0), pasos.length - 1);
    campos.push(campo);
  }
  if (campos.length === 0) throw new Error('El formulario necesita al menos un campo');
  return { pasos, campos, boton: txt(r.boton, 60) || 'Enviar' };
}

// ------------------------------------------------------------------ registros

const SOLO_DIGITOS = (s: string) => s.replace(/\D/g, '');

export function normalizarCelularPE(raw: string): string | null {
  const d = raw.replace(/[\s()-]/g, '').replace(/^\+?51(?=9\d{8}$)/, '');
  return /^9\d{8}$/.test(d) ? d : null;
}

/**
 * Valida lo que respondió una persona contra el formulario de la landing. Devuelve los datos normalizados
 * (solo ids que existen en el formulario) o lanza Error con un mensaje para mostrar.
 */
export function validarRegistro(formulario: Formulario, datos: unknown): Record<string, string | boolean> {
  const d = (datos && typeof datos === 'object' ? datos : {}) as Record<string, unknown>;
  const out: Record<string, string | boolean> = {};
  for (const c of formulario.campos) {
    const v = d[c.id];
    if (c.tipo === 'checkbox') {
      const ok = v === true || v === 'true';
      if (c.requerido && !ok) throw new Error(`Debes aceptar: ${c.etiqueta}`);
      out[c.id] = ok;
      continue;
    }
    const s = typeof v === 'string' ? v.trim() : '';
    if (!s) {
      if (c.requerido) throw new Error(`Completa: ${c.etiqueta}`);
      continue;
    }
    if (s.length > (c.tipo === 'textarea' ? 1000 : 200)) throw new Error(`${c.etiqueta} es demasiado largo`);
    if (c.tipo === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) throw new Error('Ingresa un correo válido');
      out[c.id] = s.toLowerCase();
    } else if (c.tipo === 'telefono') {
      const cel = normalizarCelularPE(s);
      if (!cel) throw new Error('Ingresa un celular válido de 9 dígitos');
      out[c.id] = cel;
    } else if (c.tipo === 'documento') {
      const dig = SOLO_DIGITOS(s);
      if (![8, 11].includes(dig.length)) throw new Error(`${c.etiqueta}: debe tener 8 (DNI) u 11 (RUC) dígitos`);
      out[c.id] = dig;
    } else if (c.tipo === 'select') {
      if (!c.opciones?.includes(s)) throw new Error(`Elige una opción válida en ${c.etiqueta}`);
      out[c.id] = s;
    } else {
      out[c.id] = s;
    }
  }
  return out;
}

/** Columnas denormalizadas para listar y exportar: nombre completo, primer correo y primer celular. */
export function resumenContacto(formulario: Formulario, datos: Record<string, string | boolean>) {
  const get = (id: string) => (typeof datos[id] === 'string' ? (datos[id] as string) : '');
  const nombre = [get('nombres') || get('nombre'), get('apellidos')].filter(Boolean).join(' ') || null;
  const email = formulario.campos.filter((c) => c.tipo === 'email').map((c) => get(c.id)).find(Boolean) || null;
  const celular = formulario.campos.filter((c) => c.tipo === 'telefono').map((c) => get(c.id)).find(Boolean) || null;
  return { nombre, email, celular };
}
