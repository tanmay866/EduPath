import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.js'],
    // .test.mjs files are plain-ESM unit tests that need no DOM; they run
    // under Node's own runner too, and are picked up here so one command
    // covers everything.
    include: ['src/**/*.{test,spec}.{js,jsx,mjs}'],
  },
})
