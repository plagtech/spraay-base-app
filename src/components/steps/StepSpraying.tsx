'use client';

interface StepSprayingProps {
  progress: number;
  statusMsg: string;
  recipientCount: number;
}

export function StepSpraying({ progress, statusMsg, recipientCount }: StepSprayingProps) {
  return (
    <div className="bg-white border border-[rgba(0,144,224,0.2)] rounded-2xl p-8 relative text-center">
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-spraay-blue/30 to-transparent" />

      {/* Animated spray icon */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-spraay-blue/20 to-spraay-deep/20 animate-pulse-glow" />
        <div className="absolute inset-2 rounded-full bg-[#f0f7ff] flex items-center justify-center">
          <span className="text-4xl">{progress >= 100 ? '✅' : '💸'}</span>
        </div>
        {/* Spinning ring */}
        {progress < 100 && (
          <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="rgba(0, 170, 255, 0.15)"
              strokeWidth="3"
            />
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="#0090e0"
              strokeWidth="3"
              strokeDasharray={`${progress * 2.89} ${289 - progress * 2.89}`}
              strokeDashoffset="0"
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              className="transition-all duration-700"
            />
          </svg>
        )}
      </div>

      {/* Status */}
      <h2 className="text-xl font-extrabold mb-2">
        {progress >= 100 ? 'Complete!' : 'Spraying…'}
      </h2>
      <p className="text-sm text-[#4a6070] mb-6">{statusMsg}</p>

      {/* Progress bar */}
      <div className="bg-[#f0f7ff] rounded-full h-2 overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-spraay-blue to-spraay-deep rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-[#8aa5b8] font-mono">{progress}% · {recipientCount} recipient{recipientCount !== 1 ? 's' : ''}</p>

      {/* Steps */}
      <div className="mt-6 space-y-2 text-left">
        <ProgressStep done={progress >= 5} active={progress < 30 && progress >= 5} label="Opening Coinbase Onramp" />
        <ProgressStep done={progress >= 30} active={progress >= 30 && progress < 50} label="Waiting for USDC" />
        <ProgressStep done={progress >= 50} active={progress >= 50 && progress < 80} label="Preparing batch transaction" />
        <ProgressStep done={progress >= 80} active={progress >= 80 && progress < 100} label="Confirming on Base" />
        <ProgressStep done={progress >= 100} active={false} label="Distribution complete" />
      </div>
    </div>
  );
}

function ProgressStep({ done, active, label }: { done: boolean; active: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-3 py-1.5 px-3 rounded-lg transition-all ${active ? 'bg-spraay-glow' : ''}`}>
      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
        done ? 'bg-spraay-blue text-[#0d1f2d]' : active ? 'bg-spraay-deep text-[#0d1f2d]' : 'bg-[#e0eef8] text-[#8aa5b8] border border-[rgba(0,144,224,0.2)]'
      }`}>
        {done ? '✓' : active ? (
          <div className="w-2 h-2 rounded-full bg-spraay-blue animate-pulse" />
        ) : ''}
      </div>
      <span className={`text-sm ${done ? 'text-[#4a6070]' : active ? 'text-[#0d1f2d] font-semibold' : 'text-[#8aa5b8]'}`}>
        {label}
      </span>
    </div>
  );
}
