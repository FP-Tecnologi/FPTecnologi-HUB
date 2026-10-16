/* Descarga del QR de una tarjeta (SVG que genera la API, ya vinculado con el enlace de la tarjeta). */

function guardar(blob: Blob, nombre: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = nombre;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}

export function descargarQrSvg(svg: string, slug: string) {
  guardar(new Blob([svg], { type: 'image/svg+xml' }), `qr-${slug}.svg`);
}

/** PNG de 1024 px: el SVG se dibuja en un lienzo (listo para imprimir o compartir). */
export function descargarQrPng(svg: string, slug: string): Promise<void> {
  return new Promise((resolver, rechazar) => {
    const img = new Image();
    img.onload = () => {
      const lado = 1024;
      const c = document.createElement('canvas');
      c.width = lado; c.height = lado;
      const ctx = c.getContext('2d');
      if (!ctx) return rechazar(new Error('Sin lienzo'));
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, 0, 0, lado, lado);
      c.toBlob((b) => { if (!b) return rechazar(new Error('Sin imagen')); guardar(b, `qr-${slug}.png`); resolver(); }, 'image/png');
    };
    img.onerror = () => rechazar(new Error('No se pudo leer el QR'));
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  });
}
