import { defineConfig } from 'vite'

// GitHub Pages project site: https://<user>.github.io/write/
// Change production base to '/' if you use a custom domain at the repo root.
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/write/' : '/',
}))
