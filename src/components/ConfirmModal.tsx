'use client';

import { useEffect } from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipients: { address: string; amount: string }[];
  symbol: string;
  totalAmount: number;
  fee: number;
  total: number;
  toUsd: (eth: number) => string;
  isEthMode: boolean;
}

export function ConfirmModal({
  isOpen, onClose, onConfirm, recipients,
  symbol, totalAmount, fee, total, toUsd, isEthMode,
}: ConfirmModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="animate-slide-up bg-white border border-[rgba(0,144,224,0.2)] rounded-t-2xl sm:rounded-2xl w-full max-w-[540px] p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] max-h-[85dvh] overflow-y-auto">
        {/* Handle */}
        <div className="w-9 h-1 rounded-full bg-[#c0d5e5] mx-auto mb-4 sm:hidden" />

        <h3 className="text-lg font-extrabold text-center">⚡ Confirm Spray</h3>
        <p className="text-sm text-[#8aa5b8] text-center mb-4">Review before sending</p>

        {/* Recipients Preview */}
        <div className="max-h-40 overflow-y-auto bg-[#f0f7ff] border border-[rgba(0,144,224,0.2)] rounded-lg p-3 mb-3">
          {recipients.map((r, i) => (
            <div key={i} className="flex justify-between text-[0.72rem] font-mono py-0.5">
              <span className="text-[#4a6070]">
                {r.address.slice(0, 8)}…{r.address.slice(-6)}
              </span>
              <span className="text-[#8aa5b8]">
                {parseFloat(r.amount).toFixed(6)} {symbol}
              </span>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="bg-[#f0f7ff] border border-[rgba(0,144,224,0.2)] rounded-lg p-3.5 mb-4">
          <SummaryRow label="Recipients" value={String(recipients.length)} />
          <SummaryRow
            label="Amount"
            value={`${totalAmount.toFixed(6)} ${symbol}`}
            usd={isEthMode ? toUsd(totalAmount) : ''}
          />
          <SummaryRow
            label="Fee (0.3%)"
            value={`${fee.toFixed(6)} ${symbol}`}
            usd={isEthMode ? toUsd(fee) : ''}
          />
          <div className="flex justify-between items-center pt-2.5 mt-1 border-t border-spraay-blue/20">
            <span className="text-sm font-bold text-white">You Pay</span>
            <span className="font-mono font-bold text-spraay-blue text-base">
              {total.toFixed(6)} {symbol}
              {isEthMode && toUsd(total) && (
                <span className="text-[#8aa5b8] text-[0.7rem] font-normal ml-1">{toUsd(total)}</span>
              )}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-xl bg-[#f0f7ff] border border-[rgba(0,144,224,0.2)] text-[#8aa5b8] font-bold text-sm active:bg-[#e0eef8] transition-colors min-h-[48px]"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3.5 rounded-xl bg-gradient-to-br from-spraay-blue to-spraay-deep border border-spraay-blue/40 text-white font-bold text-sm active:scale-[0.98] transition-transform min-h-[48px]"
          >
            Confirm & Send
          </button>
        </div>

        <p className="text-[0.7rem] text-[#8aa5b8] text-center mt-3 leading-snug">
          Your wallet will ask for a final signature. No funds leave until you approve.
        </p>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, usd }: { label: string; value: string; usd?: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-[rgba(0,144,224,0.1)] last:border-0">
      <span className="text-sm text-[#8aa5b8]">{label}</span>
      <span className="text-sm font-semibold font-mono">
        {value}
        {usd && <span className="text-[#8aa5b8] text-[0.7rem] font-normal ml-1">{usd}</span>}
      </span>
    </div>
  );
}
