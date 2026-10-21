const LIMA_MS = 5 * 3_600_000; // America/Lima = UTC-5, sin horario de verano

/** Suma días hábiles (lun-vie) contando en hora de Lima, sin depender de la zona del servidor. */
export function sumarDiasHabiles(desde: Date, dias: number): Date {
  const d = new Date(desde.getTime() - LIMA_MS);
  let restan = dias;
  while (restan > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    const dow = d.getUTCDay();
    if (dow !== 0 && dow !== 6) restan--;
  }
  return new Date(d.getTime() + LIMA_MS);
}
// ponytail: solo excluye sábado y domingo; agregar la lista de feriados nacionales si Indecopi/legal lo exige.
