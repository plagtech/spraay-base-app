'use client';

import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect } from 'react';
import Link from 'next/link';
import { TopBar } from '@/components/TopBar';
import { SprayApp } from '@/components/SprayApp';

export default function Home() {
  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <>
      <TopBar />

      {/* Buy & Spraay promo banner */}
      <div className="max-w-[540px] mx-auto px-4 pt-4">
        <Link
          href="/buy"
          className="block bg-gradient-to-r from-spraay-deep/30 to-[#0a1628] border border-spraay-red/20 rounded-xl p-4 active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">
                💳 Need crypto? <span className="text-spraay-red">Buy &amp; Spraay</span>
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">
                Buy USDC or ETH with card &amp; distribute instantly. Zero onramp fee for USDC.
              </p>
            </div>
            <span className="text-zinc-600 text-lg ml-3">→</span>
          </div>
        </Link>
      </div>

      <SprayApp />
    </>
  );
}
