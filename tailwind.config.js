/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4f46e5",
        secondary: "#8b5cf6",
        dark: "#1e1e2f",
        light: "#f3f4f6",
      },
      fontFamily: {
        sans: ["Patrick Hand", "sans-serif"],
      },
    },
  },
  plugins: [],
};
