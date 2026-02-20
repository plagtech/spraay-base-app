'use client';

import { useRef } from 'react';
import { isAddress } from 'viem';
import type { Recipient, SplitMode, BuyAsset } from '../BuyAndSpraayFlow';

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface StepRecipientsProps {
  recipients: Recipient[];
  splitMode: SplitMode;
  setSplitMode: (mode: SplitMode) => void;
  evenSplitAmount: number;
  distributableAmount: number;
  customTotal: number;
  totalSpend: number;
  validCount: number;
  buyAsset: BuyAsset;
  onAdd: () => void;
  onRemove: (id: number) => void;
  onUpdate: (id: number, field: 'address' | 'amount', value: string) => void;
  onCSV: (e: React.ChangeEvent<HTMLInputElement>) => void;
  canProceed: boolean;
  onBack: () => void;
  onNext: () => void;
}

export function StepRecipients({
  recipients, splitMode, setSplitMode, evenSplitAmount,
  distributableAmount, customTotal, totalSpend, validCount, buyAsset,
  onAdd, onRemove, onUpdate, onCSV, canProceed, onBack, onNext,
}: StepRecipientsProps) {
  const csvRef = useRef<HTMLInputElement>(null);

  return (
    <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-5 relative">
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-spraay-red/30 to-transparent" />

      <div className="text-center mb-4">
        <h2 className="text-lg font-extrabold">Where should it go?</h2>
        <p className="text-sm text-zinc-500 mt-1">
          <span className="text-spraay-red font-bold">~${fmt(distributableAmount)}</span> {buyAsset} to distribute
        </p>
      </div>

      {/* Split mode toggle */}
      <div className="flex bg-[#0a0a0a] rounded-xl p-0.5 border border-white/[0.06] mb-4">
        {(['even', 'custom'] as SplitMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setSplitMode(mode)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              splitMode === mode ? 'bg-spraay-deep text-white shadow-lg shadow-spraay-red/20' : 'text-zinc-600'
            }`}
          >
            {mode === 'even' ? 'Split Evenly' : 'Custom Amounts'}
          </button>
        ))}
      </div>

      {/* Recipient list */}
      <div className="flex flex-col gap-2 mb-3 max-h-[320px] overflow-y-auto">
        {recipients.map((r, i) => {
          const addrValid = r.address.length > 0 ? isAddress(r.address) : null;
          const addrBorder = addrValid === null ? 'border-white/[0.06]' : addrValid ? 'border-green-500/30' : 'border-spraay-red/40';

          return (
            <div key={r.id} className="animate-row-in relative flex flex-col gap-1.5 bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-3 sm:flex-row sm:items-center sm:gap-2">
              <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <span className="text-[0.65rem] font-bold text-zinc-600 font-mono w-5 text-center shrink-0">{i + 1}</span>
                <input
                  type="text"
                  value={r.address}
                  onChange={(e) => onUpdate(r.id, 'address', e.target.value)}
                  placeholder="0x… wallet address"
                  autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false}
                  className={`flex-1 min-w-0 px-3 py-2.5 bg-[#0e0e10] border ${addrBorder} rounded-lg text-white font-mono text-[0.75rem] outline-none focus:border-spraay-red/50 placeholder:text-zinc-600 transition-colors`}
                />
              </div>

              {splitMode === 'custom' && (
                <div className="flex items-center gap-1.5 pl-7 sm:pl-0 sm:flex-shrink-0 sm:w-36">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={r.amount}
                      onChange={(e) => onUpdate(r.id, 'amount', e.target.value)}
                      placeholder="0.00"
                      className="w-full px-3 py-2.5 pr-14 bg-[#0e0e10] border border-white/[0.06] rounded-lg text-white font-mono text-sm outline-none focus:border-spraay-red/50 placeholder:text-zinc-600 transition-colors"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-bold text-zinc-600 pointer-events-none">{buyAsset}</span>
                  </div>
                </div>
              )}

              {splitMode === 'even' && addrValid && (
                <span className="text-xs font-bold text-spraay-red font-mono pl-7 sm:pl-0 sm:min-w-[80px] sm:text-right">
                  ~${fmt(evenSplitAmount)}
                </span>
              )}

              <button
                onClick={() => onRemove(r.id)}
                disabled={recipients.length <= 1}
                className="absolute top-2 right-2 sm:static w-7 h-7 rounded-full flex items-center justify-center text-zinc-600 hover:text-spraay-red hover:bg-spraay-red/10 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* Add + CSV */}
      <div className="flex gap-2 mb-4">
        <button onClick={onAdd} className="flex-1 py-3 rounded-lg border border-dashed border-white/[0.06] text-zinc-500 font-semibold text-sm active:border-spraay-red/30 active:text-spraay-red active:bg-spraay-glow transition-all">
          + Add Recipient
        </button>
        <button onClick={() => csvRef.current?.click()} className="flex-1 py-3 rounded-lg border border-dashed border-white/[0.06] text-zinc-500 font-semibold text-sm active:border-spraay-red/30 active:text-spraay-red active:bg-spraay-glow transition-all">
          📋 CSV Upload
        </button>
        <input ref={csvRef} type="file" accept=".csv,.txt" onChange={onCSV} className="hidden" />
      </div>

      {splitMode === 'custom' && customTotal > distributableAmount && (
        <div className="bg-spraay-red/10 border border-spraay-red/20 rounded-lg p-3 mb-4 text-sm text-spraay-red">
          Custom amounts total ${fmt(customTotal)} but only ~${fmt(distributableAmount)} is available after fees.
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <span className="text-xs text-zinc-600"><strong className="text-zinc-400">{validCount}</strong> valid of {recipients.length}</span>
        <span className="text-xs text-zinc-600 font-mono">max <strong className="text-zinc-400">200</strong></span>
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="flex-1 py-3.5 rounded-2xl bg-[#0a0a0a] border border-white/[0.06] text-zinc-500 font-bold text-sm active:bg-zinc-900 transition-colors">
          ← Back
        </button>
        <button onClick={onNext} disabled={!canProceed} className="flex-[2] py-3.5 rounded-2xl font-extrabold text-base bg-gradient-to-br from-spraay-red to-spraay-deep border border-spraay-red/40 text-white active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed min-h-[52px]">
          Review Breakdown →
        </button>
      </div>
    </div>
  );
}
