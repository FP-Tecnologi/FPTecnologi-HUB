'use client';
/*
 * FPTecnologi-HUB — Administración → Tarjetas digitales: el administrador de la plataforma gestiona las tarjetas de
 * cualquier marca (ver todas, crear la de quien no tiene, editar, ocultar, copiar enlace). Reutiliza la tabla del
 * equipo de una marca; aquí se elige la marca y las llamadas a la API (/tarjetas, /uploads) salen con ESA marca.
 * Cada persona sigue editando la suya en Mi cuenta → Tarjeta digital.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { setMarcaForzada, tokenStore } from '../../lib/api';
import { WebTarjetasEquipo } from './WebTarjetasEquipo';

export function TarjetasAdmin() {
  const { marcas } = useAuth();
  const [sel, setSel] = useState('');
  const [listo, setListo] = useState('');

  // Marca inicial: la última usada o la primera asignada.
  useEffect(() => {
    if (sel || marcas.length === 0) return;
    const ultima = tokenStore.getActiveMarcaId();
    setSel(marcas.some((m) => m.marcaId === ultima) ? (ultima as string) : marcas[0].marcaId);
  }, [marcas, sel]);

  // El cliente HTTP manda esta marca en cada petición (incluidas las de la vista previa y las subidas) mientras la
  // pantalla está abierta; se fija antes de montar la tabla y se suelta al salir.
  useEffect(() => {
    if (!sel) return;
    setMarcaForzada(sel);
    setListo(sel);
  }, [sel]);
  useEffect(() => () => setMarcaForzada(null), []);

  const selector = (
    <div className="ax-cluster" style={{ gap: 'var(--ax-space-2)', flexWrap: 'nowrap' }}>
      <select id="ta-marca" className="ax-select" aria-label="Filtrar por marca" style={{ width: 'auto' }} value={sel} onChange={(e) => setSel(e.target.value)}>
        {marcas.map((m) => <option key={m.marcaId} value={m.marcaId}>{m.marca.nombre}</option>)}
      </select>
    </div>
  );

  return listo && listo === sel ? <WebTarjetasEquipo key={sel} filtroMarca={selector} /> : null;
}

export default TarjetasAdmin;
