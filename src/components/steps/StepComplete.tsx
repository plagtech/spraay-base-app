'use client';

import type { BuyAsset } from '../BuyAndSpraayFlow';

function fmt(n: number) {
  return n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface StepCompleteProps {
  totalSpend: number;
  distributableAmount: number;
  recipientCount: number;
  buyAsset: BuyAsset;
  txHash: string | null;
  onReset: () => void;
}

export function StepComplete({ totalSpend, distributableAmount, recipientCount, buyAsset, txHash, onReset }: StepCompleteProps) {
  const basescanUrl = txHash ? `https://basescan.org/tx/${txHash}` : '';

  const handleShare = () => {
    const text = `Just sprayed ~$${fmt(distributableAmount)} ${buyAsset} to ${recipientCount} wallets on Base in one transaction! 💸\n\n@Spraay_app makes batch crypto payments easy.`;
    const url = 'https://spraay-base-dapp.vercel.app';
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      '_blank'
    );
  };

  return (
    <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-6 relative text-center">
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

      <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center">
        <span className="text-4xl">🎉</span>
      </div>

      <h2 className="text-2xl font-extrabold mb-1">Spraayed!</h2>
      <p className="text-sm text-zinc-500 mb-6">
        {recipientCount} wallet{recipientCount !== 1 ? 's' : ''} funded on Base
      </p>

      <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl overflow-hidden mb-4 text-left">
        <div className="p-4 border-b border-white/[0.06]">
          <p className="text-[0.65rem] font-bold text-zinc-600 uppercase tracking-wider mb-1">Receipt</p>
        </div>
        <div className="p-4 space-y-2">
          <ReceiptRow label="Purchased" value={`~$${fmt(totalSpend)} ${buyAsset}`} />
          <ReceiptRow label="Distributed" value={`~$${fmt(distributableAmount)} ${buyAsset}`} />
          <ReceiptRow label="Recipients" value={String(recipientCount)} />
          <ReceiptRow label="Each Received" value={`~$${fmt(distributableAmount / recipientCount)} ${buyAsset}`} />
          <ReceiptRow label="Network" value="Base (L2)" />
          {txHash && (
            <div className="flex justify-between items-center py-1 text-sm">
              <span className="text-zinc-500">Tx Hash</span>
              <a href={basescanUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-spraay-red hover:underline">
                {txHash.slice(0, 8)}…{txHash.slice(-6)} ↗
              </a>
            </div>
          )}
        </div>
      </div>

      {txHash && (
        <a href={basescanUrl} target="_blank" rel="noopener noreferrer" className="block w-full py-3 rounded-xl bg-[#0a0a0a] border border-white/[0.06] text-zinc-400 font-semibold text-sm mb-2 text-center hover:border-spraay-red/30 transition-colors">
          View on BaseScan ↗
        </a>
      )}

      <button onClick={handleShare} className="w-full py-3 rounded-xl bg-[#0a0a0a] border border-white/[0.06] text-zinc-400 font-semibold text-sm mb-2 hover:border-spraay-red/30 transition-colors">
        Share on Twitter/X
      </button>

      <button onClick={onReset} className="w-full py-3.5 rounded-2xl font-extrabold text-base bg-gradient-to-br from-spraay-red to-spraay-deep border border-spraay-red/40 text-white active:scale-[0.98] transition-transform min-h-[52px]">
        Spraay Again 💸
      </button>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-300 font-semibold font-mono">{value}</span>
    </div>
  );
}
