export const contacto = {
  razonSocial: 'Fimav Perú E.I.R.L.',
  // Titular según los textos legales publicados en la web anterior de fimavperu.com (por confirmar frente a "E.I.R.L.").
  razonSocialLegal: 'FIMAV PERU S.A.C.',
  ruc: '20606256486',
  direccion:'Jr. Huaraz 1833, Urb. Azcona, Breña, Lima',
  telefono: '01 397-9527',
  telefonoHref: 'tel:+5113979527',
  // Provisional: mismo número hasta confirmar el WhatsApp comercial (formato wa.me: 51 + número).
  whatsapp: '5113979527',
  ventas: 'ventas@fimavperu.com',
  comercial: 'comercial@fimavperu.com',
};

export const waUrl = (texto: string) => `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(texto)}`;
