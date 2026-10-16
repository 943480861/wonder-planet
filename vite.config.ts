import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

/**
 * GitHub Pages 项目站在 /wonder-planet/ 下，资源要用这个前缀；
 * 其它静态托管仍用相对路径，方便把 dist 丢到任意目录或微信里打开。
 */
const base = process.env.GITHUB_PAGES === 'true' ? '/wonder-planet/' : './'

export default defineConfig({
  plugins: [vue()],
  base,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    host: true,
    port: 5173,
  },
})
