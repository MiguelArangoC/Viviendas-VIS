import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // serve the frontend directory as Vite root so imports like /src/main.tsx
  // resolve to frontend/src/... instead of the repository root
  root: 'frontend',
  plugins: [react()],
  server: {
    port: 3000,
  },
})