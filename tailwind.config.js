/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        ink: {
          50: '#f7f4ee',
          100: '#ede9e0',
          200: '#ddd7ca',
          300: '#b0a99f',
          400: '#6b6560',
          500: '#1a1714',
          600: '#0f0d0b',
        },
        vermilion: {
          DEFAULT: '#c0392b',
          light: 'rgba(192,57,43,0.08)',
          hover: '#a93226',
        },
        border: {
          DEFAULT: "rgba(26,23,20,0.12)",
        },
        input: {
          DEFAULT: "rgba(26,23,20,0.08)",
        },
        ring: "#c0392b",
        background: "#f7f4ee",
        foreground: "#1a1714",
        primary: {
          DEFAULT: "#c0392b",
          foreground: "#f7f4ee",
        },
        secondary: {
          DEFAULT: "#ede9e0",
          foreground: "#1a1714",
        },
        muted: {
          DEFAULT: "#ede9e0",
          foreground: "#6b6560",
        },
        accent: {
          DEFAULT: "rgba(192,57,43,0.08)",
          foreground: "#c0392b",
        },
        card: {
          DEFAULT: "#ffffff",
          foreground: "#1a1714",
        },
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', 'STSong', 'SimSun', 'serif'],
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        lg: "12px",
        md: "8px",
        sm: "4px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        "blink": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" }
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.6)" },
          "100%": { opacity: "1", transform: "scale(1)" }
        }
      },
      animation: {
        "fade-in": "fade-in 0.5s ease-out forwards",
        "blink": "blink 0.8s step-end infinite",
        "scale-in": "scale-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
