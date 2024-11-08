// tailwind.config.js

module.exports = {
  darkMode: "class", // Enables manual control over dark mode using a CSS class
  content: ["./src/**/*.{js,jsx,ts,tsx}"], // Adjust the paths as needed
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/line-clamp")],
};
