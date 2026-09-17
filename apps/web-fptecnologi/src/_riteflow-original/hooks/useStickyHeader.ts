// hooks/useStickyHeader.ts
import { useEffect, useRef, useState } from "react";
import type { Transition } from "motion/react";

type Options = {
  hideOffset?: number;
  showOffset?: number;
};

export function useStickyHeader(options: Options = {}) {
  const { hideOffset = 6, showOffset = 4 } = options;

  const [pinned, setPinned] = useState(true); 
  const [atTop, setAtTop] = useState(true);  
  const [revealedUp, setRevealedUp] = useState(false); 

  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      const delta = y - lastY.current;

      setAtTop(y <= 2);

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          if (y <= showOffset) {
            setPinned(true);
            setRevealedUp(false);
          } else {
            if (delta > 0 && y > hideOffset) {
              setPinned(false);
              setRevealedUp(false);
            } else if (delta < 0) {
              setPinned(true);
              setRevealedUp(true);
            }
          }

          lastY.current = y;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hideOffset, showOffset]);

  const headerClass = atTop
    ? "bg-secondary supports-[backdrop-filter]:backdrop-blur backdrop-blur-md shadow-md"
    : revealedUp
    ? "bg-secondary/80 dark:bg-[#0B1220]/70 supports-[backdrop-filter]:backdrop-blur backdrop-blur-sm shadow-[0_4px_30px_rgba(0,0,0,0.08)]"
    : "bg-secondary supports-[backdrop-filter]:backdrop-blur backdrop-blur-md shadow-md";

  const compactNav = revealedUp;

  const transition: Transition = {
    type: "spring",
    stiffness: 600,
    damping: 44,
    mass: 0.6,
  };

  const motionProps = {
    initial: { y: 0, opacity: 1 } as const,
    animate: { y: pinned ? 0 : "-100%", opacity: 1 } as const,
    transition,
  };

  return { pinned, atTop, revealedUp, compactNav, headerClass, motionProps };
}
