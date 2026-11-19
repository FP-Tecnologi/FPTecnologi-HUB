"use client";

import { useEffect, useRef, type ReactNode } from "react";

/** Aparece (fade + desplazamiento) la primera vez que entra en pantalla. */
export default function Reveal({ children, delay = 0, dir, className = "" }: { children: ReactNode; delay?: number; dir?: "izq" | "der" | "zoom"; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([en]) => { if (en.isIntersecting) { el.classList.add("visto"); io.disconnect(); } },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} data-dir={dir} className={`rev ${className}`} style={{ ["--d" as string]: `${delay}ms` }}>
      {children}
    </div>
  );
}
