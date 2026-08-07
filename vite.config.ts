import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/The-Masterwork-Vault/',
  build: { target: 'es2022' },
})
