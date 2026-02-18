'use client';

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

  return (
    <header className="sticky top-0 z-50 bg-[#0a0a0a]/88 backdrop-blur-xl border-b border-white/[0.06]">
      <div className="max-w-[540px] mx-auto px-4 py-3 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <span className="font-black text-lg tracking-wide bg-gradient-to-br from-spraay-red to-spraay-deep bg-clip-text text-transparent">
            SPRAAY
          </span>
          <span className="text-[0.65rem] font-bold bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-md tracking-wide">
            BASE
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {price > 0 && (
            <span className="text-[0.7rem] text-zinc-500 font-mono">
              ETH <span className="text-zinc-400">${price.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            </span>
          )}

          <Wallet>
            <ConnectWallet className="!bg-gradient-to-br !from-spraay-deep !to-[#4a0012] !border !border-spraay-red/30 !text-white !font-bold !text-sm !rounded-lg !px-4 !py-2 !min-h-[36px]">
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
    </header>
  );
}