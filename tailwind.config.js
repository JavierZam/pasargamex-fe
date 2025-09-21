/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // PasargameX Brand Colors based on logo
        brand: {
          red: '#DC2626',      // Primary red from logo
          blue: '#1E3A8A',     // Primary blue from logo  
          'red-dark': '#B91C1C',
          'blue-dark': '#1E40AF',
          'red-light': '#F87171',
          'blue-light': '#3B82F6',
        },
        // Gaming Theme Colors
        'bg-dark': {
          primary: '#0F0F23',
          secondary: '#1A1B3A', 
          accent: '#252555',
        },
        neon: {
          green: '#00FF88',
          purple: '#8B5CF6', 
          yellow: '#FBBF24',
          cyan: '#06B6D4',
        },
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
      },
      fontFamily: {
        'gaming': ['Orbitron', 'monospace'], // Gaming-style font
      },
    },
  },
  plugins: [],
}