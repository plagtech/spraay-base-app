import '@coinbase/onchainkit/styles.css';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';

const APP_URL = 'https://spraay-base-dapp.vercel.app';

export const metadata: Metadata = {
  title: 'Spraay - Batch Crypto Payments on Base',
  description: 'Send ETH or ERC20 tokens to hundreds of recipients in a single transaction on Base.',
  other: {
    'base:app_id': '69965df89e44e08414de8e1d',
    'fc:miniapp': JSON.stringify({
      version: 'next',
      imageUrl: `${APP_URL}/spraay-og-wide.png`,
      button: {
        title: 'Open Spraay',
        action: {
          type: 'launch_miniapp',
          name: 'Spraay',
          url: APP_URL,
          splashImageUrl: `${APP_URL}/spraay-splash.png`,
          splashBackgroundColor: '#f0f7ff',
        },
      },
    }),
  },
  openGraph: {
    title: 'Spraay - Batch Payments on Base',
    description: 'Send crypto to hundreds of wallets in one transaction. Save on gas fees with Spraay.',
    url: APP_URL,
    images: [{ url: `${APP_URL}/spraay-og-wide.png` }],
  },
  twitter: {
    card: 'summary',
    creator: '@Spraay_app',
    images: [`${APP_URL}/spraay-og-square.png`],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f0f7ff',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
