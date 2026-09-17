'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X } from 'lucide-react';
import BrandLogo from '@riteflow/components/icons/BrandLogo';
import Navigation from './Navigation';
import Image from 'next/image';
import bgImage from '@riteflow/../../public/images/home/banner-bg.webp';
import { AnimatePresence, motion } from 'motion/react';
import { useStickyHeader } from '@riteflow/hooks/useStickyHeader';

export default function HeaderTwo() {
  const { headerClass, motionProps, compactNav } = useStickyHeader({ hideOffset: 2, showOffset: 5 });
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = React.useRef<HTMLElement | null>(null);

  const updateBodyPadding = () => {
    if (!headerRef.current) return;
    const height = headerRef.current.getBoundingClientRect().height;
    document.body.style.paddingTop = `${height}px`;
  };

  useEffect(() => {
    updateBodyPadding();
    const handleResize = () => updateBodyPadding();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (mobileOpen && typeof window !== 'undefined' && window.innerWidth <= 1024) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    const handleResize = () => {
      if (!mobileOpen || window.innerWidth > 1024) document.body.classList.remove('overflow-hidden');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        ref={headerRef}
        className={`header-area fixed w-full left-0 top-0 right-0 z-[999] border-b border-lineColor header-v2 ${headerClass}`}
        data-smooth-ignore="true"
        {...motionProps}
      >
        <div className="container">
          <div className="border-container">
            <div className="header-wrapper flex items-center justify-between gap-5 relative py-3 lg:py-0">
              <Link href="/" className="logo">
                <BrandLogo className="w-full max-w-[120px]" />
              </Link>

              <div className="main-menu hidden lg:block">
                <Navigation className="dextop-menu" compact={compactNav} />
              </div>

              <div className="flex items-center gap-6">
                <div className="hidden sm:block">
                  <Link
                    href="/pricing"
                    className="button-primary inline-flex items-center justify-center px-[22px] py-3 text-white font-medium text-sm leading-normal rounded-[10px] relative z-1 overflow-hidden text-center"
                  >
                    Buy Template
                  </Link>
                </div>
                <button
                  type="button"
                  className="menuToggle"
                  onClick={() => setMobileOpen(true)}
                  aria-label="Open menu"
                >
                  <svg className="stroke-current text-white" width="40" viewBox="0 0 100 100">
                    <path
                      className="line line1"
                      d="M 20,29.000046 H 80.000231 C 80.000231,29.000046 94.498839,28.817352 94.532987,66.711331 94.543142,77.980673 90.966081,81.670246 85.259173,81.668997 79.552261,81.667751 75.000211,74.999942 75.000211,74.999942 L 25.000021,25.000058"
                    />
                    <path className="line line2" d="M 20,50 H 80" />
                    <path
                      className="line line3"
                      d="M 20,70.999954 H 80.000231 C 80.000231,70.999954 94.498839,71.182648 94.532987,33.288669 94.543142,22.019327 90.966081,18.329754 85.259173,18.331003 79.552261,18.332249 75.000211,25.000058 75.000211,25.000058 L 25.000021,74.999942"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overlay fixed top-0 left-0 h-full w-full bg-black z-[1000] lg:hidden block"
          >
            <Image
              src={bgImage}
              alt=""
              className="absolute top-0 left-0 inset-0 object-cover z-[-1] h-full opacity-70 transform scale-[1.3]"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="main-menu-wrap h-screen"
              data-menu="mobile"
            >
              <div className="border-lineColor border-b border-solid">
                <div className="container">
                  <div className="border-container py-2">
                    <div className="flex items-center justify-between w-full sm:w-auto py-3">
                      <Link href="/">
                        <BrandLogo className="fill-current text-gray-800 min-h-8" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setMobileOpen(false)}
                        className="menu-close z-20 text-text-pragraph"
                        aria-label="Close menu"
                      >
                        <X className="fill-current text-text-pragraph dark:text-white sm:h-9 sm:w-9 h-6 w-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="py-5">
                <div className="container">
                  <div className="main-menu">
                    <Navigation setMobileOpen={setMobileOpen} />
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
