'use client';

import type { BuyAsset } from '../BuyAndSpraayFlow';

interface StepAmountProps {
  spendAmount: string;
  setSpendAmount: (val: string) => void;
  buyAsset: BuyAsset;
  setBuyAsset: (asset: BuyAsset) => void;
  distributableAmount: number;
  spraayFee: number;
  onrampFee: number;
  canProceed: boolean;
  onNext: () => void;
  isConnected: boolean;
}

const PRESETS = [25, 50, 100, 250, 500, 1000];

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function StepAmount({
  spendAmount, setSpendAmount, buyAsset, setBuyAsset,
  distributableAmount, spraayFee, onrampFee,
  canProceed, onNext, isConnected,
}: StepAmountProps) {
  const total = parseFloat(spendAmount) || 0;

  return (
    <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-5 relative">
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-spraay-red/30 to-transparent" />

      <div className="text-center mb-5">
        <h2 className="text-lg font-extrabold">How much do you want to spend?</h2>
        <p className="text-sm text-zinc-500 mt-1">Choose your asset and amount. Fees deducted before distribution.</p>
      </div>

      {/* Asset picker */}
      <div className="flex bg-[#0a0a0a] rounded-xl p-0.5 border border-white/[0.06] mb-4">
        <button
          onClick={() => setBuyAsset('USDC')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${buyAsset === 'USDC' ? 'bg-spraay-deep text-white shadow-lg shadow-spraay-red/20' : 'text-zinc-600'}`}
        >
          USDC
        </button>
        <button
          onClick={() => setBuyAsset('ETH')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${buyAsset === 'ETH' ? 'bg-spraay-deep text-white shadow-lg shadow-spraay-red/20' : 'text-zinc-600'}`}
        >
          ETH
        </button>
      </div>

      {/* Big amount input */}
      <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-6 mb-4">
        <div className="flex items-center justify-center gap-1">
          <span className="text-3xl font-light text-spraay-red">$</span>
          <input
            type="number"
            value={spendAmount}
            onChange={(e) => setSpendAmount(e.target.value)}
            placeholder="0.00"
            min="1"
            className="bg-transparent border-none outline-none text-4xl font-black text-white w-48 text-center font-mono"
          />
        </div>
        <p className="text-center text-xs text-zinc-600 mt-2">
          {buyAsset} on Base{buyAsset === 'USDC' && ' · Zero onramp fee'}
        </p>
      </div>

      {/* Preset buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {PRESETS.map(amt => (
          <button
            key={amt}
            onClick={() => setSpendAmount(amt.toString())}
            className={`py-2.5 rounded-lg text-sm font-bold transition-all ${
              spendAmount === amt.toString()
                ? 'border-spraay-red/40 text-spraay-red bg-spraay-glow border'
                : 'border-white/[0.06] text-zinc-500 bg-[#0a0a0a] border active:border-spraay-red/30 active:text-spraay-red'
            }`}
          >
            ${amt}
          </button>
        ))}
      </div>

      {/* Fee preview */}
      {total > 0 && (
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-3.5 mb-4">
          <div className="flex justify-between items-center py-1 text-sm">
            <span className="text-zinc-500">Onramp fee</span>
            {onrampFee === 0
              ? <span className="font-bold text-green-400">FREE</span>
              : <span className="font-mono text-zinc-400">${fmt(onrampFee)}</span>
            }
          </div>
          <div className="flex justify-between items-center py-1 text-sm">
            <span className="text-zinc-500">Spraay fee (0.3%)</span>
            <span className="font-mono text-zinc-400">${fmt(spraayFee)}</span>
          </div>
          <div className="flex justify-between items-center pt-2 mt-1 border-t border-spraay-red/20">
            <span className="font-bold text-sm">Recipients share</span>
            <span className="font-mono font-bold text-spraay-red">~${fmt(distributableAmount)}</span>
          </div>
        </div>
      )}

      {isConnected ? (
        <button
          onClick={onNext}
          disabled={!canProceed}
          className="w-full py-3.5 rounded-2xl font-extrabold text-base bg-gradient-to-br from-spraay-red to-spraay-deep border border-spraay-red/40 text-white active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed min-h-[52px]"
        >
          {canProceed ? 'Choose Recipients →' : 'Enter an amount to start'}
        </button>
      ) : (
        <div className="text-center py-3">
          <p className="text-sm text-zinc-500">Connect your wallet above to start</p>
        </div>
      )}
    </div>
  );
}
