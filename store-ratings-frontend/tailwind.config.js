/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF",     // Dark Blue for buttons/headers
        secondary: "#3B82F6",   // Light Blue for highlights
        danger: "#EF4444",      // Red for delete buttons
        warning: "#F59E0B",     // Yellow for edit buttons
        bgLight: "#F9FAFB",     // Light background for tables
      },
      fontFamily: {
        poppins: ["'Poppins'", "sans-serif"], // Custom font
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
      },
      borderRadius: {
        xl: "1rem",
      },
      boxShadow: {
        card: "0 4px 6px rgba(0,0,0,0.1)",
        modal: "0 10px 25px rgba(0,0,0,0.2)",
      },
    },
  },
  plugins: [],
};
