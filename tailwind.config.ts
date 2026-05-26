import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#871c1c", // Deep burgundy - refined for premium feel
          dark: "#6b1515",
          light: "#a02323",
        },
        accent: {
          DEFAULT: "#E7C418", // Gold for CTAs
          dark: "#C9A814",
          light: "#F0D43A",
        },
        secondary: {
          DEFAULT: "#E7C418", // Alias for accent
          dark: "#C9A814",
          light: "#F0D43A",
        },
        neutral: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E7E5E4",
          300: "#D6D3D1",
          400: "#A8A29E",
          500: "#78716C",
          600: "#57534E",
          700: "#404040", // Refined for better contrast
          800: "#292524",
          900: "#1F2937", // Refined for better contrast
        },
        success: "#10B981",
        error: "#EF4444",
      },
      fontFamily: {
        heading: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "3.5rem" }],
      },
      spacing: {
        // 4px rhythm scale - explicit tokens
        0: "0",
        1: "0.25rem",    // 4px
        2: "0.5rem",     // 8px
        3: "0.75rem",    // 12px
        4: "1rem",       // 16px
        6: "1.5rem",     // 24px
        8: "2rem",       // 32px
        12: "3rem",      // 48px
        16: "4rem",      // 64px
        20: "5rem",      // 80px
        24: "6rem",      // 96px
        32: "8rem",      // 128px
      },
      borderRadius: {
        button: "0.375rem", // Refined for sophistication
        card: "0.75rem",
        full: "9999px",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 1px 3px 0 rgb(0 0 0 / 0.1)",
        "card-hover": "0 10px 25px -5px rgb(0 0 0 / 0.15)",
      },
    },
  },
  plugins: [],
};

export default config;

