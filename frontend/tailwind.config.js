import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--b1))',
        foreground: 'hsl(var(--bc))',
        card: {
          DEFAULT: 'hsl(var(--b2))',
          foreground: 'hsl(var(--bc))',
        },
        popover: {
          DEFAULT: 'hsl(var(--b2))',
          foreground: 'hsl(var(--bc))',
        },
        primary: {
          DEFAULT: 'hsl(var(--p))',
          foreground: 'hsl(var(--pc))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--s))',
          foreground: 'hsl(var(--sc))',
        },
        muted: {
          DEFAULT: 'hsl(var(--b3))',
          foreground: 'hsl(var(--bc) / 0.7)',
        },
        accent: {
          DEFAULT: 'hsl(var(--b2))',
          foreground: 'hsl(var(--bc))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--er))',
          foreground: 'hsl(var(--erc))',
        },
        border: 'hsl(var(--b3))',
        input: 'hsl(var(--b3))',
        ring: 'hsl(var(--p))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [daisyui],
   daisyui: {
    themes: [
      "light",
      "dark",
      "cupcake",
      "bumblebee",
      "emerald",
      "corporate",
      "synthwave",
      "retro",
      "cyberpunk",
      "valentine",
      "halloween",
      "garden",
      "forest",
      "aqua",
      "lofi",
      "pastel",
      "fantasy",
      "wireframe",
      "black",
      "luxury",
      "dracula",
      "cmyk",
      "autumn",
      "business",
      "acid",
      "lemonade",
      "night",
      "coffee",
      "winter",
      "dim",
      "nord",
      "sunset",
    ],
  },
}