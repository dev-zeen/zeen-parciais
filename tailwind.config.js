/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito_400Regular'],
        body: ['Nunito_400Regular'],
        light: ['Nunito_300Light'],
        regular: ['Nunito_400Regular'],
        medium: ['Nunito_500Medium'],
        semibold: ['Nunito_600SemiBold'],
        bold: ['Nunito_700Bold'],
        extrabold: ['Nunito_800ExtraBold'],
        black: ['Nunito_900Black'],
      },
      colors: {
        folly: {
          DEFAULT: '#FF4365',
        },
        light: {
          DEFAULT: '#f5f5f5',
        },
        dark: {
          DEFAULT: '#12294D',
        },
      },
    },
  },
  plugins: [],
};
