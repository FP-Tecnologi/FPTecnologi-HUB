export const contacto = {
  razonSocial: 'Fimav Perú E.I.R.L.',
  // Razón social confirmada por la empresa: Fimav Perú E.I.R.L. (la web anterior decía "S.A.C.").
  razonSocialLegal: 'Fimav Perú E.I.R.L.',
  // RUC por confirmar: el 20606256486 de la web anterior figuraba con "S.A.C." y no se sabe si es el de la E.I.R.L.
  // Se carga en Admin → Marcas (la API lo entrega en /public/libro-reclamaciones/proveedor); vacío = no se muestra.
  ruc: '',
  direccion:'Jr. Huaraz 1833, Urb. Azcona, Breña, Lima',
  telefono: '01 397-9527',
  telefonoHref: 'tel:+5113979527',
  // Provisional: mismo número hasta confirmar el WhatsApp comercial (formato wa.me: 51 + número).
  whatsapp: '5113979527',
  ventas: 'ventas@fimavperu.com',
  comercial: 'comercial@fimavperu.com',
};

export const waUrl = (texto: string) => `https://wa.me/${contacto.whatsapp}?text=${encodeURIComponent(texto)}`;
