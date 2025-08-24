/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb", // azul suave
        secondary: "#f3f4f6", // cinza claro
      },
    },
  },
  plugins: [],
};
