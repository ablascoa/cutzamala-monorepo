import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Cutzamala-specific colors for reservoirs
        reservoir: {
          'valle-bravo': '#2563eb',
          'villa-victoria': '#dc2626',
          'el-bosque': '#16a34a',
          'system-total': '#7c3aed',
        },
      },
    },
  },
  plugins: [],
}

export default config