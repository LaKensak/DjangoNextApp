import type {Config} from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: 'var(--background)',
                foreground: 'var(--foreground)',
                primary: '#4C9FD4',  // Bleu doux (pour la couleur principale)
                'primary-dark': '#3A7D9D',  // Bleu foncé pour les survols
                secondary: '#A8E4D2',  // Vert menthe doux (pour les actions secondaires)
                'secondary-dark': '#7ABFA1',  // Vert foncé pour les survols
                accent: '#D1A1D1',  // Violet doux pour des touches subtiles
                'accent-dark': '#B47A9B',  // Violet foncé pour les actions secondaires
                buttonOrange: '#FF9A00',  // Orange doux pour attirer l'attention
                'buttonOrange-dark': '#D87A00',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
} satisfies Config;
