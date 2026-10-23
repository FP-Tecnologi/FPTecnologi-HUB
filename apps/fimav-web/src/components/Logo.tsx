type Props = {
  className?: string;
  src?: string;
  alt?: string;
};

/*
 * Logo vectorial de Fimav Perú (public/brand, a partir del SVG oficial):
 *   fimav-peru.svg         a color, para fondos claros (por defecto)
 *   fimav-peru-blanco.svg  "FIMAV" en blanco, para fondos oscuros o sobre fotos
 *   fimav-peru-mono-*.svg  un solo color (blanco o negro), para sellos y documentos
 *   fimav-isotipo.svg      solo el símbolo (favicon, avatar)
 * Hay PNG de 1200 px de las dos primeras para usos fuera de la web (correos, redes).
 */
export default function Logo({ className = 'h-12 w-auto', src = '/brand/fimav-peru.svg', alt = 'Fimav Perú' }: Props) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} width={1127} height={457} className={className} />;
}
