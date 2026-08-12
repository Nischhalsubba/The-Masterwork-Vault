import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Netlify serves every SPA route from the same site root. Root-relative build
  // assets keep direct/reloaded deep links from resolving JS/CSS under the
  // current catalog pathname (for example /catalog/.../assets/*).
  base: '/',
  build: { target: 'es2022' },
})
