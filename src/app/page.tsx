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
          className="block bg-gradient-to-r from-spraay-deep/10 to-[#e8f4fd] border border-spraay-blue/20 rounded-xl p-4 active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#0d1f2d]">
                💳 Need crypto? <span className="text-spraay-blue">Buy &amp; Spraay</span>
              </p>
              <p className="text-xs text-[#8aa5b8] mt-0.5">
                Buy USDC or ETH with card &amp; distribute instantly. Zero onramp fee for USDC.
              </p>
            </div>
            <span className="text-[#8aa5b8] text-lg ml-3">→</span>
          </div>
        </Link>
      </div>

      <SprayApp />
    </>
  );
}
