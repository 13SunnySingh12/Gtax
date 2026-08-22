/** @type {import('tailwindcss').Config} */
// Design tokens transcribed from frontend_design.md §5 (Brex reference + G-TAX [ext]).
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#15191E',
        'on-primary': '#FFFFFF',
        background: '#FFFFFF',
        surface: '#F3F3F7',
        // The sidebar's own base colour (the Pipo gradient's canvas). Used as the
        // hover background for buttons/menu items so hovers echo the sidebar.
        sidebar: '#FAF9EF',
        ink: '#000000', // "text" token (high-emphasis)
        'text-muted': '#5B6169',
        // Accent derived from the sidebar's own Pipo gradient blue (#A3CEFF),
        // darkened to meet WCAG AA on white (5.1:1) so it complements the sidebar
        // instead of fighting it (replaces the previous orange).
        accent: '#1D6DC9',
        'ai-accent': '#6D5DF6',
        success: '#16A34A',
        warning: '#D97706',
        error: '#DC2626',
        border: '#E5E5EA',
      },
      fontFamily: {
        // Same family the sidebar already uses. No external font service:
        // Inter is used when present on the system, otherwise the native UI font.
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        // Typography hierarchy — style: [size, { lineHeight, letterSpacing, fontWeight }]
        // stat       → dashboard figures (data, not a title)
        // display    → main page titles (largest, strongest text)
        // heading    → section / card titles
        // subheading → sub-section titles
        // body       → paragraphs, table cells
        // label      → form labels, nav items, buttons
        // caption    → helper text, timestamps (smallest, subtle)
        stat: ['28px', { lineHeight: '1.14', letterSpacing: '-0.022em', fontWeight: '700' }],
        display: ['22px', { lineHeight: '1.25', letterSpacing: '-0.018em', fontWeight: '700' }],
        heading: ['17px', { lineHeight: '1.32', letterSpacing: '-0.013em', fontWeight: '600' }],
        subheading: ['14.5px', { lineHeight: '1.4', letterSpacing: '-0.008em', fontWeight: '600' }],
        body: ['14px', { lineHeight: '1.55', letterSpacing: '-0.006em', fontWeight: '400' }],
        label: ['13px', { lineHeight: '1.4', letterSpacing: '-0.004em', fontWeight: '500' }],
        caption: ['12.5px', { lineHeight: '1.45', fontWeight: '500' }],
      },
      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
        xl: '12px',
      },
      spacing: {
        // 8px base grid scale [8,16,24,32,48,72,80]
        1.5: '6px',
      },
      transitionDuration: {
        DEFAULT: '125ms',
      },
      keyframes: {
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.45' },
        },
      },
      animation: {
        // 1.2s looping opacity pulse for loading placeholders (§5.4)
        shimmer: 'shimmer 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
