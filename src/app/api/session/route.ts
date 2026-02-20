import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/session
 * 
 * Generates a session token for Coinbase Onramp secure initialization.
 * Required since July 2025 — all onramp URLs must include sessionToken.
 * 
 * This route runs server-side so CDP API credentials never reach the client.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address } = body;

    if (!address) {
      return NextResponse.json({ error: 'Wallet address required' }, { status: 400 });
    }

    const CDP_API_KEY = process.env.CDP_API_KEY;
    const CDP_API_SECRET = process.env.CDP_API_SECRET;

    if (!CDP_API_KEY || !CDP_API_SECRET) {
      console.error('Missing CDP_API_KEY or CDP_API_SECRET');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Generate JWT for CDP API authentication
    // Using dynamic import for @coinbase/cdp-sdk/auth
    let jwt: string;
    try {
      const { generateJwt } = await import('@coinbase/cdp-sdk/auth');
      jwt = await generateJwt({
        apiKeyId: CDP_API_KEY,
        apiKeySecret: CDP_API_SECRET,
        requestMethod: 'POST',
        requestHost: 'api.developer.coinbase.com',
        requestPath: '/onramp/v1/token',
        expiresIn: 120,
      });
    } catch (jwtError) {
      console.error('JWT generation failed:', jwtError);
      // Fallback: try manual JWT creation if cdp-sdk isn't available
      return NextResponse.json({ error: 'JWT generation failed' }, { status: 500 });
    }

    // Request session token from Coinbase
    const response = await fetch('https://api.developer.coinbase.com/onramp/v1/token', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addresses: [
          {
            address: address,
            blockchains: ['base'],
          },
        ],
        assets: ['USDC', 'ETH'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Coinbase session token error:', response.status, errorText);
      return NextResponse.json(
        { error: 'Failed to generate session token' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ token: data.token });
  } catch (error: any) {
    console.error('Session token route error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
