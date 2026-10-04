/*
 * Datos de contacto por área. EJEMPLO: los teléfonos de ventas/ventas web y el
 * correo de ventas son los reales del sitio; el resto de correos y anexos son
 * provisionales -- reemplazar por los reales de cada área.
 */
export type AreaContacto = {
  area: string;
  descripcion: string;
  telefono: string;
  email: string;
  icono: 'comercial' | 'ventas' | 'marketing' | 'soporte' | 'atencion' | 'administracion';
};

export const AREAS_CONTACTO: AreaContacto[] = [
  { area: 'Comercial', descripcion: 'Proyectos, licitaciones y cuentas corporativas.', telefono: '+51 970 614 881', email: 'comercial@fptecnologi.com', icono: 'comercial' },
  { area: 'Ventas', descripcion: 'Tienda B2B, cotizaciones y compras por volumen.', telefono: '+51 970 614 881', email: 'ventasweb@fptecnologi.com', icono: 'ventas' },
  { area: 'Marketing', descripcion: 'Alianzas, campañas y prensa.', telefono: '+51 908 856 286', email: 'marketing@fptecnologi.com', icono: 'marketing' },
  { area: 'Soporte técnico', descripcion: 'Garantías, revisión de equipos y postventa.', telefono: '+51 908 856 286', email: 'soporte@fptecnologi.com', icono: 'soporte' },
  { area: 'Atención al cliente', descripcion: 'Consultas, pedidos y seguimiento.', telefono: '+51 908 856 286', email: 'atencion@fptecnologi.com', icono: 'atencion' },
  { area: 'Administración', descripcion: 'Facturación, pagos y documentos.', telefono: '+51 908 856 286', email: 'administracion@fptecnologi.com', icono: 'administracion' },
];
