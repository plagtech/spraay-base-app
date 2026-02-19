'use client';

import { useEffect } from 'react';
import { useMiniKit } from '@coinbase/onchainkit/minikit';
import { TopBar } from '@/components/TopBar';
import { SprayApp } from '@/components/SprayApp';

export default function Home() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <>
      <TopBar />
      <SprayApp />
    </>
  );
}
