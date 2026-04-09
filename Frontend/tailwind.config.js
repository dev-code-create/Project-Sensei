/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sensai: {
          bg: "#0f172a",
          card: "rgba(30, 41, 59, 0.7)",
          primary: "#8b5cf6",
          secondary: "#06b6d4",
          text: "#f8fafc",
          muted: "#94a3b8",
        }
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'sensai-gradient': "radial-gradient(at 0% 0%, rgba(139, 92, 246, 0.15) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(6, 182, 212, 0.1) 0px, transparent 50%)",
      },
      borderWidth: {
        'glass': '1px',
      },
      borderColor: {
        'glass': 'rgba(255, 255, 255, 0.1)',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
