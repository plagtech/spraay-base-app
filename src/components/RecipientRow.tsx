'use client';

import { useCallback } from 'react';
import { isAddress } from 'viem';

interface RecipientRowProps {
  id: number;
  index: number;
  address: string;
  amount: string;
  symbol: string;
  equalMode: boolean;
  usdHint: string;
  onAddressChange: (id: number, value: string) => void;
  onAmountChange: (id: number, value: string) => void;
  onRemove: (id: number) => void;
  canRemove: boolean;
}

export function RecipientRow({
  id, index, address, amount, symbol, equalMode,
  usdHint, onAddressChange, onAmountChange, onRemove, canRemove,
}: RecipientRowProps) {
  const addrValid = address.length > 0 ? isAddress(address) : null;

  const addrBorder = addrValid === null
    ? 'border-white/[0.06]'
    : addrValid
      ? 'border-green-500/30'
      : 'border-spraay-red/40';

  return (
    <div className="animate-row-in relative flex flex-col gap-1.5 bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-3 sm:flex-row sm:items-center sm:gap-2">
      {/* Row number + Address */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="text-[0.65rem] font-bold text-zinc-600 font-mono w-5 text-center shrink-0">
          {index}
        </span>
        <input
          type="text"
          value={address}
          onChange={(e) => onAddressChange(id, e.target.value)}
          placeholder="0x… wallet address"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className={`flex-1 min-w-0 px-3 py-2.5 bg-[#0e0e10] border ${addrBorder} rounded-lg text-white font-mono text-[0.75rem] outline-none focus:border-spraay-red/50 placeholder:text-zinc-600 transition-colors`}
        />
      </div>

      {/* Amount (hidden in equal mode) */}
      {!equalMode && (
        <div className="flex items-center gap-1.5 pl-7 sm:pl-0 sm:flex-shrink-0 sm:w-44">
          <div className="relative flex-1">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => onAmountChange(id, e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2.5 pr-12 bg-[#0e0e10] border border-white/[0.06] rounded-lg text-white font-mono text-sm outline-none focus:border-spraay-red/50 placeholder:text-zinc-600 transition-colors"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-bold text-zinc-600 pointer-events-none">
              {symbol}
            </span>
          </div>
          {usdHint && (
            <span className="text-[0.65rem] text-zinc-600 font-mono min-w-[50px] text-right shrink-0">
              {usdHint}
            </span>
          )}
        </div>
      )}

      {/* Remove button */}
      <button
        onClick={() => onRemove(id)}
        disabled={!canRemove}
        className="absolute top-2 right-2 sm:static w-7 h-7 rounded-full flex items-center justify-center text-zinc-600 hover:text-spraay-red hover:bg-spraay-red/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
      >
        ×
      </button>
    </div>
  );
}
