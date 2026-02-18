'use client';

import { useState, useEffect, useCallback } from 'react';

export function useEthPrice() {
  const [price, setPrice] = useState(0);

  const fetchPrice = useCallback(async () => {
    const apis = [
      { url: 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD', parse: (d: any) => d.USD },
      { url: 'https://api.coinbase.com/v2/prices/ETH-USD/spot', parse: (d: any) => parseFloat(d.data.amount) },
      { url: 'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd', parse: (d: any) => d.ethereum.usd },
    ];

    for (const api of apis) {
      try {
        const resp = await fetch(api.url);
        if (!resp.ok) continue;
        const data = await resp.json();
        const p = api.parse(data);
        if (p && p > 0) {
          setPrice(p);
          return;
        }
      } catch { /* try next */ }
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  const toUsd = useCallback((ethAmount: number): string => {
    if (!price || !ethAmount) return '';
    const val = ethAmount * price;
    if (val < 0.01) return '';
    return '≈ $' + val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [price]);

  return { price, toUsd };
}
