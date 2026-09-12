/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        clay: {
          canvas: '#ece7f9',
          card: '#ffffff',
          purple: '#8b7fe8',
          'purple-hover': '#7b6edc',
          lavender: '#9d93e8',
          lilac: '#f0ecfc',
          dark: '#2a2050',
          body: '#524872',
          muted: '#7e749c',
          coral: '#f8788a',
          pink: '#e271a5',
          peach: '#fee8ea',
          yellow: '#fef5db',
          amber: '#d97706',
          mint: '#e6f7ef',
          emerald: '#10b981',
          sky: '#e3f2fd',
          blue: '#2563eb',
        },
        bingo: {
          blue: "#8b7fe8",
          dark: "#2a2050",
          card: "#ffffff",
          border: "#ede8f8",
          accent: "#f8788a",
          success: "#10b981",
        }
      },
      boxShadow: {
        'clay-card': '0 14px 36px rgba(135, 115, 215, 0.12), 0 2px 8px rgba(135, 115, 215, 0.06)',
        'clay-hover': '0 20px 48px rgba(135, 115, 215, 0.18), 0 4px 14px rgba(135, 115, 215, 0.08)',
        'clay-btn': '0 8px 24px rgba(240, 115, 145, 0.32)',
        'clay-purple-btn': '0 8px 24px rgba(139, 127, 232, 0.32)',
        'clay-tile': '0 6px 16px rgba(140, 120, 205, 0.14), inset 0 2px 2px rgba(255, 255, 255, 0.9)',
      },
      animation: {
        'bounce-short': 'bounce 0.5s ease-in-out 2',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
