'use client';

import { useRef, type VideoHTMLAttributes } from 'react';

/* Reproduce solo el tramo [start, end] segundos de un video, en bucle y sin
   sonido -- evita cortar/duplicar el archivo (ponytail: sin ffmpeg; el
   navegador reutiliza el mismo mp4 que ya baja el hero). */
export function SegmentVideo({ start, end, ...props }: { start: number; end: number } & Omit<VideoHTMLAttributes<HTMLVideoElement>, 'src'> & { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  return (
    <video
      ref={ref}
      autoPlay
      muted
      playsInline
      preload="auto"
      onLoadedMetadata={() => {
        if (ref.current) ref.current.currentTime = start;
      }}
      onTimeUpdate={() => {
        const v = ref.current;
        if (v && (v.currentTime >= end || v.currentTime < start)) v.currentTime = start;
      }}
      {...props}
    />
  );
}
