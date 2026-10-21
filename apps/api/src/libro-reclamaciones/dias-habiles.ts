export function sumarDiasHabiles(desde: Date, dias: number): Date {
  const d = new Date(desde);
  let restan = dias;
  while (restan > 0) {
    d.setDate(d.getDate() + 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) restan--;
  }
  return d;
}
// ponytail: solo excluye sábado y domingo; agregar la lista de feriados nacionales si Indecopi/legal lo exige.
