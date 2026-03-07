'use client';

// Extend Window for injected wallet providers
declare global {
  interface Window {
    ethereum?: any;
  }
}

import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { isAddress } from 'viem';
import { RecipientRow } from './RecipientRow';
import { useEthPrice } from '@/lib/useEthPrice';
import {
  SPRAY_CONTRACT_ADDRESS,
  COMMON_TOKENS,
  type TokenKey,
} from '@/lib/contracts';
import { ethers } from 'ethers';

// ── Ethers.js v5 ABI (same format as working standalone) ──
const ETHERS_ABI = [
  "function sprayETH(tuple(address recipient, uint256 amount)[] recipients) payable",
  "function sprayToken(address token, tuple(address recipient, uint256 amount)[] recipients)",
  "function sprayEqual(address token, address[] recipients, uint256 amountPerRecipient) payable",
  "function calculateFee(uint256 amount) view returns (uint256)",
  "function feeBps() view returns (uint256)",
];

const ETHERS_ERC20_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function balanceOf(address account) view returns (uint256)",
];

interface Recipient {
  id: number;
  address: string;
  amount: string;
}

export function SprayApp() {
  const { address: userAddress, isConnected } = useAccount();
  const { price: ethPrice, toUsd } = useEthPrice();

  const [mode, setMode] = useState<'eth' | 'erc20'>('eth');
  const [equalMode, setEqualMode] = useState(false);
  const [equalAmount, setEqualAmount] = useState('');
  const [tokenAddress, setTokenAddress] = useState('');
  const [activeTokenPick, setActiveTokenPick] = useState<TokenKey | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([
    { id: 1, address: '', amount: '' },
    { id: 2, address: '', amount: '' },
    { id: 3, address: '', amount: '' },
  ]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [txStatus, setTxStatus] = useState<{ type: 'success' | 'error' | 'info'; msg: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [customSymbol, setCustomSymbol] = useState<string | null>(null);
  const [isFetchingSymbol, setIsFetchingSymbol] = useState(false);
  const nextId = useRef(4);
  const csvRef = useRef<HTMLInputElement>(null);

  // ── Reset form after successful spray ──
  const resetForm = useCallback(() => {
    nextId.current = 4;
    setRecipients([
      { id: 1, address: '', amount: '' },
      { id: 2, address: '', amount: '' },
      { id: 3, address: '', amount: '' },
    ]);
    setEqualAmount('');
    setTxHash(null);
  }, []);

  // ── Fetch token symbol on-chain when custom address is entered ──
  useEffect(() => {
    if (mode !== 'erc20') return;
    const addr = tokenAddress.trim().toLowerCase();

    // If it's a known token, no need to fetch
    for (const info of Object.values(COMMON_TOKENS)) {
      if (info.address.toLowerCase() === addr) {
        setCustomSymbol(null);
        return;
      }
    }

    // If not a valid address, reset
    if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddress.trim())) {
      setCustomSymbol(null);
      return;
    }

    // Debounce 400ms then fetch symbol from chain
    let cancelled = false;
    setIsFetchingSymbol(true);
    const timer = setTimeout(async () => {
      try {
        const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
        const token = new ethers.Contract(tokenAddress.trim(), ETHERS_ERC20_ABI, provider);
        const sym = await token.symbol();
        if (!cancelled) setCustomSymbol(sym);
      } catch {
        if (!cancelled) setCustomSymbol(null);
      } finally {
        if (!cancelled) setIsFetchingSymbol(false);
      }
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [tokenAddress, mode]);

  // ── Derived State ───────────────────────────
  const symbol = useMemo(() => {
    if (mode === 'eth') return 'ETH';
    const addr = tokenAddress.toLowerCase();
    for (const [sym, info] of Object.entries(COMMON_TOKENS)) {
      if (info.address.toLowerCase() === addr) return sym;
    }
    return customSymbol || (isFetchingSymbol ? '…' : 'TKN');
  }, [mode, tokenAddress, customSymbol, isFetchingSymbol]);

  const validRecipients = useMemo(() => {
    return recipients.filter(r => {
      if (!isAddress(r.address)) return false;
      if (equalMode) return true;
      return parseFloat(r.amount) > 0;
    });
  }, [recipients, equalMode]);

  const { totalAmount, fee, grandTotal } = useMemo(() => {
    let total = 0;
    if (equalMode) {
      const per = parseFloat(equalAmount) || 0;
      total = per * validRecipients.length;
    } else {
      for (const r of validRecipients) {
        total += parseFloat(r.amount) || 0;
      }
    }
    const f = total * 0.003;
    return { totalAmount: total, fee: f, grandTotal: total + f };
  }, [validRecipients, equalMode, equalAmount]);

  // ── Handlers ────────────────────────────────
  const updateAddress = useCallback((id: number, value: string) => {
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, address: value } : r));
  }, []);

  const updateAmount = useCallback((id: number, value: string) => {
    setRecipients(prev => prev.map(r => r.id === id ? { ...r, amount: value } : r));
  }, []);

  const removeRow = useCallback((id: number) => {
    setRecipients(prev => prev.length <= 1 ? prev : prev.filter(r => r.id !== id));
  }, []);

  const addRow = useCallback((address?: string, amount?: string) => {
    if (recipients.length >= 200) {
      setTxStatus({ type: 'error', msg: 'Max 200 recipients per transaction.' });
      return;
    }
    const id = nextId.current++;
    setRecipients(prev => [...prev, { id, address: address || '', amount: amount || '' }]);
  }, [recipients.length]);

  const pickToken = useCallback((key: TokenKey) => {
    const token = COMMON_TOKENS[key];
    setTokenAddress(token.address);
    setActiveTokenPick(key);
  }, []);

  const handleCSV = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#') && !l.toLowerCase().startsWith('address'));
      const newRecipients: Recipient[] = [];
      for (const line of lines) {
        if (newRecipients.length >= 200) break;
        const parts = line.split(/[,\s]+/).filter(Boolean);
        if (parts.length >= 1 && isAddress(parts[0])) {
          const id = nextId.current++;
          newRecipients.push({ id, address: parts[0], amount: parts[1] || '' });
        }
      }
      setRecipients(newRecipients);
      setTxStatus({ type: 'info', msg: `Loaded ${newRecipients.length} recipients from CSV.` });
    };
    reader.readAsText(file);
    e.target.value = '';
  }, []);

  // ══════════════════════════════════════════════
  // SEND TRANSACTION — Using ethers.js v5 directly
  // This matches the working standalone HTML version exactly.
  // ══════════════════════════════════════════════
  const handleSend = useCallback(async () => {
    setTxStatus({ type: 'info', msg: 'Confirm in your wallet…' });
    setIsSending(true);
    setTxHash(null);

    try {
      if (!window.ethereum) {
        throw new Error('No wallet found. Make sure MetaMask is installed and unlocked.');
      }

      // ── Find the correct provider ──
      // Handles multiple wallet extensions (MetaMask, OKX, Coinbase, etc.)
      let provider: any = null;
      if (window.ethereum.providers?.length) {
        provider = window.ethereum.providers.find(
          (p: any) => p.isMetaMask && !p.isOkxWallet && !p.isCoinbaseWallet
        ) || window.ethereum.providers.find(
          (p: any) => !p.isOkxWallet
        ) || window.ethereum.providers[0];
      } else {
        provider = window.ethereum;
      }

      // Request account access
      await provider.request({ method: 'eth_requestAccounts' });

      // Ensure we're on Base (chainId 8453 = 0x2105)
      const chainId = await provider.request({ method: 'eth_chainId' });
      if (chainId !== '0x2105') {
        try {
          await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x2105' }] });
        } catch (switchErr: any) {
          if (switchErr.code === 4902) {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [{ chainId: '0x2105', chainName: 'Base', nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 }, rpcUrls: ['https://mainnet.base.org'], blockExplorerUrls: ['https://basescan.org'] }]
            });
          } else throw switchErr;
        }
      }

      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const contract = new ethers.Contract(SPRAY_CONTRACT_ADDRESS, ETHERS_ABI, signer);

      // Dynamic gas limit: base cost + per-recipient overhead
      // ~80k base + ~40k per recipient, with 20% buffer
      const recipientCount = validRecipients.length;
      const gasLimit = Math.ceil((80000 + recipientCount * 40000) * 1.2);

      if (mode === 'eth') {
        if (equalMode) {
          // ── sprayEqual (ETH) ──
          const perWei = ethers.utils.parseEther(equalAmount || '0');
          const addrs = validRecipients.map(r => r.address);
          const total = perWei.mul(addrs.length);
          const feeWei = total.mul(30).div(10000);

          const tx = await contract.sprayEqual(
            ethers.constants.AddressZero,
            addrs,
            perWei,
            { value: total.add(feeWei), gasLimit }
          );

          setTxHash(tx.hash);
          setIsSending(false);
          setIsConfirming(true);
          setTxStatus({ type: 'info', msg: 'Submitted! Waiting for confirmation…' });

          const receipt = await tx.wait();
          setIsConfirming(false);
          setShowConfirm(false);
          resetForm();
          setTxStatus({
            type: 'success',
            msg: `✅ Sprayed to ${addrs.length} wallets! <a href="https://basescan.org/tx/${receipt.transactionHash}" target="_blank" class="underline">View on BaseScan →</a>`,
          });

        } else {
          // ── sprayETH (individual amounts) ──
          const tuples = validRecipients.map(r => ({
            recipient: r.address,
            amount: ethers.utils.parseEther(r.amount || '0'),
          }));
          let total = ethers.BigNumber.from(0);
          for (const t of tuples) total = total.add(t.amount);
          const feeWei = total.mul(30).div(10000);

          const tx = await contract.sprayETH(tuples, {
            value: total.add(feeWei),
            gasLimit,
          });

          setTxHash(tx.hash);
          setIsSending(false);
          setIsConfirming(true);
          setTxStatus({ type: 'info', msg: 'Submitted! Waiting for confirmation…' });

          const receipt = await tx.wait();
          setIsConfirming(false);
          setShowConfirm(false);
          resetForm();
          setTxStatus({
            type: 'success',
            msg: `✅ Sprayed to ${tuples.length} wallets! <a href="https://basescan.org/tx/${receipt.transactionHash}" target="_blank" class="underline">View on BaseScan →</a>`,
          });
        }

      } else {
        // ── ERC-20 Mode ──
        const tokenAddr = tokenAddress.trim();
        if (!/^0x[a-fA-F0-9]{40}$/.test(tokenAddr)) {
          throw new Error('Enter a valid token address.');
        }

        const token = new ethers.Contract(tokenAddr, ETHERS_ERC20_ABI, signer);
        let decimals: number;
        try { decimals = await token.decimals(); } catch { decimals = 18; }

        const signerAddress = await signer.getAddress();

        if (equalMode) {
          // ── sprayEqual (ERC-20) ──
          const perUnit = ethers.utils.parseUnits(equalAmount || '0', decimals);
          const addrs = validRecipients.map(r => r.address);
          const total = perUnit.mul(addrs.length);
          const feeWei = total.mul(30).div(10000);
          const needed = total.add(feeWei);

          const allowance = await token.allowance(signerAddress, SPRAY_CONTRACT_ADDRESS);
          if (allowance.lt(needed)) {
            setTxStatus({ type: 'info', msg: 'Approving token… confirm in wallet.' });
            const appTx = await token.approve(SPRAY_CONTRACT_ADDRESS, needed);
            await appTx.wait();
          }

          setTxStatus({ type: 'info', msg: 'Confirm spray in your wallet…' });
          const tx = await contract.sprayEqual(tokenAddr, addrs, perUnit, { gasLimit });

          setTxHash(tx.hash);
          setIsSending(false);
          setIsConfirming(true);
          setTxStatus({ type: 'info', msg: 'Submitted! Waiting for confirmation…' });

          const receipt = await tx.wait();
          setIsConfirming(false);
          setShowConfirm(false);
          resetForm();
          setTxStatus({
            type: 'success',
            msg: `✅ Sprayed to ${addrs.length} wallets! <a href="https://basescan.org/tx/${receipt.transactionHash}" target="_blank" class="underline">View on BaseScan →</a>`,
          });

        } else {
          // ── sprayToken (individual amounts) ──
          const tuples = validRecipients.map(r => ({
            recipient: r.address,
            amount: ethers.utils.parseUnits(r.amount || '0', decimals),
          }));
          let total = ethers.BigNumber.from(0);
          for (const t of tuples) total = total.add(t.amount);
          const feeWei = total.mul(30).div(10000);
          const needed = total.add(feeWei);

          const allowance = await token.allowance(signerAddress, SPRAY_CONTRACT_ADDRESS);
          if (allowance.lt(needed)) {
            setTxStatus({ type: 'info', msg: 'Approving token… confirm in wallet.' });
            const appTx = await token.approve(SPRAY_CONTRACT_ADDRESS, needed);
            await appTx.wait();
          }

          setTxStatus({ type: 'info', msg: 'Confirm spray in your wallet…' });
          const tx = await contract.sprayToken(tokenAddr, tuples, { gasLimit });

          setTxHash(tx.hash);
          setIsSending(false);
          setIsConfirming(true);
          setTxStatus({ type: 'info', msg: 'Submitted! Waiting for confirmation…' });

          const receipt = await tx.wait();
          setIsConfirming(false);
          setShowConfirm(false);
          resetForm();
          setTxStatus({
            type: 'success',
            msg: `✅ Sprayed to ${tuples.length} wallets! <a href="https://basescan.org/tx/${receipt.transactionHash}" target="_blank" class="underline">View on BaseScan →</a>`,
          });
        }
      }

    } catch (err: any) {
      setIsSending(false);
      setIsConfirming(false);
      let msg = err?.reason || err?.message || 'Transaction failed';
      if (msg.includes('user rejected') || msg.includes('User denied')) msg = 'Transaction rejected.';
      else if (msg.includes('insufficient funds')) msg = 'Insufficient ETH balance.';
      else if (msg.length > 150) msg = msg.slice(0, 150) + '…';
      setTxStatus({ type: 'error', msg });
    }
  }, [mode, equalMode, equalAmount, validRecipients, tokenAddress, resetForm]);

  // ── Modal Data ──────────────────────────────
  const modalRecipients = useMemo(() => {
    return validRecipients.map(r => ({
      address: r.address,
      amount: equalMode ? (parseFloat(equalAmount) || 0).toFixed(6) : (parseFloat(r.amount) || 0).toFixed(6),
    }));
  }, [validRecipients, equalMode, equalAmount]);

  const canSpray = validRecipients.length > 0 && grandTotal > 0;
  const isEthMode = mode === 'eth';

  return (
    <main className="max-w-[540px] mx-auto px-4 pb-24">
      {/* Title */}
      <div className="text-center py-5">
        <h1 className="text-2xl font-black tracking-tight">
          Batch <span className="bg-gradient-to-br from-spraay-blue to-spraay-deep bg-clip-text text-transparent">Send</span>
        </h1>
        <p className="text-sm text-[#8aa5b8] mt-1">Send to 200+ wallets in one transaction</p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-[rgba(0,144,224,0.2)] rounded-2xl p-5 relative">
        <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-spraay-blue/30 to-transparent" />

        {/* Mode Toggle */}
        <div className="flex bg-[#f0f7ff] rounded-xl p-0.5 border border-[rgba(0,144,224,0.2)] mb-4">
          <button
            onClick={() => setMode('eth')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'eth' ? 'bg-spraay-deep text-[#0d1f2d] shadow-lg shadow-spraay-blue/20' : 'text-[#8aa5b8]'}`}
          >
            ETH
          </button>
          <button
            onClick={() => setMode('erc20')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === 'erc20' ? 'bg-spraay-deep text-[#0d1f2d] shadow-lg shadow-spraay-blue/20' : 'text-[#8aa5b8]'}`}
          >
            ERC-20
          </button>
        </div>

        {/* Token Section */}
        {mode === 'erc20' && (
          <div className="mb-4">
            <label className="block text-[0.72rem] font-bold text-[#8aa5b8] uppercase tracking-wider mb-1.5">
              Token Address
            </label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => { setTokenAddress(e.target.value); setActiveTokenPick(null); }}
              placeholder="0x… paste ERC-20 address"
              className="w-full px-3 py-3 bg-white border border-[rgba(0,144,224,0.2)] rounded-lg text-[#0d1f2d] font-mono text-sm outline-none focus:border-spraay-blue/50 placeholder:text-[#8aa5b8] transition-colors"
            />
            <div className="flex gap-1.5 mt-2">
              {(Object.keys(COMMON_TOKENS) as TokenKey[]).map(key => (
                <button
                  key={key}
                  onClick={() => pickToken(key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeTokenPick === key ? 'border-spraay-blue/40 text-spraay-blue bg-spraay-glow' : 'border-[rgba(0,144,224,0.2)] text-[#8aa5b8] bg-[#f0f7ff]'} border`}
                >
                  {key}
                </button>
              ))}
            </div>
            {/* Show detected token symbol for custom addresses */}
            {customSymbol && !activeTokenPick && (
              <div className="mt-2 flex items-center gap-1.5">
                <span className="text-xs font-bold text-green-400">✓</span>
                <span className="text-xs font-semibold text-[#4a6070]">Detected: <span className="text-[#0d1f2d] font-bold">{customSymbol}</span></span>
              </div>
            )}
            {isFetchingSymbol && !activeTokenPick && (
              <p className="mt-2 text-xs text-[#8aa5b8]">Looking up token…</p>
            )}
          </div>
        )}

        {/* Equal Mode Toggle */}
        <div className="flex items-center justify-between py-3 mb-2">
          <span className="text-sm font-semibold text-[#4a6070]">Equal amount to all</span>
          <button
            onClick={() => setEqualMode(!equalMode)}
            className={`w-11 h-6 rounded-full relative transition-colors ${equalMode ? 'bg-spraay-blue' : 'bg-[#c0d5e5]'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${equalMode ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {/* Equal Amount Input */}
        {equalMode && (
          <div className="mb-4">
            <label className="block text-[0.72rem] font-bold text-[#8aa5b8] uppercase tracking-wider mb-1.5">
              Amount Per Recipient
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={equalAmount}
                onChange={(e) => setEqualAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-3 pr-14 bg-white border border-[rgba(0,144,224,0.2)] rounded-lg text-[#0d1f2d] font-mono text-base outline-none focus:border-spraay-blue/50 placeholder:text-[#8aa5b8] transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8aa5b8]">{symbol}</span>
            </div>
            {isEthMode && parseFloat(equalAmount) > 0 && (
              <p className="text-[0.72rem] text-[#8aa5b8] font-mono mt-1">{toUsd(parseFloat(equalAmount))}</p>
            )}
          </div>
        )}

        {/* Recipients Header */}
        <div className="flex justify-between items-center mb-2">
          <label className="text-[0.72rem] font-bold text-[#8aa5b8] uppercase tracking-wider">Recipients</label>
          <span className="text-xs text-[#8aa5b8] font-mono">
            <strong className="text-[#4a6070]">{recipients.length}</strong> / 200
          </span>
        </div>

        {/* Recipient Rows */}
        <div className="flex flex-col gap-2 mb-3">
          {recipients.map((r, i) => (
            <RecipientRow
              key={r.id}
              id={r.id}
              index={i + 1}
              address={r.address}
              amount={r.amount}
              symbol={symbol}
              equalMode={equalMode}
              usdHint={isEthMode ? toUsd(parseFloat(r.amount) || 0) : ''}
              onAddressChange={updateAddress}
              onAmountChange={updateAmount}
              onRemove={removeRow}
              canRemove={recipients.length > 1}
            />
          ))}
        </div>

        {/* Add + CSV */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => addRow()}
            className="flex-1 py-3 rounded-lg border border-dashed border-[rgba(0,144,224,0.2)] text-[#8aa5b8] font-semibold text-sm active:border-spraay-blue/30 active:text-spraay-blue active:bg-spraay-glow transition-all"
          >
            + Add Recipient
          </button>
          <button
            onClick={() => csvRef.current?.click()}
            className="flex-1 py-3 rounded-lg border border-dashed border-[rgba(0,144,224,0.2)] text-[#8aa5b8] font-semibold text-sm active:border-spraay-blue/30 active:text-spraay-blue active:bg-spraay-glow transition-all"
          >
            📋 CSV Upload
          </button>
          <input ref={csvRef} type="file" accept=".csv,.txt" onChange={handleCSV} className="hidden" />
        </div>

        {/* Summary */}
        <div className="bg-[#f0f7ff] border border-[rgba(0,144,224,0.2)] rounded-xl p-4 mb-4">
          <SummaryLine label="Recipients" value={String(validRecipients.length)} />
          <SummaryLine
            label="Total Amount"
            value={`${totalAmount.toFixed(6)} ${symbol}`}
            usd={isEthMode ? toUsd(totalAmount) : ''}
          />
          <SummaryLine
            label="Fee (0.3%)"
            value={`${fee.toFixed(6)} ${symbol}`}
            usd={isEthMode ? toUsd(fee) : ''}
          />
          <div className="flex justify-between items-center pt-3 mt-2 border-t border-spraay-blue/20">
            <span className="text-sm font-bold">Total Cost</span>
            <span className="font-mono font-bold text-spraay-blue">
              {grandTotal.toFixed(6)} {symbol}
              {isEthMode && toUsd(grandTotal) && (
                <span className="text-[#8aa5b8] text-xs font-normal ml-1">{toUsd(grandTotal)}</span>
              )}
            </span>
          </div>
        </div>

        {/* Spray Button — opens confirmation modal */}
        {isConnected ? (
          <button
            onClick={() => { setTxStatus(null); setShowConfirm(true); }}
            disabled={!canSpray}
            className="w-full py-3.5 rounded-2xl font-extrabold text-base bg-gradient-to-br from-spraay-blue to-spraay-deep border border-spraay-bright/40 text-white active:scale-[0.98] transition-transform disabled:opacity-40 disabled:cursor-not-allowed min-h-[52px]"
          >
            {canSpray ? `🚀 Spray ${grandTotal.toFixed(4)} ${symbol}` : 'Add recipients to spray'}
          </button>
        ) : (
          <div className="text-center py-3">
            <p className="text-sm text-[#8aa5b8]">Connect your wallet above to spray</p>
          </div>
        )}

        {/* Status Message */}
        {txStatus && (
          <div className={`mt-3 p-3 rounded-lg text-sm ${
            txStatus.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
            txStatus.type === 'error' ? 'bg-spraay-blue/10 border border-spraay-blue/20 text-spraay-blue' :
            'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
          }`} dangerouslySetInnerHTML={{ __html: txStatus.msg }} />
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-[#8aa5b8] space-x-2">
        <a href="https://spraay.app" className="hover:text-spraay-blue transition-colors">spraay.app</a>
        <span>·</span>
        <a href="https://basescan.org/address/0x1646452F98E36A3c9Cfc3eDD8868221E207B5eEC" target="_blank" className="hover:text-spraay-blue transition-colors">BaseScan</a>
        <span>·</span>
        <a href="https://twitter.com/Spraay_app" target="_blank" className="hover:text-spraay-blue transition-colors">@Spraay_app</a>
      </div>

      {/* ═══════════════════════════════════════════
          CONFIRMATION MODAL
          ═══════════════════════════════════════════ */}
      {showConfirm && (
        <div
          className="fixed inset-0 z-[1000] bg-[#0d1f2d]/60 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={(e) => { if (e.target === e.currentTarget) setShowConfirm(false); }}
        >
          <div className="animate-slide-up bg-white border border-[rgba(0,144,224,0.2)] rounded-t-2xl sm:rounded-2xl w-full max-w-[540px] p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] max-h-[85dvh] overflow-y-auto">
            {/* Handle */}
            <div className="w-9 h-1 rounded-full bg-[#8aa5b8] mx-auto mb-4 sm:hidden" />

            <h3 className="text-lg font-extrabold text-center">⚡ Confirm Spray</h3>
            <p className="text-sm text-[#8aa5b8] text-center mb-4">Review details, then tap Send below</p>

            {/* Recipients Preview */}
            <div className="max-h-40 overflow-y-auto bg-[#f0f7ff] border border-[rgba(0,144,224,0.2)] rounded-lg p-3 mb-3">
              {modalRecipients.map((r, i) => (
                <div key={i} className="flex justify-between text-[0.72rem] font-mono py-0.5">
                  <span className="text-[#4a6070]">
                    {r.address.slice(0, 8)}…{r.address.slice(-6)}
                  </span>
                  <span className="text-[#8aa5b8]">
                    {r.amount} {symbol}
                  </span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-[#f0f7ff] border border-[rgba(0,144,224,0.2)] rounded-lg p-3.5 mb-4">
              <ModalRow label="Recipients" value={String(validRecipients.length)} />
              <ModalRow
                label="Amount"
                value={`${totalAmount.toFixed(6)} ${symbol}`}
                usd={isEthMode ? toUsd(totalAmount) : ''}
              />
              <ModalRow
                label="Fee (0.3%)"
                value={`${fee.toFixed(6)} ${symbol}`}
                usd={isEthMode ? toUsd(fee) : ''}
              />
              <div className="flex justify-between items-center pt-2.5 mt-1 border-t border-spraay-blue/20">
                <span className="text-sm font-bold text-[#0d1f2d]">You Pay</span>
                <span className="font-mono font-bold text-spraay-blue text-base">
                  {grandTotal.toFixed(6)} {symbol}
                  {isEthMode && toUsd(grandTotal) && (
                    <span className="text-[#8aa5b8] text-[0.7rem] font-normal ml-1">{toUsd(grandTotal)}</span>
                  )}
                </span>
              </div>
            </div>

            {/* ── Send Button (ethers.js v5) ── */}
            <div className="mb-3">
              <button
                onClick={handleSend}
                disabled={isSending || isConfirming}
                className="w-full py-3.5 rounded-xl font-extrabold text-base bg-gradient-to-br from-spraay-blue to-spraay-deep border border-spraay-bright/40 text-white min-h-[48px] active:scale-[0.98] transition-transform disabled:opacity-60"
              >
                {isSending ? '⏳ Confirm in Wallet…' :
                 isConfirming ? '⏳ Confirming on Base…' :
                 `🚀 Send ${grandTotal.toFixed(4)} ${symbol}`}
              </button>
              {txHash && (
                <p className="text-[0.72rem] text-[#8aa5b8] text-center mt-2 font-mono">
                  Tx: {txHash.slice(0, 10)}…{txHash.slice(-8)}
                </p>
              )}
            </div>

            {/* Cancel */}
            <button
              onClick={() => setShowConfirm(false)}
              className="w-full py-3 rounded-xl bg-[#f0f7ff] border border-[rgba(0,144,224,0.2)] text-[#8aa5b8] font-bold text-sm active:bg-[#e0eef8] transition-colors"
            >
              Cancel
            </button>

            <p className="text-[0.7rem] text-[#8aa5b8] text-center mt-3 leading-snug">
              Your wallet will ask for a final signature. No funds leave until you approve.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryLine({ label, value, usd }: { label: string; value: string; usd?: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-[rgba(0,144,224,0.1)] last:border-0">
      <span className="text-sm text-[#8aa5b8]">{label}</span>
      <span className="text-sm font-semibold font-mono">
        {value}
        {usd && <span className="text-[#8aa5b8] text-xs font-normal ml-1">{usd}</span>}
      </span>
    </div>
  );
}

function ModalRow({ label, value, usd }: { label: string; value: string; usd?: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-[rgba(0,144,224,0.1)] last:border-0 text-sm">
      <span className="text-[#8aa5b8]">{label}</span>
      <span className="font-semibold font-mono">
        {value}
        {usd && <span className="text-[#8aa5b8] text-[0.7rem] font-normal ml-1">{usd}</span>}
      </span>
    </div>
  );
}