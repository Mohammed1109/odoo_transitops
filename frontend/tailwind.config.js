/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      backgroundImage: {
        'login-bg': "url('/src/assets/bg.jpg')",
      },
    },
  },
  plugins: [],
};
