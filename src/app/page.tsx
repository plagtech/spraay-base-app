'use client';

import { useEffect, useState } from 'react';
import sdk from '@farcaster/frame-sdk';
import { TopBar } from '@/components/TopBar';
import { SprayApp } from '@/components/SprayApp';

export default function Home() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      await sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return (
    <>
      <TopBar />
      <SprayApp />
    </>
  );
}