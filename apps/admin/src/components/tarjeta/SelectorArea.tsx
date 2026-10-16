'use client';
/* Área de la tarjeta: se elige de la lista o, con «Otra…», se escribe a mano. */
import { useState } from 'react';

export const AREAS = ['Comercial', 'Ventas', 'Marketing', 'Servicios', 'Tienda', 'Partners', 'Soporte técnico', 'Logística', 'Finanzas', 'Dirección', 'Administración'];

export function SelectorArea({ id, valor, onCambio }: { id: string; valor: string; onCambio: (v: string) => void }) {
  // «Otra» queda activa si el área guardada no está en la lista o si se eligió la opción.
  const [otra, setOtra] = useState(false);
  const esOtra = otra || (valor !== '' && !AREAS.includes(valor));
  return (
    <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap' }}>
      <select
        id={id}
        className="ax-select"
        value={esOtra ? '__otra' : valor}
        onChange={(e) => {
          if (e.target.value === '__otra') { setOtra(true); onCambio(''); } else { setOtra(false); onCambio(e.target.value); }
        }}
      >
        <option value="">Sin área</option>
        {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
        <option value="__otra">Otra…</option>
      </select>
      {esOtra && <input className="ax-input" aria-label="Escribe el área" placeholder="Escribe el área" maxLength={40} value={valor} onChange={(e) => onCambio(e.target.value)} autoFocus={otra} />}
    </div>
  );
}
