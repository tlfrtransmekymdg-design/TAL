/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#F5F2EA",
        moss: { DEFAULT: "#5E7A52", dark: "#465D3C" },
        clay: "#B77B4E",
        ink: "#2C2A26",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-karla)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
