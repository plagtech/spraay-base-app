'use client';

import type { Recipient, SplitMode, BuyAsset } from '../BuyAndSpraayFlow';

function fmt(n: number) {
  return Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function shortAddr(addr: string) {
  return addr.length > 10 ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : addr;
}

interface StepBreakdownProps {
  totalSpend: number;
  spraayFee: number;
  onrampFee: number;
  networkFee: number;
  distributableAmount: number;
  recipients: Recipient[];
  splitMode: SplitMode;
  evenSplitAmount: number;
  buyAsset: BuyAsset;
  error: string | null;
  onBack: () => void;
  onBuyAndSpray: () => void;
  onDirectSpray: () => void;
  isConnected: boolean;
}

export function StepBreakdown({
  totalSpend, spraayFee, onrampFee, networkFee, distributableAmount,
  recipients, splitMode, evenSplitAmount, buyAsset, error,
  onBack, onBuyAndSpray, onDirectSpray, isConnected,
}: StepBreakdownProps) {

  const recipientList = recipients.map(r => ({
    address: r.address,
    amount: splitMode === 'even' ? evenSplitAmount : (parseFloat(r.amount) || 0),
  }));

  return (
    <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-5 relative">
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-spraay-red/30 to-transparent" />

      <div className="text-center mb-4">
        <h2 className="text-lg font-extrabold">Confirm Your Spraay</h2>
        <p className="text-sm text-zinc-500 mt-1">Review every detail before sending</p>
      </div>

      {/* Purchase summary */}
      <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl overflow-hidden mb-4">
        <div className="p-4 border-b border-white/[0.06]">
          <p className="text-[0.65rem] font-bold text-zinc-600 uppercase tracking-wider mb-1">You're Purchasing</p>
          <p className="text-2xl font-black font-mono">
            ${fmt(totalSpend)} <span className="text-sm font-bold text-zinc-500">{buyAsset}</span>
          </p>
        </div>

        <div className="p-4 space-y-2.5">
          <FeeRow
            label="Coinbase Onramp Fee"
            value={onrampFee === 0 ? 'FREE' : `$${fmt(onrampFee)}`}
            highlight={onrampFee === 0}
          />
          <FeeRow label="Spraay Fee (0.3%)" value={`$${fmt(spraayFee)}`} />
          <FeeRow label="Network Fee (est.)" value={`$${fmt(networkFee)}`} />
          <div className="flex justify-between items-center pt-2.5 mt-1 border-t border-spraay-red/20">
            <span className="text-sm font-bold">Total to Recipients</span>
            <span className="font-mono font-bold text-spraay-red text-base">~${fmt(distributableAmount)} {buyAsset}</span>
          </div>
        </div>
      </div>

      {/* Recipient breakdown */}
      <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl overflow-hidden mb-4">
        <div className="p-3.5 border-b border-white/[0.06] flex justify-between items-center">
          <span className="text-[0.65rem] font-bold text-zinc-600 uppercase tracking-wider">
            {recipientList.length} Recipient{recipientList.length !== 1 ? 's' : ''}
          </span>
          <span className="text-[0.65rem] font-bold text-zinc-600 uppercase tracking-wider">
            {splitMode === 'even' ? 'Even Split' : 'Custom'}
          </span>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {recipientList.map((r, i) => (
            <div key={i} className="flex justify-between items-center px-3.5 py-2.5 border-b border-white/[0.03] last:border-0">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] font-bold text-white"
                  style={{ background: `hsl(${(i * 47 + 200) % 360}, 50%, 35%)` }}
                >
                  {i + 1}
                </div>
                <span className="font-mono text-xs text-zinc-400">{shortAddr(r.address)}</span>
              </div>
              <span className="font-mono text-sm font-semibold">
                ~${fmt(r.amount)} <span className="text-zinc-600 text-xs">{buyAsset}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-spraay-red/10 border border-spraay-red/20 rounded-lg p-3 mb-4 text-sm text-spraay-red">
          {error}
        </div>
      )}

      <div className="flex gap-2 mb-3">
        <button onClick={onBack} className="flex-1 py-3.5 rounded-2xl bg-[#0a0a0a] border border-white/[0.06] text-zinc-500 font-bold text-sm active:bg-zinc-900 transition-colors">
          ← Back
        </button>
        <button
          onClick={onBuyAndSpray}
          disabled={!isConnected}
          className="flex-[2] py-3.5 rounded-2xl font-extrabold text-base bg-gradient-to-br from-spraay-red to-spraay-deep border border-spraay-red/40 text-white active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed min-h-[52px]"
        >
          🚀 Buy &amp; Spraay ${fmt(totalSpend)}
        </button>
      </div>

      <button
        onClick={onDirectSpray}
        disabled={!isConnected}
        className="w-full py-3 rounded-xl bg-[#0a0a0a] border border-white/[0.06] text-zinc-500 font-semibold text-sm active:bg-zinc-900 transition-colors disabled:opacity-40"
      >
        Already have {buyAsset}? Spraay directly →
      </button>

      <p className="text-[0.7rem] text-zinc-600 text-center mt-3 leading-snug">
        Buy &amp; Spraay opens Coinbase to purchase {buyAsset}, then distributes automatically.
        <br />Your wallet will ask for a final signature. No funds leave until you approve.
      </p>
    </div>
  );
}

function FeeRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className={highlight ? 'text-green-400 font-bold' : 'text-zinc-400 font-mono'}>{value}</span>
    </div>
  );
}
