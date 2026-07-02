/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          0: "#070712",
          1: "#0B0B1A",
          2: "#0F1024"
        },
        panel: "rgba(255,255,255,0.06)",
        "panel-border": "rgba(255,255,255,0.10)",
        neon: {
          300: "#B28CFF",
          400: "#8B5CF6",
          500: "#7C3AED",
          600: "#6D28D9"
        },
        ink: {
          0: "rgba(255,255,255,0.92)",
          1: "rgba(255,255,255,0.78)",
          2: "rgba(255,255,255,0.60)"
        },
        // shadcn / Magic UI design tokens (additive — map to CSS vars in globals.css)
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)"
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)"
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)"
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)"
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)"
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)"
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)"
        },
        chart: {
          1: "var(--chart-1)",
          2: "var(--chart-2)",
          3: "var(--chart-3)",
          4: "var(--chart-4)",
          5: "var(--chart-5)"
        }
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139,92,246,0.25), 0 10px 30px rgba(124,58,237,0.20), 0 0 50px rgba(139,92,246,0.10)"
      },
      backgroundImage: {
        "radial-premium":
          "radial-gradient(1200px 500px at 20% 10%, rgba(124,58,237,0.25), transparent 60%), radial-gradient(900px 450px at 80% 20%, rgba(168,85,247,0.18), transparent 55%), radial-gradient(700px 380px at 50% 90%, rgba(59,130,246,0.10), transparent 55%)"
      }
    }
  },
  plugins: []
};
