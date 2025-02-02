import type { Config } from 'tailwindcss';
import { colors } from './config/tailwind-colors';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors,
      fontSize: {
        DEFAULT: '14px',
        'body-1': '12px',
        'body-2': '13px',
        'body-3': '14px',
        caption: '12px',
        'title-1': '16px',
        'title-2': '20px',
        'title-3': '24px',
      },
      borderRadius: {
        lg: 'var(--border-radius-large)',
        md: 'var(--border-radius-medium)',
        sm: 'var(--border-radius-small)',
        xs: '2px',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  // plugins: [require('tailwindcss-animate')],
};

export default config;
