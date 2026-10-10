// Número de WhatsApp de ventas de Quamtu (Perú +51). Provisional hasta tener checkout propio.
export const WHATSAPP = '51975646074';

export const waUrl = (texto: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`;
