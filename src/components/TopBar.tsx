'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from '@coinbase/onchainkit/wallet';
import {
  Address,
  Avatar,
  Name,
  Identity,
} from '@coinbase/onchainkit/identity';
import { useEthPrice } from '@/lib/useEthPrice';

export function TopBar() {
  const { price } = useEthPrice();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-[#f0f7ff]/94 backdrop-blur-xl border-b border-[rgba(0,144,224,0.2)]">
      <div className="max-w-[540px] mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/spraay-logo-1000x1000.png"
              alt="Spraay"
              width={28}
              height={28}
              className="rounded-md"
            />
            <span className="font-extrabold text-lg tracking-wide bg-gradient-to-br from-spraay-bright to-spraay-blue bg-clip-text text-transparent">
              SPRAAY
            </span>
          </Link>
          <span className="text-[0.65rem] font-bold bg-blue-500/10 text-blue-500 px-2 py-0.5 rounded-md tracking-wide">
            BASE
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {price > 0 && (
            <span className="text-[0.7rem] text-[#8aa5b8] font-mono hidden sm:inline">
              ETH <span className="text-[#4a6070]">${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </span>
          )}

          <Wallet>
            <ConnectWallet className="!bg-gradient-to-br !from-spraay-blue !to-spraay-deep !border !border-spraay-bright/30 !text-white !font-bold !text-sm !rounded-lg !px-4 !py-2 !min-h-[36px]">
              <Avatar className="h-5 w-5" />
              <Name />
            </ConnectWallet>
            <WalletDropdown>
              <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                <Avatar />
                <Name />
                <Address />
              </Identity>
              <WalletDropdownDisconnect />
            </WalletDropdown>
          </Wallet>
        </div>
      </div>

      {/* Page tabs */}
      <div className="max-w-[540px] mx-auto px-4">
        <div className="flex border-b border-[rgba(0,144,224,0.15)]">
          <Link
            href="/"
            className={`flex-1 py-2.5 text-center text-sm font-bold transition-all border-b-2 ${
              pathname === '/'
                ? 'border-spraay-blue text-[#0d1f2d]'
                : 'border-transparent text-[#8aa5b8] hover:text-[#4a6070]'
            }`}
          >
            💸 Batch Send
          </Link>
          <Link
            href="/buy"
            className={`flex-1 py-2.5 text-center text-sm font-bold transition-all border-b-2 ${
              pathname === '/buy'
                ? 'border-spraay-blue text-[#0d1f2d]'
                : 'border-transparent text-[#8aa5b8] hover:text-[#4a6070]'
            }`}
          >
            💳 Buy &amp; Spraay
          </Link>
        </div>
      </div>
    </header>
  );
}
