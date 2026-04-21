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
        sans: ['Satoshi-Variable'],
        body: ['Satoshi-Variable'],
        light: ['Satoshi-Variable'],
        regular: ['Satoshi-Variable'],
        medium: ['Satoshi-Variable'],
        semibold: ['Satoshi-Variable'],
        bold: ['Satoshi-Variable'],
        extrabold: ['Satoshi-Variable'],
        black: ['Satoshi-Variable'],
      },
      colors: {
        primary: {
          DEFAULT: '#FF8A00',
        },
        secondary: {
          DEFAULT: '#0057FF',
        },
        tertiary: {
          DEFAULT: '#00E094',
        },
        folly: {
          DEFAULT: '#FF4365',
        },
        light: {
          DEFAULT: '#F5F5F5',
        },
        dark: {
          DEFAULT: '#0D1117',
        },
      },
    },
  },
  plugins: [],
};
