/** Celda CSV entre comillas; lo que empieza como fórmula (= + - @) lleva apóstrofo para que Excel no lo ejecute. */
const celda = (v: unknown) => `"${String(v ?? '').replace(/^([=+\-@\t\r])/, "'$1").replace(/"/g, '""')}"`;

/** Descarga una tabla como CSV (con BOM para que Excel lea los acentos). */
export function descargarCsv(nombre: string, cabecera: string[], filas: unknown[][]) {
  const texto = [cabecera, ...filas].map((f) => f.map(celda).join(',')).join('\r\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + texto], { type: 'text/csv;charset=utf-8' }));
  a.download = `${nombre}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
