/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",  // ✅ Scan `app/` for Tailwind classes
    "./src/components/**/*.{js,ts,jsx,tsx}",  // ✅ Scan `src/components/`
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
