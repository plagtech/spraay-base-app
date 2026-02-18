import '@coinbase/onchainkit/styles.css';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Spraay – Batch Crypto Payments on Base',
  description: 'Send ETH or ERC-20 tokens to 200+ recipients in a single transaction on Base. ~80% gas savings.',
  openGraph: {
    title: 'Spraay – Batch Payments on Base',
    description: 'Send crypto to 200+ recipients in one tx. ~80% gas savings.',
    url: 'https://spraay.app',
    images: [{ url: 'https://spraay.app/spraay-og-square.png' }],
  },
  twitter: {
    card: 'summary',
    creator: '@Spraay_app',
    images: ['https://spraay.app/spraay-og-square.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
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
