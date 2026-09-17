"use client";
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { ChevronDown } from "lucide-react";
// lucide-react quitó los íconos de marca (licencia) -- SVG inline propios,
// mismo trazo/tamaño que el resto de los íconos lucide de este archivo.
function Facebook(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>;
}
function Instagram(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>;
}
function Linkedin(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>;
}
function Twitter(props: React.SVGProps<SVGSVGElement>) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg>;
}
import Image from 'next/image';
import shapeImage from '@riteflow/../../public/images/footer-logo-shape.svg';
import largeLogo from '@riteflow/../../public/images/footer-logo.svg';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'motion/react';

const Footer: React.FC = () => {
  // State to track which footer menu is open (for mobile only)
  const [openMenuIndex, setOpenMenuIndex] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);

  React.useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Scroll progress tracking
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollValue = scrollHeight > 0 ? Math.round((scrollTop * 100) / scrollHeight) : 0;
      
      setScrollProgress(scrollValue);
      setShowScrollTop(scrollTop > 100); // Show button after scrolling 100px
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const toggleMenu = (index: number) => {
    if (typeof window !== "undefined" && window.innerWidth >= 640) return;
    setOpenMenuIndex(openMenuIndex === index ? null : index);
  };

  return (
    <>
    <footer>
        <div className="container">
            <div className="border-container pt-15 sm:pt-20 lg:pt-24 xl:pt-[100px] pb-4 sm:pb-5 md:pb-6 lg:pb-20 xl:pb-8 2xl:pb-10">
                <div className="px-4 py-8 sm:p-8 md:p-10 bg-blue rounded-[20px] border border-lineColor/70" data-sttr-wrapper>
                    <div className="flex items-start justify-between gap-10 flex-col lg:flex-row" data-sttr-card>
                        <div className="lg:max-w-[320px] w-full flex flex-col sm:flex-row lg:flex-col justify-between gap-5 sm:gap-7">
                            <div className="max-w-[320px] lg:max-w-none w-full">
                                <h2 className="text-[25px]">Stay Updated</h2>
                                <p className="mt-3 sm:mt-4.5 ">Subscribe to our newsletter for the latest updates, news, and insights.</p>
                            </div>
                            <div className="max-w-[320px] lg:max-w-none w-full">
                                <form action="#" name="footer-form" className="lg:max-w-[292px] relative">
                                    <input className="h-[58px] w-full p-3 pr-20 text-sm text-white placeholder:text-offWhite/60 font-medium leading-none bg-linear-to-b from-slateBlue/20 to-royalBlue/20 rounded-[10px] outline-none border border-[#7D76FF]/20" type="email" placeholder="example@example.com" name="footer-email" />
                                    <button className="button-secondary h-11.5 !absolute top-[6px] right-[6px]">Join</button>
                                </form>
                                <div className="flex items-center gap-6 mt-5 sm:mt-7">
                                    <Link href="#" className="text-white hover:text-tertiary transition-colors duration-300">
                                        <Facebook className="w-5 h-5" />
                                    </Link>
                                    <Link href="#" className="text-white hover:text-tertiary transition-colors duration-300">
                                        <Twitter className="w-5 h-5" />
                                    </Link>
                                    <Link href="#" className="text-white hover:text-tertiary transition-colors duration-300">
                                        <Instagram className="w-5 h-5" />
                                    </Link>
                                    <Link href="#" className="text-white hover:text-tertiary transition-colors duration-300">
                                        <Linkedin className="w-5 h-5" />
                                    </Link>
                                </div>
                            </div>
                        </div>
                        <div className="lg:max-w-[560px] w-full flex items-start justify-between gap-4 sm:gap-10 flex-col sm:flex-row footer-menu-wrapper">
                            <div className={clsx("w-full sm:w-auto pb-4 sm:pb-0 border-b sm:border-b-0 border-lineColor last:border-b-0 last:pb-0", openMenuIndex === 0 && "active")}>
                                <button 
                                  className="!text-lg text-white font-medium -tracking-tight flex items-center justify-between gap-5 w-full footer-menu-toggle"
                                  onClick={() => toggleMenu(0)}
                                >
                                    Company
                                    <ChevronDown
                                      size={16}
                                      className={clsx("transition-transform block sm:hidden", openMenuIndex === 0 && "rotate-180")}
                                    />
                                </button>
                                <AnimatePresence>
                                  {(openMenuIndex === 0 || isDesktop) && (
                                    <motion.div
                                      initial={{ height: isDesktop ? "auto" : 0, opacity: isDesktop ? 1 : 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: isDesktop ? "auto" : 0, opacity: isDesktop ? 1 : 0 }}
                                      transition={{ duration: 0.35, ease: "easeInOut" }}
                                      className="footer-menu-list overflow-hidden"
                                    >
                                      <ul className="flex flex-col gap-2.5 pt-4.5">
                                        <li><Link href="/about" className="text-offWhite/80 transition-colors duration-300 hover:text-offWhite">About</Link></li>
                                        <li><Link href="/contact" className="text-offWhite/80 transition-colors duration-300 hover:text-offWhite">Contact</Link></li>
                                        <li><Link href="/get-demo" className="text-offWhite/80 transition-colors duration-300 hover:text-offWhite">Get a Demo</Link></li>
                                        <li><Link href="/join-wishlist" className="text-offWhite/80 transition-colors duration-300 hover:text-offWhite">Join Wishlist</Link></li>
                                      </ul>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                            </div>
                            <div className={clsx("w-full sm:w-auto pb-4 sm:pb-0 border-b sm:border-b-0 border-lineColor last:border-b-0 last:pb-0", openMenuIndex === 1 && "active")}>
                                <button 
                                  className="!text-lg text-white font-medium -tracking-tight flex items-center justify-between gap-5 w-full footer-menu-toggle"
                                  onClick={() => toggleMenu(1)}
                                >
                                    Insight
                                    <ChevronDown
                                      size={16}
                                      className={clsx("transition-transform block sm:hidden", openMenuIndex === 1 && "rotate-180")}
                                    />
                                </button>
                                <AnimatePresence>
                                  {(openMenuIndex === 1 || isDesktop) && (
                                    <motion.div
                                      initial={{ height: isDesktop ? "auto" : 0, opacity: isDesktop ? 1 : 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: isDesktop ? "auto" : 0, opacity: isDesktop ? 1 : 0 }}
                                      transition={{ duration: 0.35, ease: "easeInOut" }}
                                      className="footer-menu-list overflow-hidden"
                                    >
                                      <ul className="flex flex-col gap-2.5 pt-4.5">
                                        <li><Link href="/blog" className="text-offWhite/80 transition-colors duration-300 hover:text-offWhite">Blog</Link></li>
                                        <li><Link href="/features" className="text-offWhite/80 transition-colors duration-300 hover:text-offWhite">Features</Link></li>
                                        <li><Link href="/integration" className="text-offWhite/80 transition-colors duration-300 hover:text-offWhite">Integration</Link></li>
                                        <li><Link href="/pricing" className="text-offWhite/80 transition-colors duration-300 hover:text-offWhite">Pricing</Link></li>
                                        <li><Link href="/use-cases" className="text-offWhite/80 transition-colors duration-300 hover:text-offWhite">Use Cases</Link></li>
                                      </ul>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                            </div>
                            <div className={clsx("w-full sm:w-auto pb-4 sm:pb-0 border-b sm:border-b-0 border-lineColor last:border-b-0 last:pb-0", openMenuIndex === 2 && "active")}>
                                <button 
                                  className="!text-lg text-white font-medium -tracking-tight flex items-center justify-between gap-5 w-full footer-menu-toggle"
                                  onClick={() => toggleMenu(2)}
                                >
                                    Utility
                                    <ChevronDown
                                      size={16}
                                      className={clsx("transition-transform block sm:hidden", openMenuIndex === 2 && "rotate-180")}
                                    />
                                </button>
                                <AnimatePresence>
                                  {(openMenuIndex === 2 || isDesktop) && (
                                    <motion.div
                                      initial={{ height: isDesktop ? "auto" : 0, opacity: isDesktop ? 1 : 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: isDesktop ? "auto" : 0, opacity: isDesktop ? 1 : 0 }}
                                      transition={{ duration: 0.35, ease: "easeInOut" }}
                                      className="footer-menu-list overflow-hidden"
                                    >
                                      <ul className="flex flex-col gap-2.5 pt-4.5">
                                        <li><Link href="/error" className="text-offWhite/80 transition-colors duration-300 hover:text-offWhite">Error</Link></li>
                                        <li><Link href="/password-protected" className="text-offWhite/80 transition-colors duration-300 hover:text-offWhite">Password Protected</Link></li>
                                      </ul>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-12 flex items-center justify-center md:justify-between gap-4 flex-col md:flex-row pt-5 lg:pt-6 border-t border-lineColor/50 overflow-hidden relative z-50" data-sttr-card>
                        <p className="text-white/80 text-center">Copyright &copy; 2025 Riteflow Inc. All Rights Reserved</p>
                        <div className="flex items-center gap-2 sm:gap-5 flex-wrap sm:flex-nowrap justify-center">
                            <Link href="/ai-policy" className="text-offWhite/80 transition-colors duration-300 hover:text-offWhite">AI Policy</Link>
                            <div className="w-[5px] h-[5px] rounded-full bg-offWhite/80"></div>
                            <Link href="/security-and-privacy" className="text-offWhite/80 transition-colors duration-300 hover:text-offWhite">Security & Privacy</Link>
                        </div>
                    </div>
                    <div className="relative overflow-hidden" data-sttr-card>
                        {/* <img src="./assets/img/footer-logo-shape.svg" alt="Decorative footer background shape" className="absolute top-0 left-0 w-fit z-10" data-lag="0.1"> */}
                        <Image src={shapeImage} alt="Decorative footer background shape" className="absolute top-0 left-0 w-fit z-10" data-lag="0.1" />
                        <Image src={largeLogo} alt="RiteFlow footer logo" data-lag="0.1" />
                        {/* <img src="./assets/img/footer-logo.svg" alt="RiteFlow footer logo" data-lag="0.1"> */}
                    </div>
                </div>
            </div>
        </div>
    </footer>

    {/* Scroll Top Button Start */}
    <AnimatePresence>
      {showScrollTop && (
        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1}}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4 }}
          id="progress"
          className="h-10 md:h-12 w-10 md:w-12 fixed bottom-[30px] right-8 z-[999] shadow-lg cursor-pointer progress flex items-center justify-center rotate-[135deg] bg-transparent setvissible"
          onClick={scrollToTop}
          style={{ background: `conic-gradient(from 0deg, #4F46E5 ${scrollProgress}%, #fafafa ${scrollProgress}%)` }}
        >
          <div
            id="progress-value"
            className="h-9 md:h-11 w-9 md:w-11 progress-value text-white text-[20px] bg-black moving-animation flex items-center justify-center">
            <svg
              fill="#fff"
              height="20px"
              width="20px"
              version="1.1"
              id="Layer_1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              viewBox="0 0 330 330"
              xmlSpace="preserve"
            >
              <path
                id="XMLID_29_"
                d="M100.606,100.606L150,51.212V315c0,8.284,6.716,15,15,15c8.284,0,15-6.716,15-15V51.212l49.394,49.394
          C232.322,103.535,236.161,105,240,105c3.839,0,7.678-1.465,10.606-4.394c5.858-5.857,5.858-15.355,0-21.213l-75-75
          c-5.857-5.858-15.355-5.858-21.213,0l-75,75c-5.858,5.857-5.858,15.355,0,21.213C85.251,106.463,94.749,106.463,100.606,100.606z"
              />
            </svg>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
    {/* Scroll Top Button End */}
    </>
  )
}

export default Footer
