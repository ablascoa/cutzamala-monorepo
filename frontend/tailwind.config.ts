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
        // Material Design 3 Color System
        primary: {
          50: '#e8f4fd',
          100: '#d1e9fb',
          200: '#a3d3f7',
          300: '#75bdf3',
          400: '#47a7ef',
          500: '#1976d2', // Primary
          600: '#1565c0',
          700: '#0d47a1',
          800: '#0a3d91',
          900: '#063281',
        },
        secondary: {
          50: '#f3f4f6',
          100: '#e7e9ed',
          200: '#cfd3db',
          300: '#b7bdc9',
          400: '#9fa7b7',
          500: '#6b7280', // Secondary
          600: '#5f6875',
          700: '#4b5563',
          800: '#374151',
          900: '#1f2937',
        },
        surface: {
          50: '#ffffff',
          100: '#fefefe',
          200: '#fafafa',
          300: '#f5f5f5',
          400: '#eeeeee',
          500: '#e0e0e0',
          600: '#bdbdbd',
          700: '#757575',
          800: '#424242',
          900: '#212121',
        },
        // Material Design Error colors
        error: {
          50: '#ffebee',
          100: '#ffcdd2',
          200: '#ef9a9a',
          300: '#e57373',
          400: '#ef5350',
          500: '#f44336', // Error
          600: '#e53935',
          700: '#d32f2f',
          800: '#c62828',
          900: '#b71c1c',
        },
        // Material Design Success colors
        success: {
          50: '#e8f5e8',
          100: '#c8e6c9',
          200: '#a5d6a7',
          300: '#81c784',
          400: '#66bb6a',
          500: '#4caf50', // Success
          600: '#43a047',
          700: '#388e3c',
          800: '#2e7d32',
          900: '#1b5e20',
        },
        // Material Design Warning colors
        warning: {
          50: '#fff8e1',
          100: '#ffecb3',
          200: '#ffe082',
          300: '#ffd54f',
          400: '#ffca28',
          500: '#ffc107', // Warning
          600: '#ffb300',
          700: '#ffa000',
          800: '#ff8f00',
          900: '#ff6f00',
        },
        // Cutzamala-specific colors for reservoirs (Material Design palette)
        reservoir: {
          'valle-bravo': '#1976d2', // Blue
          'villa-victoria': '#d32f2f', // Red
          'el-bosque': '#388e3c', // Green
          'system-total': '#7b1fa2', // Purple
        },
      },
      // Material Design Elevation System
      boxShadow: {
        'elevation-0': 'none',
        'elevation-1': '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
        'elevation-2': '0px 1px 5px rgba(0, 0, 0, 0.12), 0px 2px 4px rgba(0, 0, 0, 0.14), 0px 1px 1px rgba(0, 0, 0, 0.20)',
        'elevation-3': '0px 1px 8px rgba(0, 0, 0, 0.12), 0px 3px 4px rgba(0, 0, 0, 0.14), 0px 3px 3px rgba(0, 0, 0, 0.20)',
        'elevation-4': '0px 2px 4px rgba(0, 0, 0, 0.12), 0px 4px 5px rgba(0, 0, 0, 0.14), 0px 1px 10px rgba(0, 0, 0, 0.20)',
        'elevation-5': '0px 3px 5px rgba(0, 0, 0, 0.12), 0px 5px 8px rgba(0, 0, 0, 0.14), 0px 1px 14px rgba(0, 0, 0, 0.20)',
        'elevation-6': '0px 3px 5px rgba(0, 0, 0, 0.12), 0px 6px 10px rgba(0, 0, 0, 0.14), 0px 1px 18px rgba(0, 0, 0, 0.20)',
        'elevation-8': '0px 5px 5px rgba(0, 0, 0, 0.12), 0px 8px 10px rgba(0, 0, 0, 0.14), 0px 3px 14px rgba(0, 0, 0, 0.20)',
        'elevation-12': '0px 7px 8px rgba(0, 0, 0, 0.12), 0px 12px 17px rgba(0, 0, 0, 0.14), 0px 5px 22px rgba(0, 0, 0, 0.20)',
        'elevation-16': '0px 8px 10px rgba(0, 0, 0, 0.12), 0px 16px 24px rgba(0, 0, 0, 0.14), 0px 6px 30px rgba(0, 0, 0, 0.20)',
        'elevation-24': '0px 11px 15px rgba(0, 0, 0, 0.12), 0px 24px 38px rgba(0, 0, 0, 0.14), 0px 9px 46px rgba(0, 0, 0, 0.20)',
      },
      // Material Design Typography Scale
      fontSize: {
        'display-large': ['57px', { lineHeight: '64px', fontWeight: '400' }],
        'display-medium': ['45px', { lineHeight: '52px', fontWeight: '400' }],
        'display-small': ['36px', { lineHeight: '44px', fontWeight: '400' }],
        'headline-large': ['32px', { lineHeight: '40px', fontWeight: '400' }],
        'headline-medium': ['28px', { lineHeight: '36px', fontWeight: '400' }],
        'headline-small': ['24px', { lineHeight: '32px', fontWeight: '400' }],
        'title-large': ['22px', { lineHeight: '28px', fontWeight: '500' }],
        'title-medium': ['16px', { lineHeight: '24px', fontWeight: '500' }],
        'title-small': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label-large': ['14px', { lineHeight: '20px', fontWeight: '500' }],
        'label-medium': ['12px', { lineHeight: '16px', fontWeight: '500' }],
        'label-small': ['11px', { lineHeight: '16px', fontWeight: '500' }],
        'body-large': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-medium': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'body-small': ['12px', { lineHeight: '16px', fontWeight: '400' }],
      },
      // Material Design 8dp Grid System
      spacing: {
        '0.5': '2px',   // 0.5 * 4px
        '1': '4px',     // 1 * 4px
        '2': '8px',     // 2 * 4px
        '3': '12px',    // 3 * 4px
        '4': '16px',    // 4 * 4px
        '5': '20px',    // 5 * 4px
        '6': '24px',    // 6 * 4px
        '7': '28px',    // 7 * 4px
        '8': '32px',    // 8 * 4px
        '10': '40px',   // 10 * 4px
        '12': '48px',   // 12 * 4px
        '16': '64px',   // 16 * 4px
        '20': '80px',   // 20 * 4px
        '24': '96px',   // 24 * 4px
        '32': '128px',  // 32 * 4px
        '40': '160px',  // 40 * 4px
        '48': '192px',  // 48 * 4px
        '56': '224px',  // 56 * 4px
        '64': '256px',  // 64 * 4px
      },
      // Material Design Border Radius
      borderRadius: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '28px',
      },
      // Material Design Animations
      animation: {
        'fade-in': 'fadeIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'fade-out': 'fadeOut 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-in': 'scaleIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        'scale-out': 'scaleOut 150ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in': 'slideIn 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-out': 'slideOut 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scaleOut: {
          '0%': { opacity: '1', transform: 'scale(1)' },
          '100%': { opacity: '0', transform: 'scale(0.9)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideOut: {
          '0%': { opacity: '1', transform: 'translateY(0)' },
          '100%': { opacity: '0', transform: 'translateY(-10px)' },
        },
      },
      // Material Design Transitions
      transitionTimingFunction: {
        'standard': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'decelerated': 'cubic-bezier(0, 0, 0.2, 1)',
        'accelerated': 'cubic-bezier(0.4, 0, 1, 1)',
      },
    },
  },
  plugins: [],
}

export default config