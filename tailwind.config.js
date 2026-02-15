/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    // Exclude test files and docs to reduce scanning
    "!./src/**/*.test.{js,ts,jsx,tsx}",
    "!./src/**/*.spec.{js,ts,jsx,tsx}",
    "!./docs/**/*",
    "!./src/__tests__/**/*",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}