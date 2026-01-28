/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jarvis: {
          bg: '#000000',
          panel: '#111111',
          cyan: '#00f3ff',     // The classic glow
          red: '#ff003c',      // Warning/Delete
          text: '#e2e2e2',
          dim: 'rgba(0, 243, 255, 0.1)'
        }
      },
      fontFamily: {
        mono: ['monospace'], 
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
