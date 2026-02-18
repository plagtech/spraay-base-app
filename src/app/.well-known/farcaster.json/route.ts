import { NextResponse } from 'next/server';

const APP_URL = 'https://spraay-base-dapp.vercel.app';

export async function GET() {
  const manifest = {
    accountAssociation: {
      // PLACEHOLDER — replace after signing with your Farcaster custody wallet
      header: '',
      payload: '',
      signature: '',
    },
    frame: {
      version: '1',
      name: 'Spraay',
      subtitle: 'Batch Payments on Base',
      description:
        'Send ETH or ERC-20 tokens to 200+ recipients in a single transaction. ~80% gas savings.',
      iconUrl: `${APP_URL}/spraay-icon-200.png`,
      homeUrl: APP_URL,
      imageUrl: `${APP_URL}/spraay-og-wide.png`,
      splashImageUrl: `${APP_URL}/spraay-splash.png`,
      splashBackgroundColor: '#0a0a0a',
      buttonTitle: 'Open Spraay',
      primaryCategory: 'finance',
      tags: ['base', 'payments', 'defi', 'batch', 'erc20'],
      ogTitle: 'Spraay — Batch Crypto Payments on Base',
      ogDescription:
        'Send crypto to 200+ recipients in one tx. ~80% gas savings.',
      ogImageUrl: `${APP_URL}/spraay-og-wide.png`,
      heroImageUrl: `${APP_URL}/spraay-og-wide.png`,
    },
  };

  return NextResponse.json(manifest);
}
