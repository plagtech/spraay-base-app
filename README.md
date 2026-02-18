# Spraay – Base App

Mobile-first batch payment dApp built with **Next.js + OnchainKit** on Base.

Send ETH or ERC-20 tokens to 200+ recipients in a single transaction. ~80% gas savings.

## Stack

- **Next.js 14** — React framework
- **OnchainKit** — Coinbase wallet connection, transaction handling, identity, paymaster
- **Tailwind CSS** — Styling
- **viem** — Ethereum interaction utilities
- **wagmi** — React hooks for Ethereum

## Features

- ✅ Coinbase Smart Wallet + MetaMask + WalletConnect support
- ✅ Gasless transactions via Coinbase Paymaster
- ✅ ETH & ERC-20 batch sends (variable or equal amounts)
- ✅ CSV upload for bulk distributions
- ✅ Live ETH-to-USD conversion
- ✅ Confirmation modal before sending
- ✅ Mobile-first responsive design
- ✅ Basename/Identity resolution via OnchainKit

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your keys:

```
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_cdp_client_api_key
NEXT_PUBLIC_PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base/your_paymaster_key
```

Get your keys from [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com/projects/api-keys/client-key).

### 3. Run dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. Deploy to Vercel

```bash
npx vercel
```

Set environment variables in Vercel project settings.

## Contract

**Spraay on Base Mainnet:** `0x1646452F98E36A3c9Cfc3eDD8868221E207B5eEC`

- [View on BaseScan](https://basescan.org/address/0x1646452F98E36A3c9Cfc3eDD8868221E207B5eEC)
- Protocol fee: 0.3%
- Max recipients: 200 per tx

## Contract Functions

| Function | Description |
|----------|-------------|
| `sprayETH` | Batch send ETH with variable amounts |
| `sprayToken` | Batch send ERC-20 with variable amounts |
| `sprayEqual` | Batch send equal amounts (ETH or ERC-20) |

## Links

- 🌐 [spraay.app](https://spraay.app)
- 🐦 [@Spraay_app](https://twitter.com/Spraay_app)
- 🔵 [BaseScan](https://basescan.org/address/0x1646452F98E36A3c9Cfc3eDD8868221E207B5eEC)
- 💻 [GitHub](https://github.com/plagtech)
