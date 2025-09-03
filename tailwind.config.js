/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        colors: require('tailwindcss/colors'),
      },
    plugins: [],
    future: {
        // 👇 disable new color function features
        hoverOnlyWhenSupported: false,
      },
      experimental: {
        optimizeUniversalDefaults: true,
      },
      
  }
  
  