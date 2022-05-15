import { fileURLToPath, URL } from 'url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
    
  },
  root: "./",
  base: '',
  build: {
    outDir: '../views/SPA',
    assetsDir: 'static',
    emptyOutDir : true,
    watch : {
    },
    rollupOptions : {
      input : {
        main: resolve(__dirname, 'index.html'),
        chat: resolve(__dirname, 'chat.html')
      },
      output : {
        assetFileNames: "static/[name]_build.[ext]",
        entryFileNames: "static/[name]_build.js",
        chunkFileNames: `static/[name]_build.js`,
      }
    },
    
  }
})
