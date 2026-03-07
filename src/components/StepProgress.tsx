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
                ? 'bg-spraay-blue text-[#0d1f2d]'
                : currentIndex === i
                  ? 'bg-spraay-deep text-[#0d1f2d] shadow-lg shadow-spraay-blue/20'
                  : 'bg-[#e0eef8] text-[#8aa5b8] border border-[rgba(0,144,224,0.2)]'
            }`}
          >
            {currentIndex > i ? '✓' : i + 1}
          </div>
          {/* Label (only on current) */}
          <span className={`text-[0.65rem] font-bold ml-1.5 transition-all ${
            currentIndex === i ? 'text-[#4a6070]' : 'text-transparent'
          }`}>
            {s.label}
          </span>
          {/* Connector line */}
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-[2px] mx-2 transition-all duration-300 ${
              currentIndex > i ? 'bg-spraay-blue' : 'bg-white/[0.06]'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
}
