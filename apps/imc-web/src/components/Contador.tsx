"use client";

import { useEffect, useRef, useState } from "react";

/** Cuenta de 0 a `hasta` al entrar en pantalla. */
export default function Contador({ hasta, prefijo = "" }: { hasta: number; prefijo?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const paso = (t: number) => {
        const p = Math.min((t - t0) / 1400, 1);
        setN(Math.round(hasta * (1 - Math.pow(1 - p, 3))));
        if (p < 1) requestAnimationFrame(paso);
      };
      requestAnimationFrame(paso);
    });
    io.observe(el);
    return () => io.disconnect();
  }, [hasta]);
  return <span ref={ref}>{prefijo}{n}</span>;
}
