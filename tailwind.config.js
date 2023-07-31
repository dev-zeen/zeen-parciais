/** @type {import('tailwindcss').Config} */

module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ["Lato"],
      },
      colors: {
        folly: {
          DEFAULT: "#FF4365",
        },
        light: {
          DEFAULT: "#f5f5f5",
        },
        dark: {
          DEFAULT: "#f5f5f5",
        },
        // dark: {
        //   DEFAULT: "#12294D",
        // },
      },
    },
  },
  plugins: [],
};
