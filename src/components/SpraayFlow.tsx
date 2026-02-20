'use client';

declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useState, useCallback, useMemo, useRef } from 'react';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';
import { StepAmount } from './steps/StepAmount';
import { StepRecipients } from './steps/StepRecipients';
import { StepBreakdown } from './steps/StepBreakdown';
import { StepSpraying } from './steps/StepSpraying';
import { StepComplete } from './steps/StepComplete';
import { StepProgress } from './StepProgress';
import { useOnramp } from '@/hooks/useOnramp';
import { useSprayTransaction } from '@/hooks/useSprayTransaction';

// ── Types ──
export type Step = 'amount' | 'recipients' | 'breakdown' | 'spraying' | 'complete';
export type SplitMode = 'even' | 'custom';

export interface Recipient {
  id: number;
  address: string;
  amount: string;
}

// ── Fee Constants ──
export const SPRAAY_FEE_BPS = 30; // 0.3% — matches contract feeBps
export const ONRAMP_FEE_USDC_BASE = 0; // Coinbase: 0% for USDC on Base
export const NETWORK_FEE_ESTIMATE_USD = 0.05; // Base network fees are minimal

export function SpraayFlow() {
  const { address: userAddress, isConnected } = useAccount();

  // ── Step State ──
  const [step, setStep] = useState<Step>('amount');
  const [spendAmount, setSpendAmount] = useState('');
  const [splitMode, setSplitMode] = useState<SplitMode>('even');
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: 1, address: '', amount: '' },
  ]);
  const nextId = useRef(2);

  // ── Hooks ──
  const onramp = useOnramp(userAddress);
  const spray = useSprayTransaction();

  // ── Derived Values ──
  const totalSpend = parseFloat(spendAmount) || 0;
  const spraayFee = totalSpend * (SPRAAY_FEE_BPS / 10000);
  const onrampFee = totalSpend * ONRAMP_FEE_USDC_BASE;
  const totalFees = spraayFee + onrampFee + NETWORK_FEE_ESTIMATE_USD;
  const distributableAmount = Math.max(0, totalSpend - totalFees);

  const validRecipients = useMemo(() => {
    return recipients.filter(r => isAddress(r.address));
  }, [recipients]);

  const evenSplitAmount = validRecipients.length > 0
    ? distributableAmount / validRecipients.length
    : 0;

  const customTotal = recipients.reduce(
    (sum, r) => sum + (parseFloat(r.amount) || 0), 0
  );

  // ── Recipient Handlers ──
  const addRecipient = useCallback(() => {
    if (recipients.length >= 200) return;
    const id = nextId.current++;
    setRecipients(prev => [...prev, { id, address: '', amount: '' }]);
  }, [recipients.length]);

  const removeRecipient = useCallback((id: number) => {
    setRecipients(prev => prev.length <= 1 ? prev : prev.filter(r => r.id !== id));
  }, []);

  const updateRecipient = useCallback((id: number, field: 'address' | 'amount', value: string) => {
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }, []);

  const handleCSV = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && !l.toLowerCase().startsWith('address'));
      const parsed: Recipient[] = [];
      for (const line of lines) {
        if (parsed.length >= 200) break;
        const parts = line.split(/[,\s]+/).filter(Boolean);
        if (parts.length >= 1 && isAddress(parts[0])) {
          const id = nextId.current++;
          parsed.push({ id, address: parts[0], amount: parts[1] || '' });
        }
      }
      if (parsed.length > 0) {
        setRecipients(parsed);
        if (parsed.some(r => r.amount)) setSplitMode('custom');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  // ── Buy & Spraay Execution ──
  const handleBuyAndSpray = useCallback(async () => {
    setStep('spraying');

    try {
      // Step 1: Open Coinbase Onramp for the user to buy USDC
      spray.setProgress(5);
      spray.setStatusMsg('Opening Coinbase Onramp…');

      await onramp.openOnramp(totalSpend);

      // Step 2: Wait for funds to arrive (poll balance)
      spray.setProgress(30);
      spray.setStatusMsg('Waiting for USDC to arrive…');

      // In production, you'd poll the user's USDC balance here.
      // For now, we proceed after a brief wait to let the onramp complete.
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 3: Execute the batch transaction
      spray.setProgress(50);
      spray.setStatusMsg('Preparing batch transaction…');

      const recipientList = validRecipients.map(r => ({
        address: r.address,
        amount: splitMode === 'even'
          ? evenSplitAmount.toFixed(6)
          : (parseFloat(r.amount) || 0).toFixed(6),
      }));

      const txHash = await spray.executeSpray({
        recipients: recipientList,
        isEqual: splitMode === 'even',
        equalAmount: evenSplitAmount.toFixed(6),
        token: 'USDC',
      });

      spray.setProgress(100);
      spray.setTxHash(txHash);

      setTimeout(() => setStep('complete'), 800);

    } catch (err: any) {
      let msg = err?.reason || err?.message || 'Transaction failed';
      if (msg.includes('user rejected') || msg.includes('User denied')) msg = 'Transaction cancelled.';
      else if (msg.includes('insufficient')) msg = 'Insufficient USDC balance. Did the purchase complete?';
      else if (msg.length > 150) msg = msg.slice(0, 150) + '…';
      spray.setError(msg);
      setStep('breakdown'); // Return to review
    }
  }, [totalSpend, validRecipients, splitMode, evenSplitAmount, onramp, spray]);

  // ── Direct Spraay (already have funds) ──
  const handleDirectSpray = useCallback(async () => {
    setStep('spraying');

    try {
      spray.setProgress(10);
      spray.setStatusMsg('Confirm in your wallet…');

      const recipientList = validRecipients.map(r => ({
        address: r.address,
        amount: splitMode === 'even'
          ? evenSplitAmount.toFixed(6)
          : (parseFloat(r.amount) || 0).toFixed(6),
      }));

      const txHash = await spray.executeSpray({
        recipients: recipientList,
        isEqual: splitMode === 'even',
        equalAmount: evenSplitAmount.toFixed(6),
        token: 'USDC',
      });

      spray.setProgress(100);
      spray.setTxHash(txHash);
      setTimeout(() => setStep('complete'), 800);
    } catch (err: any) {
      let msg = err?.reason || err?.message || 'Transaction failed';
      if (msg.includes('user rejected') || msg.includes('User denied')) msg = 'Transaction cancelled.';
      else if (msg.length > 150) msg = msg.slice(0, 150) + '…';
      spray.setError(msg);
      setStep('breakdown');
    }
  }, [validRecipients, splitMode, evenSplitAmount, spray]);

  // ── Reset ──
  const resetFlow = useCallback(() => {
    setStep('amount');
    setSpendAmount('');
    setSplitMode('even');
    nextId.current = 2;
    setRecipients([{ id: 1, address: '', amount: '' }]);
    spray.reset();
    onramp.reset();
  }, [spray, onramp]);

  // ── Can proceed checks ──
  const canGoToRecipients = totalSpend >= 1;
  const canGoToBreakdown = validRecipients.length >= 1 &&
    (splitMode === 'even' || customTotal <= distributableAmount);

  return (
    <main className="max-w-[540px] mx-auto px-4 pb-24">
      {/* Title */}
      <div className="text-center py-5">
        <h1 className="text-2xl font-black tracking-tight">
          Buy &amp; <span className="bg-gradient-to-br from-spraay-red to-spraay-deep bg-clip-text text-transparent">Spraay</span>
        </h1>
        <p className="text-sm text-zinc-600 mt-1">
          Buy USDC and send to multiple wallets in one flow
        </p>
      </div>

      {/* Progress Steps */}
      {step !== 'spraying' && step !== 'complete' && (
        <StepProgress currentStep={step} />
      )}

      {/* Step Content */}
      <div className="animate-step-in">
        {step === 'amount' && (
          <StepAmount
            spendAmount={spendAmount}
            setSpendAmount={setSpendAmount}
            distributableAmount={distributableAmount}
            spraayFee={spraayFee}
            canProceed={canGoToRecipients}
            onNext={() => setStep('recipients')}
            isConnected={isConnected}
          />
        )}

        {step === 'recipients' && (
          <StepRecipients
            recipients={recipients}
            splitMode={splitMode}
            setSplitMode={setSplitMode}
            evenSplitAmount={evenSplitAmount}
            distributableAmount={distributableAmount}
            customTotal={customTotal}
            totalSpend={totalSpend}
            validCount={validRecipients.length}
            onAdd={addRecipient}
            onRemove={removeRecipient}
            onUpdate={updateRecipient}
            onCSV={handleCSV}
            canProceed={canGoToBreakdown}
            onBack={() => setStep('amount')}
            onNext={() => setStep('breakdown')}
          />
        )}

        {step === 'breakdown' && (
          <StepBreakdown
            totalSpend={totalSpend}
            spraayFee={spraayFee}
            onrampFee={onrampFee}
            networkFee={NETWORK_FEE_ESTIMATE_USD}
            distributableAmount={distributableAmount}
            recipients={validRecipients}
            splitMode={splitMode}
            evenSplitAmount={evenSplitAmount}
            error={spray.error}
            onBack={() => setStep('recipients')}
            onBuyAndSpray={handleBuyAndSpray}
            onDirectSpray={handleDirectSpray}
            isConnected={isConnected}
          />
        )}

        {step === 'spraying' && (
          <StepSpraying
            progress={spray.progress}
            statusMsg={spray.statusMsg}
            recipientCount={validRecipients.length}
          />
        )}

        {step === 'complete' && (
          <StepComplete
            totalSpend={totalSpend}
            distributableAmount={distributableAmount}
            recipientCount={validRecipients.length}
            txHash={spray.txHash}
            onReset={resetFlow}
          />
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-zinc-600 space-x-2">
        <a href="https://spraay.app" className="hover:text-zinc-400 transition-colors">spraay.app</a>
        <span>·</span>
        <a href="https://basescan.org/address/0x1646452F98E36A3c9Cfc3eDD8868221E207B5eEC" target="_blank" className="hover:text-zinc-400 transition-colors">BaseScan</a>
        <span>·</span>
        <a href="https://twitter.com/Spraay_app" target="_blank" className="hover:text-zinc-400 transition-colors">@Spraay_app</a>
      </div>
    </main>
  );
}
