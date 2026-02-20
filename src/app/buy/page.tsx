'use client';

import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect } from 'react';
import { TopBar } from '@/components/TopBar';
import { BuyAndSpraayFlow } from '@/components/BuyAndSpraayFlow';

export default function BuyPage() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <>
      <TopBar />
      <BuyAndSpraayFlow />
    </>
  );
}
