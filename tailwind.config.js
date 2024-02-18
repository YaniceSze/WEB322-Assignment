/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [`./views/**/*.html`],
  daisyui: {
    themes: ['fantasy'],
  },
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
}

