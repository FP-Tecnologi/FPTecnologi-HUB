'use client';

import { useMemo } from 'react';
import { Particles, ParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import type { ISourceOptions } from '@tsparticles/engine';

/*
 * Efecto de partículas del Hero de Modelo 1 -- mismo look pedido por el
 * usuario (vincentgarreau.com/particles.js): puntos conectados por líneas,
 * que se "agarran" (grab) al pasar el mouse y sueltan más puntos al hacer
 * click. Se usa tsParticles (sucesor mantenido de particles.js, que dejó de
 * actualizarse) en vez de la librería original. API v4: el engine se
 * registra en <ParticlesProvider init>, <Particles> solo se monta una vez
 * que ese provider avisa "loaded" (ver node_modules/@tsparticles/react).
 */
export function ParticlesBackground() {
  const options: ISourceOptions = useMemo(
    () => ({
      fullScreen: { enable: false },
      background: { color: { value: 'transparent' } },
      fpsLimit: 60,
      particles: {
        number: { value: 70, density: { enable: true, width: 1200, height: 800 } },
        color: { value: '#47a9f5' },
        shape: { type: 'circle' },
        opacity: { value: 0.5 },
        size: { value: { min: 1, max: 3 } },
        links: { enable: true, distance: 150, color: '#1992f0', opacity: 0.5, width: 1 },
        move: { enable: true, speed: 1.2, direction: 'none', random: false, straight: false, outModes: { default: 'out' } },
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'grab' },
          onClick: { enable: true, mode: 'push' },
          resize: { enable: true },
        },
        modes: {
          grab: { distance: 160, links: { opacity: 0.6 } },
          push: { quantity: 3 },
        },
      },
      detectRetina: true,
    }),
    []
  );

  return (
    <ParticlesProvider init={async (engine) => { await loadSlim(engine); }}>
      <Particles id="hero-particles" options={options} className="absolute inset-0" />
    </ParticlesProvider>
  );
}
