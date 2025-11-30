/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Update this to include the paths to all of your component files.
    content: ["./App.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                background: '#09090b',
                surface: '#18181b',
                surfaceHighlight: '#27272a',
                primary: '#3b82f6',
                textMain: '#fafafa',
                textMuted: '#a1a1aa',
            }
        },
    },
    plugins: [],
}
