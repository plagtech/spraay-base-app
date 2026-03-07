import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        spraay: {
          blue: '#0090e0',
          bright: '#00aaff',
          deep: '#005fa3',
          dark: '#003d6b',
          glow: 'rgba(0, 170, 255, 0.12)',
        },
        base: {
          blue: '#0052FF',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
