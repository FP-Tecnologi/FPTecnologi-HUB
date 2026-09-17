"use client";
import { useEffect, useRef } from "react";

type LenisLike = {
  start: () => void;
  stop: () => void;
};

export function useMobileMenu() {
  const isBoundRef = useRef(false);

  useEffect(() => {
    const body = document.body;
    const hamburger = document.querySelector<HTMLElement>(".hamburger");
    const menuClose = document.querySelectorAll<HTMLElement>(".menu-close");
    const menuWraps = document.querySelectorAll<HTMLElement>(".main-menu-wrap");
    const header = document.querySelector<HTMLElement>("header.header-area");
    const menuLis = () =>
      Array.from(document.querySelectorAll<HTMLLIElement>(".main-menu li"));

    // ✅ strictly typed lenis (no 'any')
    const lenis = (globalThis as unknown as { lenis?: LenisLike }).lenis;
    const hasLenis = typeof lenis?.stop === "function" && typeof lenis?.start === "function";

    const updateBodyOffset = () => {
      if (!header) return;
      const rect = header.getBoundingClientRect();
      const h = Math.ceil(rect.height);
      body.style.paddingTop = h > 0 ? `${h}px` : "";
    };

    const openMenu = (e?: Event) => {
      if (e) e.preventDefault();
      if (hasLenis) lenis!.stop();
      menuWraps.forEach((w) => w.classList.add("mobile-meni-active"));
      body.classList.add("overflow-hidden");
      updateBodyOffset();
    };

    const closeMenu = () => {
      if (hasLenis) lenis!.start();
      menuWraps.forEach((w) => w.classList.remove("mobile-meni-active"));
      body.classList.remove("overflow-hidden");

      menuLis().forEach((li) => {
        li.classList.remove("active");
        const sub = li.querySelector<HTMLElement>(":scope > .sub-menu, :scope > .mega-menu");
        if (sub) sub.style.display = "none";
      });

      updateBodyOffset();
    };

    const onLiClick = (e: Event) => {
      e.stopPropagation();
      const li = e.currentTarget as HTMLLIElement;
      const sub = li.querySelector<HTMLElement>(":scope > .sub-menu, :scope > .mega-menu");
      if (!sub) return;

      const willActivate = !li.classList.contains("active");
      li.classList.toggle("active", willActivate);
      sub.style.display = sub.style.display === "block" ? "none" : "block";

      const siblings = Array.from(li.parentElement?.children || []).filter((el) => el !== li) as HTMLLIElement[];
      siblings.forEach((sib) => {
        sib.classList.remove("active");
        const sibSub = sib.querySelector<HTMLElement>(":scope > .sub-menu, :scope > .mega-menu");
        if (sibSub && sibSub.style.display !== "none") sibSub.style.display = "none";
        sib.querySelectorAll(".active").forEach((nested) => nested.classList.remove("active"));
      });
      updateBodyOffset();
    };

    const bindEvents = () => {
      if (isBoundRef.current) return;
      isBoundRef.current = true;

      hamburger?.addEventListener("click", openMenu, { passive: false });
      menuClose.forEach((btn) => btn.addEventListener("click", closeMenu));
      menuLis().forEach((li) => li.addEventListener("click", onLiClick));
    };

    const unbindEvents = () => {
      if (!isBoundRef.current) return;
      isBoundRef.current = false;

      hamburger?.removeEventListener("click", openMenu);
      menuClose.forEach((btn) => btn.removeEventListener("click", closeMenu));
      menuLis().forEach((li) => li.removeEventListener("click", onLiClick));
    };

    const handleMenu = () => {
      const w = window.innerWidth;
      if (w <= 1024) {
        bindEvents();
      } else {
        unbindEvents();
        menuLis().forEach((li) => {
          const sub = li.querySelector<HTMLElement>(":scope > .sub-menu, :scope > .mega-menu");
          if (sub) sub.style.display = "";
          li.classList.remove("active");
        });
        body.classList.remove("overflow-hidden");
        menuWraps.forEach((w) => w.classList.remove("mobile-meni-active"));
      }
      updateBodyOffset();
    };

    // initial
    handleMenu();
    updateBodyOffset();

    const onResize = () => {
      handleMenu();
      updateBodyOffset();
    };
    window.addEventListener("resize", onResize);

    let headerRO: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && header) {
      headerRO = new ResizeObserver(() => updateBodyOffset());
      headerRO.observe(header);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      headerRO?.disconnect();
      unbindEvents();
    };
  }, []);
}
