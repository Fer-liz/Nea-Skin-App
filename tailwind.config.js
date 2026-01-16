/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                neumorphic: {
                    bg: '#e0e5ec',
                    surface: '#ffffff',
                    primary: '#7e3866',
                    secondary: '#55254b',
                    accent: '#ed8936',
                    text: '#2d3748',
                    'text-light': '#718096',
                    shadow: '#b8bec5',
                    light: '#ffffff',
                }
            },
            boxShadow: {
                'neumorphic': '8px 8px 16px #b8bec5, -8px -8px 16px #ffffff',
                'neumorphic-sm': '4px 4px 8px #b8bec5, -4px -4px 8px #ffffff',
                'neumorphic-inset': 'inset 4px 4px 8px #b8bec5, inset -4px -4px 8px #ffffff',
                'neumorphic-hover': '12px 12px 24px #b8bec5, -12px -12px 24px #ffffff',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Playfair Display', 'serif'],
            },
            borderRadius: {
                'neumorphic': '12px',
            }
        },
    },
    plugins: [],
}
