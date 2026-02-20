# Spraay V2 – Batch Send + Buy & Spraay

Two-page dApp on Base. Original batch sender + fiat-to-batch onramp flow.

## Pages

| Route | Feature | Description |
|-------|---------|-------------|
| `/` | **Batch Send** | V1 batch sender (ETH, USDC, DAI, WETH, custom tokens). Connect wallet, add recipients, spray. |
| `/buy` | **Buy & Spraay** | 4-step flow: choose USDC or ETH → set amount → add recipients → buy via Coinbase Onramp → auto-distribute. |

Tab navigation between both pages. V1 home page includes a "Need crypto? Buy & Spraay" banner linking to `/buy`.

## What's New

- **USDC + ETH onramp** — Buy USDC (zero fee on Base) or ETH (~1.5% spread) via Coinbase
- **4-step guided flow** — Amount → Recipients → Review → Spraay
- **Fee transparency** — Full breakdown before every transaction
- **Direct spray option** — Skip onramp if you already have funds
- **Session token auth** — Secure server-side JWT for onramp initialization
- **Tab navigation** — Switch between Batch Send and Buy & Spraay

## Setup

```bash
# 1. Copy V2 files into your spraay-base-app project folder (replace existing)
# 2. Keep your existing .env.local, then add 3 new vars:

NEXT_PUBLIC_CDP_PROJECT_ID=your_project_id
CDP_API_KEY=your_api_key_name
CDP_API_SECRET=your_api_secret

# 3. Install and run
npm install
npm run dev
```

Get all keys from [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com).

## Fee Structure

| Fee | USDC | ETH |
|-----|------|-----|
| Coinbase Onramp | **FREE** | ~1.5% spread |
| Spraay Protocol | 0.3% | 0.3% |
| Base Network Gas | ~$0.05 (sponsored) | ~$0.05 (sponsored) |

## Contract

`0x1646452F98E36A3c9Cfc3eDD8868221E207B5eEC` on Base Mainnet

## Links

- [spraay.app](https://spraay.app) · [@Spraay_app](https://twitter.com/Spraay_app) · [BaseScan](https://basescan.org/address/0x1646452F98E36A3c9Cfc3eDD8868221E207B5eEC)
