import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // new line added

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
