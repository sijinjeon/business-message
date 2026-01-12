import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import { resolve } from 'path'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ 
      manifest,
      contentScripts: {
        injectCss: true,
      }
    })
  ],
  base: '', // 빈 문자열로 설정하여 절대 경로 문제 해결
  build: {
    outDir: 'business-message-extension', // 빌드 결과물을 사용자가 업로드하는 폴더로 지정
    target: 'es2020',
    minify: 'terser',
    sourcemap: false, // 프로덕션에서는 소스맵 제거
    assetsDir: 'assets', // 에셋 디렉토리 명시적 지정
    terserOptions: {
      compress: {
        drop_console: true, // console.log 제거
        drop_debugger: true
      }
    },
    rollupOptions: {
      input: {
        // 동적 스크립트 주입을 위한 Content Script 엔트리 포인트
        'content-script': resolve(__dirname, 'src/content/index.ts')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          // content-script는 별도 폴더에 출력
          if (chunkInfo.name === 'content-script') {
            return 'scripts/content.js';
          }
          return 'assets/[name]-[hash].js';
        },
        // CSS 파일명 고정 (동적 주입용)
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'global.css') {
            return 'styles/global.css';
          }
          return 'assets/[name]-[hash][extname]';
        }
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
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173
    }
  }
})
