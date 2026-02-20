'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { initOnRamp, type CBPayInstanceType } from '@coinbase/cbpay-js';

interface UseOnrampReturn {
  openOnramp: (amountUsd: number, asset?: 'USDC' | 'ETH') => Promise<void>;
  isOpen: boolean;
  error: string | null;
  reset: () => void;
}

/**
 * Hook to manage Coinbase Onramp integration.
 *
 * Uses @coinbase/cbpay-js to open the Coinbase-hosted onramp popup.
 * Supports USDC (zero fee on Base) and ETH.
 */
export function useOnramp(userAddress?: string): UseOnrampReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const instanceRef = useRef<CBPayInstanceType | null>(null);

  useEffect(() => {
    return () => {
      instanceRef.current?.destroy();
    };
  }, []);

  const openOnramp = useCallback(async (amountUsd: number, asset: 'USDC' | 'ETH' = 'USDC'): Promise<void> => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    setIsOpen(true);
    setError(null);

    return new Promise(async (resolve, reject) => {
      try {
        // 1. Get session token from our API route
        let sessionToken: string | undefined;
        try {
          const resp = await fetch('/api/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address: userAddress }),
          });
          if (resp.ok) {
            const data = await resp.json();
            sessionToken = data.token;
          }
        } catch {
          console.warn('Session token generation failed, using appId fallback');
        }

        // 2. Build onramp config
        const projectId = process.env.NEXT_PUBLIC_CDP_PROJECT_ID;

        if (!projectId && !sessionToken) {
          throw new Error('CDP Project ID or session token required for onramp');
        }

        const widgetParams: Record<string, any> = {
          addresses: { [userAddress]: ['base'] },
          assets: [asset],
          defaultNetwork: 'base',
          defaultAsset: asset,
          presetFiatAmount: Math.ceil(amountUsd),
          fiatCurrency: 'USD',
        };

        if (sessionToken) {
          widgetParams.sessionToken = sessionToken;
        }

        // 3. Initialize and open onramp
        initOnRamp(
          {
            appId: projectId || '',
            widgetParameters: widgetParams,
            onSuccess: () => {
              setIsOpen(false);
              instanceRef.current?.destroy();
              instanceRef.current = null;
              resolve();
            },
            onExit: (exitError?: any) => {
              setIsOpen(false);
              instanceRef.current?.destroy();
              instanceRef.current = null;
              if (exitError) {
                const msg = 'Onramp was closed before purchase completed.';
                setError(msg);
                reject(new Error(msg));
              } else {
                resolve();
              }
            },
            onEvent: (event: any) => {
              console.log('[Onramp event]', event);
            },
            experienceLoggedIn: 'popup',
            experienceLoggedOut: 'popup',
            closeOnExit: true,
            closeOnSuccess: true,
          },
          (err, instance) => {
            if (err) {
              setIsOpen(false);
              const msg = err.message || 'Failed to initialize onramp';
              setError(msg);
              reject(new Error(msg));
              return;
            }
            if (instance) {
              instanceRef.current = instance;
              instance.open();
            }
          }
        );

      } catch (err: any) {
        setIsOpen(false);
        const msg = err?.message || 'Failed to open onramp';
        setError(msg);
        reject(err);
      }
    });
  }, [userAddress]);

  const reset = useCallback(() => {
    setIsOpen(false);
    setError(null);
    instanceRef.current?.destroy();
    instanceRef.current = null;
  }, []);

  return { openOnramp, isOpen, error, reset };
}
