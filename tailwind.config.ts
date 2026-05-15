import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ['Satoshi', 'Helvetica Neue', 'system-ui', 'sans-serif'],
        display: ['Satoshi', 'Helvetica Neue', 'system-ui', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Tracka tokens
        "nav-surface": "hsl(var(--nav-surface))",
        surface: "hsl(var(--surface))",
        "surface-2": "hsl(var(--surface-2))",
        "surface-hover": "hsl(var(--surface-hover))",
        ink: "hsl(var(--ink))",
        "ink-2": "hsl(var(--ink-2))",
        "ink-muted": "hsl(var(--ink-muted))",
        line: "hsl(var(--line))",
        brand: "hsl(var(--brand))",
        success: "hsl(var(--success))",
        "chip-grey": "hsl(var(--chip-grey))",
        "chip-grey-fg": "hsl(var(--chip-grey-fg))",
        "status-saved": "hsl(var(--status-saved))",
        "status-applied": "hsl(var(--status-applied))",
        "status-active": "hsl(var(--status-active))",
        "status-assessment": "hsl(var(--status-assessment))",
        "status-offer": "hsl(var(--status-offer))",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.75rem",
      },
      transitionTimingFunction: {
        tracka: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
      transitionDuration: {
        "180": "180ms",
      },
      keyframes: {
        "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
        "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
        "panel-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        "modal-in": {
          from: { opacity: "0", transform: "scale(0.96) translateY(8px)" },
          to: { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        first: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "50%": { transform: "translate(0, 25%) rotate(180deg)" },
        },
        second: {
          "0%, 100%": { transform: "rotate(0deg) translate(0, -10%)" },
          "50%": { transform: "rotate(360deg) translate(10%, 10%)" },
        },
        third: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "50%": { transform: "translate(-25%, 25%) rotate(360deg)" },
        },
        fourth: {
          "0%, 100%": { transform: "translate(0, 0)" },
          "50%": { transform: "translate(-25%, -10%)" },
        },
        fifth: {
          "0%, 100%": { transform: "translate(0, 0) rotate(0deg)" },
          "50%": { transform: "translate(15%, -25%) rotate(-360deg)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "panel-in": "panel-in 300ms ease-out both",
        "slide-in-right": "slide-in-right 420ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "modal-in": "modal-in 360ms cubic-bezier(0.22, 1, 0.36, 1) both",
        first: "first 30s ease infinite",
        second: "second 25s ease infinite",
        third: "third 35s ease infinite",
        fourth: "fourth 28s ease infinite",
        fifth: "fifth 32s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
