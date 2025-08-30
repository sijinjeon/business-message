import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  build: {
    rollupOptions: {
      input: {
        popup: 'src/popup/index.html',
        options: 'src/options/index.html'
      },
      output: {
        manualChunks: undefined, // Chrome Extension에서는 단일 청크 권장
      }
    },
    target: 'esnext',
    minify: 'terser',
    sourcemap: false, // 프로덕션에서는 소스맵 제거
    terserOptions: {
      compress: {
        drop_console: true, // console.log 제거
        drop_debugger: true
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  define: {
    __DEV__: process.env.NODE_ENV === 'development'
  }
})
