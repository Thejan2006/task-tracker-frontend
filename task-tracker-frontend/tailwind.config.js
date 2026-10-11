/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        neon: { cyan: '#27d7ff', violet: '#9b6cff', lime: '#56f7a3', ink: '#f6f7ff' },
      },
      boxShadow: {
        neon: '0 0 28px rgba(39, 215, 255, .25)',
        violet: '0 0 28px rgba(155, 108, 255, .25)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
    },
  },
  plugins: [],
};
