/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      data: {
        // Ariakit
        active: "active",
        "focus-visible": "focus-visible",
        "active-item": "active-item",
      },
      colors: {
        // dynamic colors
        "dynamic-50": "rgb(var(--color-dynamic-50) / <alpha-value>)",
        "dynamic-100": "rgb(var(--color-dynamic-100) / <alpha-value>)",
        "dynamic-200": "rgb(var(--color-dynamic-200) / <alpha-value>)",
        "dynamic-300": "rgb(var(--color-dynamic-300) / <alpha-value>)",
        "dynamic-400": "rgb(var(--color-dynamic-400) / <alpha-value>)",
        "dynamic-500": "rgb(var(--color-dynamic-500) / <alpha-value>)",
        "dynamic-600": "rgb(var(--color-dynamic-600) / <alpha-value>)",
        "dynamic-700": "rgb(var(--color-dynamic-700) / <alpha-value>)",
        "dynamic-800": "rgb(var(--color-dynamic-800) / <alpha-value>)",
        "dynamic-900": "rgb(var(--color-dynamic-900) / <alpha-value>)",
        "dynamic-950": "rgb(var(--color-dynamic-950) / <alpha-value>)",
      },
    },
  },
  plugins: [],
};
