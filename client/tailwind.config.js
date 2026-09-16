/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        artisan: {
          // Primary Palette
          ivory: '#FDFBF7',
          cream: '#F6F1E8',
          warmBeige: '#EBE3D5',
          softBrown: '#827265',
          earthBrown: '#241C19',
          // Secondary Accents
          woolHeather: '#D5CABE',
          sage: '#5E6E5B',
          sageLight: '#E8ECE6',
          terracotta: '#944737',
          terracottaDark: '#7C382B',
          terracottaLight: '#F7EDE9',
          amber: '#B8782E',
          // Backwards compatibility aliases
          beige: '#EBE3D5',
          sandstone: '#E5DCCD',
          heather: '#D5CABE',
          taupe: '#827265',
          espresso: '#241C19',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      letterSpacing: {
        artisan: '0.08em',
        widest: '0.15em',
      },
      boxShadow: {
        'subtle': '0 1px 3px 0 rgba(36, 28, 25, 0.03)',
        'cozy': '0 4px 16px -2px rgba(36, 28, 25, 0.05)',
        'card': '0 8px 24px -4px rgba(36, 28, 25, 0.06)',
        'drawer': '-8px 0 30px -5px rgba(36, 28, 25, 0.12)',
      },
      transitionTimingFunction: {
        'artisan': 'cubic-bezier(0.16, 1, 0.3, 1)',
      }
    },
  },
  plugins: [],
}
