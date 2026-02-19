'use client';

import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { SprayApp } from '@/components/SprayApp';

export default function Home() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <>
      <TopBar />
      <SprayApp />
    </>
  );
}
