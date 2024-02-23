/** @type {import('tailwindcss').Config} */
export default {
  important: true,
  corePlugins: {
    preflight: false,
  },
  content: [
    "./src/**/*.{html,js,ts,vue}",
    "./components/config/src/components/**/*.{js,jsx,ts,tsx,vue}",
    "./components/config/src/views/**/*.{js,jsx,ts,tsx,vue}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}

