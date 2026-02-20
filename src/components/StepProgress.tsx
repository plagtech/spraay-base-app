'use client';

import type { Step } from './BuyAndSpraayFlow';

const STEPS = [
  { key: 'amount', label: 'Amount' },
  { key: 'recipients', label: 'Recipients' },
  { key: 'breakdown', label: 'Review' },
] as const;

export function StepProgress({ currentStep }: { currentStep: Step }) {
  const currentIndex = STEPS.findIndex(s => s.key === currentStep);

  return (
    <div className="flex items-center gap-1 mb-6 px-2">
      {STEPS.map((s, i) => (
        <div key={s.key} className="flex items-center flex-1">
          {/* Step circle */}
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
              currentIndex > i
                ? 'bg-spraay-red text-white'
                : currentIndex === i
                  ? 'bg-spraay-deep text-white shadow-lg shadow-spraay-red/20'
                  : 'bg-[#1a1a1d] text-zinc-600 border border-white/[0.06]'
            }`}
          >
            {currentIndex > i ? '✓' : i + 1}
          </div>
          {/* Label (only on current) */}
          <span className={`text-[0.65rem] font-bold ml-1.5 transition-all ${
            currentIndex === i ? 'text-zinc-400' : 'text-transparent'
          }`}>
            {s.label}
          </span>
          {/* Connector line */}
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-[2px] mx-2 transition-all duration-300 ${
              currentIndex > i ? 'bg-spraay-red' : 'bg-white/[0.06]'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}
