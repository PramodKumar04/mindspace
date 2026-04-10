/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        serene: {
          pink: '#fce4ec',
          blue: '#e3f2fd',
          green: '#e8f5e9',
          dark: '#374151',
          accent: '#fbc1c1',
        }
      },
      backgroundImage: {
        'hero-pattern': "url('/images/jei-lee-0lL6Sox7n1Y-unsplash.jpg')",
      }
    },
  },
  plugins: [],
}
