/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "ui/**/*.{js,ts,jsx,tsx}",
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    themes: ["fantasy"],
  },
};
