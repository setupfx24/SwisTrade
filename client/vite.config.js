import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Ensure charting_library static files are served correctly
    // and not caught by SPA fallback
    fs: {
      strict: false,
    },
  },
})
