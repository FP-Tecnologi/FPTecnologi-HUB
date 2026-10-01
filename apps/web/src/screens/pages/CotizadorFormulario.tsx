'use client';
/*
 * FPTecnologi-HUB — Cotizador → Formulario: CMS del formulario público
 * /cotizador de la web (textos, opciones de "¿qué necesitas cotizar?", beneficios
 * y mensaje de gracias). Los campos del lead son fijos (los exige la API); lo
 * editable es lo que ve el cliente. Reusa el editor del CMS de la home.
 */
import { CmsEditor, type CmsConfig } from './WebHomeCms';

const CONFIG: CmsConfig = {
  pagina: 'cotizador',
  titulo: 'Formulario del cotizador',
  subtitulo: 'Edita los textos y las opciones del formulario que ve el cliente. Los cambios se publican al guardar.',
  previewPath: '/cotizador',
  conVisible: false,
  secciones: [
    {
      key: 'hero',
      nombre: 'Encabezado',
      ancla: '',
      campos: [
        { key: 'titulo', label: 'Título — parte en color sólido', tipo: 'text' },
        { key: 'destacado', label: 'Título — parte con brillo', tipo: 'text' },
        { key: 'descripcion', label: 'Descripción', tipo: 'textarea' },
      ],
    },
    {
      key: 'pasos',
      nombre: 'Pasos del formulario',
      ancla: '',
      campos: [{ key: 'items', label: 'Los 3 pasos (necesidad · datos · contacto)', tipo: 'lista-items', itemLabel: 'Paso' }],
    },
    {
      key: 'intereses',
      nombre: 'Servicios y productos de interés',
      ancla: '',
      campos: [
        { key: 'items', label: 'Opciones que puede elegir el cliente', tipo: 'lista-items', itemLabel: 'Opción' },
        { key: 'permitirOtro', label: 'Permitir la opción «Otro»', tipo: 'bool' },
        { key: 'mostrarMensaje', label: 'Mostrar caja de mensaje adicional', tipo: 'bool' },
        { key: 'mensajeLabel', label: 'Texto de la caja de mensaje', tipo: 'text' },
      ],
    },
    {
      key: 'beneficios',
      nombre: 'Beneficios (columna lateral)',
      ancla: '',
      campos: [{ key: 'items', label: 'Beneficios', tipo: 'lista-items', itemLabel: 'Beneficio' }],
    },
    {
      key: 'gracias',
      nombre: 'Mensaje de agradecimiento',
      ancla: '',
      campos: [
        { key: 'titulo', label: 'Título', tipo: 'text' },
        { key: 'mensaje', label: 'Mensaje', tipo: 'textarea' },
        { key: 'botonTexto', label: 'Texto del botón', tipo: 'text', ayuda: 'Vacío = sin botón' },
        { key: 'botonUrl', label: 'Enlace del botón', tipo: 'text' },
      ],
    },
  ],
};

export function CotizadorFormulario() {
  return <CmsEditor config={CONFIG} />;
}

export default CotizadorFormulario;
