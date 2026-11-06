import type { CSSProperties } from 'react';

/*
 * Piezas visuales de BBVA para /tarjetas-bbva y el bloque del inicio.
 * Imágenes oficiales en public/images/bbva (tarjetas/<id>.webp, logos y animación).
 * Los colores de BBVA (#004481, #070E46, #001391, #85C8FF) se usan solo dentro de estos bloques;
 * el resto de la página sigue la identidad de Fimav. Animaciones en globals.css (.bbva-abanico).
 */
export const HREF_BBVA = '/tarjetas-bbva';

/** Nombre de cada nivel de gama (1 = entrada … 5 = exclusiva). */
export const GAMAS = ['', 'Gama de entrada', 'Gama media', 'Gama alta', 'Gama premium', 'Gama exclusiva'] as const;

/** Catálogo de tarjetas de crédito BBVA, de menor a mayor gama por red. */
export const TARJETAS = [
  { id: 'visa-cero', nombre: 'Visa Cero', red: 'visa', gama: 1 },
  { id: 'visa-bfree', nombre: 'Visa Bfree', red: 'visa', gama: 2 },
  { id: 'visa-platinum', nombre: 'Visa Platinum', red: 'visa', gama: 3 },
  { id: 'visa-signature', nombre: 'Visa Signature', red: 'visa', gama: 4 },
  { id: 'visa-infinite', nombre: 'Visa Infinite', red: 'visa', gama: 5 },
  { id: 'mastercard-bfree', nombre: 'Mastercard Bfree', red: 'mastercard', gama: 2 },
  { id: 'mastercard-platinum', nombre: 'Mastercard Platinum', red: 'mastercard', gama: 3 },
  { id: 'mastercard-black', nombre: 'Mastercard Black', red: 'mastercard', gama: 5 },
] as const;
export type IdTarjeta = (typeof TARJETAS)[number]['id'];
const nombre = (id: IdTarjeta) => TARJETAS.find((t) => t.id === id)!.nombre;

/** Tarjeta oficial de BBVA (vertical, proporción de tarjeta real). */
export function TarjetaBbva({ id = 'visa-cero', className = '', style, eager = false }: { id?: IdTarjeta; className?: string; style?: CSSProperties; eager?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={`/images/bbva/tarjetas/${id}.webp`} alt={`Tarjeta de crédito BBVA ${nombre(id)}`} width={252} height={400} loading={eager ? 'eager' : 'lazy'} style={style} className={`aspect-[63/100] object-contain drop-shadow-[0_18px_28px_rgba(0,19,145,0.35)] ${className}`} />
  );
}

// Posición final de cada tarjeta en el abanico (de atrás hacia adelante).
const POSICIONES = [
  { '--x': '34%', '--y': '4%', '--r': '13deg' },
  { '--x': '0%', '--y': '-6%', '--r': '0deg' },
  { '--x': '-34%', '--y': '4%', '--r': '-13deg' },
] as unknown as CSSProperties[];

/** Tres tarjetas que se abren en abanico y se vuelven a juntar (se pausa al pasar el cursor). */
export function AbanicoBbva({ ids = ['visa-signature', 'visa-platinum', 'visa-bfree'], className = '' }: { ids?: [IdTarjeta, IdTarjeta, IdTarjeta]; className?: string }) {
  return (
    <div className={`bbva-abanico relative aspect-[5/4] ${className}`}>
      {ids.map((id, i) => (
        <TarjetaBbva key={id} id={id} eager className="w-[40%]" style={POSICIONES[i]} />
      ))}
    </div>
  );
}

export function LogoBbva({ blanco = false, className = 'h-5' }: { blanco?: boolean; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`/images/bbva/logo-bbva${blanco ? '-blanco' : ''}.svg`} alt="BBVA" className={`w-auto ${className}`} />;
}
