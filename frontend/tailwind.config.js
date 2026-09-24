/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Base dark surfaces
        navy: {
          DEFAULT: "#0A0A0C",
          light: "#1A1A1E",
          dark: "#000000"
        },
        paper: "#0A0A0C",
        ink: "#F2F2F4",
        // Neutral accent (kept the name "brass" so existing markup keeps working —
        // now a cool silver/white accent instead of a color, matching the
        // black & white + glass direction)
        brass: {
          DEFAULT: "#FFFFFF",
          light: "#FFFFFF",
          dark: "#B8B8BE"
        },
        // Semantic status colors, brightened for contrast on dark glass
        verified: "#33D17A",
        violation: "#FF5C4D",
        review: "#FFC24B"
      },
      fontFamily: {
        display: ["'Roboto Slab'", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      backdropBlur: {
        xs: "2px"
      }
    }
  },
  plugins: []
};
