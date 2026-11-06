'use client';

import dynamic from 'next/dynamic';

// Las partículas son decoración: su motor (tsparticles) se baja después del primer pintado, no en el JS inicial.
export const ParticlesBackground = dynamic(() => import('./ParticlesBackground').then((m) => m.ParticlesBackground), { ssr: false });
