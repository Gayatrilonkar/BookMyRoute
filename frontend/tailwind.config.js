/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Roboto Mono"', 'monospace'],
      },
      colors: {
        primary: {
          DEFAULT: '#E8531A',
          hover:   '#C4431A',
          light:   '#FEF0EB',
        },
        secondary: '#1A2332',
        accent: '#1877F2',
        success: {
          DEFAULT: '#16A34A',
          light: '#DCFCE7'
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FEF3C7'
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEE2E2'
        },
        surface: '#F8F9FA',
      },
      borderRadius: {
        'pill': '9999px',
      },
      animation: {
        'slide-up':   'slideUp 0.5s ease forwards',
        'fade-in':    'fadeIn 0.4s ease forwards',
        'pulse-slow': 'pulse 3s infinite',
        'bounce-sm':  'bounceSm 0.6s ease',
        'shimmer':    'shimmer 1.5s infinite linear',
      },
      keyframes: {
        slideUp:  { from: { opacity:0, transform:'translateY(24px)' }, to: { opacity:1, transform:'translateY(0)' } },
        fadeIn:   { from: { opacity:0 }, to: { opacity:1 } },
        bounceSm: { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-6px)' } },
        shimmer:  { '0%': { backgroundPosition: '-1000px 0' }, '100%': { backgroundPosition: '1000px 0' } }
      },
      fontWeight: {
        '700': '700',
        '800': '800',
      }
    }
  },
  plugins: []
}
