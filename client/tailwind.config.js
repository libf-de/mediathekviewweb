import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{svelte,js,ts}'],
  // Matches the previous Tailwind v4 default: dark mode follows prefers-color-scheme.
  darkMode: 'media',
  theme: {
    extend: {
      transitionDuration: {
        250: '250ms',
      },
    },
  },
  plugins: [
    forms,
    typography,
    // v4-style `not-dark:` variant, mirrored for the media dark strategy.
    plugin(({ addVariant }) => {
      addVariant('not-dark', '@media (prefers-color-scheme: light)');
    }),
  ],
};
