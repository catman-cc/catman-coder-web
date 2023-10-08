/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./public/popout.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}

