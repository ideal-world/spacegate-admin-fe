/** @type {import('tailwindcss').Config} */
export default {
  important: true,
  corePlugins: {
    preflight: false,
  },
  content: [
    "./src/**/*.{html,js,ts,vue}",
    "../spacegate-admin-front/src/components/**/*.{js,jsx,ts,tsx,vue}",
    "../spacegate-admin-front/src/views/**/*.{js,jsx,ts,tsx,vue}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
