'use client';

import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import {
  SPRAY_CONTRACT_ADDRESS,
  ETHERS_ABI,
  ETHERS_ERC20_ABI,
  COMMON_TOKENS,
} from '@/lib/contracts';

interface SprayParams {
  recipients: { address: string; amount: string }[];
  isEqual: boolean;
  equalAmount: string;
  token: 'ETH' | 'USDC' | 'DAI' | 'WETH' | string;
}

interface UseSprayTransactionReturn {
  executeSpray: (params: SprayParams) => Promise<string>;
  progress: number;
  setProgress: (p: number) => void;
  statusMsg: string;
  setStatusMsg: (msg: string) => void;
  txHash: string | null;
  setTxHash: (h: string | null) => void;
  error: string | null;
  setError: (e: string | null) => void;
  reset: () => void;
}

/**
 * Hook for executing Spraay batch transactions.
 *
 * Uses ethers.js v5 directly (same approach as V1 SprayApp.tsx).
 * Handles ETH and ERC-20 (USDC, DAI, etc.) batch sends.
 *
 * The contract automatically deducts 0.3% fee (30 bps).
 */
export function useSprayTransaction(): UseSprayTransactionReturn {
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const executeSpray = useCallback(async (params: SprayParams): Promise<string> => {
    const { recipients, isEqual, equalAmount, token } = params;

    if (!window.ethereum) {
      throw new Error('No wallet found. Make sure your wallet is installed and unlocked.');
    }

    // ── Find the correct provider ──
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
            params: [{
              chainId: '0x2105',
              chainName: 'Base',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://mainnet.base.org'],
              blockExplorerUrls: ['https://basescan.org'],
            }],
          });
        } else throw switchErr;
      }
    }

    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const contract = new ethers.Contract(SPRAY_CONTRACT_ADDRESS, ETHERS_ABI, signer);

    // Dynamic gas limit: base cost + per-recipient overhead + 20% buffer
    const recipientCount = recipients.length;
    const gasLimit = Math.ceil((80000 + recipientCount * 40000) * 1.2);

    setProgress(60);
    setStatusMsg('Confirm in your wallet…');

    if (token === 'ETH') {
      // ── ETH batch send ──
      if (isEqual) {
        const perWei = ethers.utils.parseEther(equalAmount);
        const addrs = recipients.map(r => r.address);
        const total = perWei.mul(addrs.length);
        const feeWei = total.mul(30).div(10000);

        const tx = await contract.sprayEqual(
          ethers.constants.AddressZero,
          addrs,
          perWei,
          { value: total.add(feeWei), gasLimit }
        );

        setProgress(80);
        setStatusMsg('Confirming on Base…');
        setTxHash(tx.hash);

        await tx.wait();
        return tx.hash;
      } else {
        const tuples = recipients.map(r => ({
          recipient: r.address,
          amount: ethers.utils.parseEther(r.amount),
        }));
        let total = ethers.BigNumber.from(0);
        for (const t of tuples) total = total.add(t.amount);
        const feeWei = total.mul(30).div(10000);

        const tx = await contract.sprayETH(tuples, {
          value: total.add(feeWei),
          gasLimit,
        });

        setProgress(80);
        setStatusMsg('Confirming on Base…');
        setTxHash(tx.hash);

        await tx.wait();
        return tx.hash;
      }
    } else {
      // ── ERC-20 batch send ──
      // Resolve token address
      let tokenAddr: string;
      let decimals: number;

      if (token === 'USDC') {
        tokenAddr = COMMON_TOKENS.USDC.address;
        decimals = COMMON_TOKENS.USDC.decimals;
      } else if (token === 'DAI') {
        tokenAddr = COMMON_TOKENS.DAI.address;
        decimals = COMMON_TOKENS.DAI.decimals;
      } else if (token === 'WETH') {
        tokenAddr = COMMON_TOKENS.WETH.address;
        decimals = COMMON_TOKENS.WETH.decimals;
      } else {
        // Custom token address
        tokenAddr = token;
        const tokenContract = new ethers.Contract(tokenAddr, ETHERS_ERC20_ABI, signer);
        try { decimals = await tokenContract.decimals(); } catch { decimals = 18; }
      }

      const tokenContract = new ethers.Contract(tokenAddr, ETHERS_ERC20_ABI, signer);
      const signerAddress = await signer.getAddress();

      if (isEqual) {
        // ── sprayEqual (ERC-20) ──
        const perUnit = ethers.utils.parseUnits(equalAmount, decimals);
        const addrs = recipients.map(r => r.address);
        const total = perUnit.mul(addrs.length);
        const feeWei = total.mul(30).div(10000);
        const needed = total.add(feeWei);

        // Check & set allowance
        const allowance = await tokenContract.allowance(signerAddress, SPRAY_CONTRACT_ADDRESS);
        if (allowance.lt(needed)) {
          setStatusMsg('Approving USDC… confirm in wallet');
          const appTx = await tokenContract.approve(SPRAY_CONTRACT_ADDRESS, needed);
          await appTx.wait();
        }

        setProgress(70);
        setStatusMsg('Confirm batch spray in wallet…');

        const tx = await contract.sprayEqual(tokenAddr, addrs, perUnit, { gasLimit });

        setProgress(85);
        setStatusMsg('Confirming on Base…');
        setTxHash(tx.hash);

        await tx.wait();
        return tx.hash;
      } else {
        // ── sprayToken (individual amounts) ──
        const tuples = recipients.map(r => ({
          recipient: r.address,
          amount: ethers.utils.parseUnits(r.amount, decimals),
        }));
        let total = ethers.BigNumber.from(0);
        for (const t of tuples) total = total.add(t.amount);
        const feeWei = total.mul(30).div(10000);
        const needed = total.add(feeWei);

        // Check & set allowance
        const allowance = await tokenContract.allowance(signerAddress, SPRAY_CONTRACT_ADDRESS);
        if (allowance.lt(needed)) {
          setStatusMsg('Approving USDC… confirm in wallet');
          const appTx = await tokenContract.approve(SPRAY_CONTRACT_ADDRESS, needed);
          await appTx.wait();
        }

        setProgress(70);
        setStatusMsg('Confirm batch spray in wallet…');

        const tx = await contract.sprayToken(tokenAddr, tuples, { gasLimit });

        setProgress(85);
        setStatusMsg('Confirming on Base…');
        setTxHash(tx.hash);

        await tx.wait();
        return tx.hash;
      }
    }
  }, []);

  const reset = useCallback(() => {
    setProgress(0);
    setStatusMsg('');
    setTxHash(null);
    setError(null);
  }, []);

  return {
    executeSpray,
    progress, setProgress,
    statusMsg, setStatusMsg,
    txHash, setTxHash,
    error, setError,
    reset,
  };
}
