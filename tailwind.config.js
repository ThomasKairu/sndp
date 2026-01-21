/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      },
      colors: {
        brand: {
          50: '#f0faff',
          100: '#e0f5fe',
          200: '#b9ebfe',
          300: '#7cdcfd',
          400: '#36cafa',
          500: '#00AEEF', // Exact Flyer Blue
          600: '#0090cc',
          700: '#0072a3',
          800: '#006088',
          900: '#064f6f',
          950: '#043249',
        },
        accent: {
          500: '#ED1C24', // Exact Flyer Red
          600: '#c51017',
          700: '#a30d12',
        }
      },
      animation: {
        'ken-burns': 'kenBurns 20s infinite alternate',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        kenBurns: {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.15) translate(-2%, -2%)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
