/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        jarvis: {
          950: '#020608',
          900: '#050a0f',
          800: '#0a1018',
          700: '#0f1a25',
          600: '#142030',
          500: '#1a2a3a',
          400: '#203040',
          300: '#2a4050',
        },
        cyan: {
          500: '#00d2ff',
          400: '#33dbff',
          300: '#66e4ff',
          600: '#00a8cc',
          700: '#007f99',
          800: '#005566',
        },
        gold: {
          500: '#ffd700',
          400: '#ffdf33',
          300: '#ffe766',
        }
      },
      fontFamily: {
        mono: ['Consolas', 'Monaco', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
