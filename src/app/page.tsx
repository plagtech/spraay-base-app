'use client';

import { useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { SprayApp } from '@/components/SprayApp';

export default function Home() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.parent) {
      window.parent.postMessage({ type: 'frame-ready' }, '*');
    }
  }, []);

  return (
    <>
      <TopBar />
      <SprayApp />
    </>
  );
}