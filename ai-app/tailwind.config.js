/** @type {import('tailwindcss').Config} */
module.exports = {
  content:  [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        lexend: ['Lexend', 'sans-serif'],
      },
      colors: {
        primaryPurple: '#3D2A3E', //For background
        secondaryPurple: '#4D3A4E',
        tertiaryPurple: '#472F47',
      },
    },
  },
  plugins: [],
}

