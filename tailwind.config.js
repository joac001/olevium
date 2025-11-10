/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    '*.{js,ts,jsx,tsx,mdx}',
  ],
  // agrega un safelist que cubra tus tokens y escalas que vas a usar
  safelist: [
    // bg sólidos
    { pattern: /bg-(primary|accent|neutral|success)-(50|100|200|300|400|500|600|700|800|900)/ },
    {
      pattern: /hover:bg-(primary|accent|neutral|success)-(50|100|200|300|400|500|600|700|800|900)/,
    },

    // bordes
    { pattern: /border-(primary|accent|neutral|success)-(50|100|200|300|400|500|600|700|800|900)/ },

    // gradientes
    'bg-gradient-to-br',
    { pattern: /from-(primary|accent|neutral|success)-(50|100|200|300|400|500|600|700|800|900)/ },
    { pattern: /to-(primary|accent|neutral|success)-(50|100|200|300|400|500|600|700|800|900)/ },
    {
      pattern:
        /hover:from-(primary|accent|neutral|success)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /hover:to-(primary|accent|neutral|success)-(50|100|200|300|400|500|600|700|800|900)/,
    },
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',

        // Paleta Cálida y Confiable - Configuración Principal
        primary: {
          DEFAULT: '#1e40af', // Azul Confianza
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#1e40af', // Principal
          700: '#1e3a8a',
          800: '#1e3a8a',
          900: '#1e3a8a',
          950: '#172554',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#3b5bdb', // Azul Serenidad
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#3b5bdb', // Principal
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#ff8966', // Coral Suave
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#ff8966', // Principal
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
          950: '#431407',
          foreground: '#ffffff',
        },
        warm: {
          DEFAULT: '#ffb088', // Melocotón Claro
          50: '#fff8f3',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#ffc99a',
          400: '#ffb088', // Principal
          500: '#fb923c',
          600: '#f97316',
          700: '#ea580c',
          800: '#c2410c',
          900: '#9a3412',
        },
        neutral: {
          DEFAULT: '#64748b',
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b', // Principal
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        info: {
          DEFAULT: '#dbeafe', // Azul Pastel
          50: '#eff6ff',
          100: '#dbeafe', // Principal
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        success: {
          DEFAULT: '#10b981',
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        warning: {
          DEFAULT: '#f59e0b',
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
