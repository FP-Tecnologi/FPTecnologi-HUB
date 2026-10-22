export const contacto = {
  razonSocial: 'Fimav Perú E.I.R.L.',
  // Razón social confirmada por la empresa: Fimav Perú E.I.R.L. (la web anterior decía "S.A.C.").
  razonSocialLegal: 'Fimav Perú E.I.R.L.',
  // RUC confirmado por la empresa para Fimav Perú E.I.R.L. (2026-10-22). Respaldo local: la hoja usa el de Admin → Marcas si existe.
  ruc: '20606256486',
  direccion:'Jr. Huaraz 1833, Urb. Azcona, Breña, Lima',
  telefono: '01 397-9527',
  telefonoHref: 'tel:+5113979527',
  // PROVISIONAL (marcador 999 999 999 a pedido de la empresa): reemplazar por el WhatsApp comercial real (wa.me: 51 + 9 dígitos).
  whatsapp: '51999999999',
  whatsappVisible: '999 999 999',
  ventas: 'ventas@fimavperu.com',
  comercial: 'comercial@fimavperu.com',
};

export const waUrl = (texto: string) => `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(texto)}`;
