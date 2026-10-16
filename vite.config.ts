import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

/**
 * 本地开发始终用相对路径，避免终端里残留 GITHUB_PAGES 导致资源 404。
 * 只有正式打 GitHub Pages 包时才加上 /wonder-planet/ 前缀。
 */
export default defineConfig(({ command }) => {
  const forGitHubPages = command === 'build' && process.env.GITHUB_PAGES === 'true'
  const base = forGitHubPages ? '/wonder-planet/' : './'

  return {
    plugins: [vue()],
    base,
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
    },
    preview: {
      host: '127.0.0.1',
      port: 4173,
    },
  }
})
