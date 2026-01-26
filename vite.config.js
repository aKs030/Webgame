import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve('index.html'),
        ssp: resolve('apps/schere-stein-papier/index.html'),
        color: resolve('apps/color-changer/index.html'),
        todo: resolve('apps/todo-liste/index.html'),
        rates: resolve('apps/zahlen-raten/index.html'),
      },
    },
  },
})
