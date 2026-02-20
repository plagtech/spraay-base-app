# Spraay — Batch Crypto Payments on Base

<p align="center">
  <strong>Send crypto to hundreds of wallets in one transaction.</strong><br/>
  Buy with a card. Distribute instantly. Save ~80% on gas.
</p>

<p align="center">
  <a href="https://spraay-base-dapp.vercel.app">Live App</a> •
  <a href="https://spraay-base-dapp.vercel.app/buy">Buy & Spraay</a> •
  <a href="https://basescan.org/address/0x1646452F98E36A3c9Cfc3eDD8868221E207B5eEC">Contract</a> •
  <a href="https://twitter.com/Spraay_app">Twitter</a>
</p>

---

## What is Spraay?

Spraay is a batch payment protocol on Base that compresses up to 200 individual token transfers into a single transaction. Whether you're paying contributors, distributing rewards, or running an airdrop — Spraay handles it in one click.

**New in V2:** Buy USDC or ETH with a credit card, bank transfer, or Apple Pay via Coinbase Onramp and distribute it to multiple wallets — all in one flow. No crypto needed to start.

## Features

### 💸 Batch Send (Home Page)
- Send ETH, USDC, DAI, WETH, or any ERC-20 to up to 200 recipients
- Even split or custom amounts per recipient
- CSV upload for bulk distributions
- Live ETH/USD price conversion
- Gasless transactions via Coinbase Paymaster

### 💳 Buy & Spraay (`/buy`)
- 4-step guided flow: Amount → Recipients → Review → Spraay
- Buy USDC (zero onramp fee) or ETH via Coinbase Onramp
- Full fee transparency before every transaction
- Direct spray option if you already hold tokens
- Session token authentication for secure onramp

### 🤖 AI Agent Support
- Integrated into [Coinbase AgentKit](https://github.com/coinbase/agentkit/pull/944) (PR #944)
- AI agents can perform batch payments autonomously
- Available as a skill in Bankr's OpenClaw system

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Wallet | OnchainKit (ConnectWallet, Identity, Basenames) |
| Onramp | @coinbase/cbpay-js + @coinbase/cdp-sdk |
| Transactions | ethers.js v5 (direct provider) |
| Gas | Coinbase Paymaster (sponsored) |
| Styling | Tailwind CSS + Satoshi/JetBrains Mono |
| Mini App | Farcaster MiniApp SDK |
| Network | Base L2 (Chain ID 8453) |

## Smart Contract

**Address:** `0x1646452F98E36A3c9Cfc3eDD8868221E207B5eEC`

| Function | Description |
|----------|-------------|
| `sprayETH` | Send variable ETH amounts to multiple recipients |
| `sprayToken` | Send variable ERC-20 amounts to multiple recipients |
| `sprayEqual` | Send equal amounts of ETH or ERC-20 to multiple recipients |

- Protocol fee: 0.3% (30 bps)
- Max recipients: 200 per transaction
- [View on BaseScan](https://basescan.org/address/0x1646452F98E36A3c9Cfc3eDD8868221E207B5eEC)

## Fee Structure

| Component | USDC | ETH |
|-----------|------|-----|
| Coinbase Onramp | **FREE** | ~1.5% |
| Spraay Protocol | 0.3% | 0.3% |
| Base Gas | ~$0.05 (sponsored) | ~$0.05 (sponsored) |

## Quick Start

```bash
# Clone
git clone https://github.com/plagtech/spraay-base-app.git
cd spraay-base-app

# Install
npm install

# Configure
cp .env.local.example .env.local
# Add your keys (see below)

# Run
npm run dev
```

### Environment Variables

```env
# OnchainKit + Paymaster (required)
NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_cdp_client_api_key
NEXT_PUBLIC_PAYMASTER_URL=https://api.developer.coinbase.com/rpc/v1/base/your_key

# Coinbase Onramp (required for /buy page)
NEXT_PUBLIC_CDP_PROJECT_ID=your_project_id
CDP_API_KEY=your_api_key_name
CDP_API_SECRET=your_api_secret
```

Get all keys from [portal.cdp.coinbase.com](https://portal.cdp.coinbase.com).

## Multi-Chain

Spraay is also deployed on:
- **Unichain** — [spraay-unichain-dapp.vercel.app](https://spraay-unichain-dapp.vercel.app)
- **Plasma** — [spraay-plasma-dapp.vercel.app](https://spraay-plasma-dapp.vercel.app)
- **Bittensor** — [spraay-bittensor-dapp.vercel.app](https://spraay-bittensor-dapp.vercel.app)

## Ecosystem

- 🔵 **Base Build** program member
- 📱 **Base Mini App** — App ID: `69965f787b16c9a7e63e9754`
- 🤖 **AgentKit** — [PR #944](https://github.com/coinbase/agentkit/pull/944)
- 🏦 **Bankr OpenClaw** — Batch payment skill

## Links

- 🌐 [spraay.app](https://spraay.app)
- 🐦 [@Spraay_app](https://twitter.com/Spraay_app)
- 👤 [@lostpoet](https://twitter.com/lostpoet)
- 🟣 [@plag](https://warpcast.com/plag) (Farcaster)

## License

MIT
