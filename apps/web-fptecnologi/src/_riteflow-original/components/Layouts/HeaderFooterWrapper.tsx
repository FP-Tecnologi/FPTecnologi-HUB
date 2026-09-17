'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Header from '@riteflow/components/Layouts/header/Header';
import HeaderTwo from '@riteflow/components/Layouts/header/HeaderTwo';
import Footer from '@riteflow/components/Layouts/Footer';
import { useStaggerAnimation } from '@riteflow/hooks/useStaggerAnimation';

export default function HeaderFooterWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isDemoPage = pathname === '/';

  useStaggerAnimation();

  return (
    <>
      {isDemoPage ? <HeaderTwo /> : <Header />}
      {children}
      <Footer />
    </>
  );
}
