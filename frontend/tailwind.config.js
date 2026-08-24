/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sla: {
          ontrack: '#10B981',
          atrisk: '#F59E0B',
          breached: '#EF4444',
        }
      }
    },
  },
  plugins: [],
}
