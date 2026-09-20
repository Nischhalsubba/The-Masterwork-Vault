import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const neverwinterMediaProxy = {
  '/media/neverwinter': {
    target: 'https://neverwinter.fandom.com',
    changeOrigin: true,
    secure: true,
    rewrite: (path: string) => path.replace(/^\/media\/neverwinter\//, '/wiki/Special:Redirect/file/'),
  },
}

export default defineConfig({
  plugins: [react()],
  // Netlify serves every SPA route from the same site root. Root-relative build
  // assets keep direct/reloaded deep links from resolving JS/CSS under the
  // current catalog pathname (for example /catalog/.../assets/*).
  base: '/',
  server: { proxy: neverwinterMediaProxy },
  preview: { proxy: neverwinterMediaProxy },
  build: { target: 'es2022' },
})
