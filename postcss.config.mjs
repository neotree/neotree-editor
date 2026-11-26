/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    // Tailwind v4 moved its PostCSS plugin out of the `tailwindcss` package.
    "@tailwindcss/postcss": {},
  },
};

export default config;
