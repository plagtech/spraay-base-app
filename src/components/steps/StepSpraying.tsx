'use client';

interface StepSprayingProps {
  progress: number;
  statusMsg: string;
  recipientCount: number;
}

export function StepSpraying({ progress, statusMsg, recipientCount }: StepSprayingProps) {
  return (
    <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-8 relative text-center">
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-spraay-red/30 to-transparent" />

      {/* Animated spray icon */}
      <div className="relative w-24 h-24 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-spraay-red/20 to-spraay-deep/20 animate-pulse-glow" />
        <div className="absolute inset-2 rounded-full bg-[#0a0a0a] flex items-center justify-center">
          <span className="text-4xl">{progress >= 100 ? '✅' : '💸'}</span>
        </div>
        {/* Spinning ring */}
        {progress < 100 && (
          <svg className="absolute inset-0 w-full h-full animate-spin-slow" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="rgba(220, 20, 60, 0.15)"
              strokeWidth="3"
            />
            <circle
              cx="50" cy="50" r="46"
              fill="none"
              stroke="#DC143C"
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
      <p className="text-sm text-zinc-400 mb-6">{statusMsg}</p>

      {/* Progress bar */}
      <div className="bg-[#0a0a0a] rounded-full h-2 overflow-hidden mb-2">
        <div
          className="h-full bg-gradient-to-r from-spraay-red to-spraay-deep rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-xs text-zinc-600 font-mono">{progress}% · {recipientCount} recipient{recipientCount !== 1 ? 's' : ''}</p>

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
        done ? 'bg-spraay-red text-white' : active ? 'bg-spraay-deep text-white' : 'bg-[#1a1a1d] text-zinc-600 border border-white/[0.06]'
      }`}>
        {done ? '✓' : active ? (
          <div className="w-2 h-2 rounded-full bg-spraay-red animate-pulse" />
        ) : ''}
      </div>
      <span className={`text-sm ${done ? 'text-zinc-400' : active ? 'text-white font-semibold' : 'text-zinc-600'}`}>
        {label}
      </span>
    </div>
  );
}
