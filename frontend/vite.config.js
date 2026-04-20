import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/merge': 'http://localhost:5000',
      '/split': 'http://localhost:5000',
      '/rotate': 'http://localhost:5000',
      '/organize': 'http://localhost:5000',
      '/crop': 'http://localhost:5000',
      '/compress': 'http://localhost:5000',
      '/repair': 'http://localhost:5000',
      '/pdf-to-word': 'http://localhost:5000',
      '/pdf-to-ppt': 'http://localhost:5000',
      '/pdf-to-excel': 'http://localhost:5000',
      '/word-to-pdf': 'http://localhost:5000',
      '/ppt-to-pdf': 'http://localhost:5000',
      '/excel-to-pdf': 'http://localhost:5000',
      '/pdf-to-jpg': 'http://localhost:5000',
      '/jpg-to-pdf': 'http://localhost:5000',
      '/html-to-pdf': 'http://localhost:5000',
      '/pdf-to-pdfa': 'http://localhost:5000',
      '/watermark': 'http://localhost:5000',
      '/page-numbers': 'http://localhost:5000',
      '/edit': 'http://localhost:5000',
      '/redact': 'http://localhost:5000',
      '/unlock': 'http://localhost:5000',
      '/protect': 'http://localhost:5000',
      '/ocr': 'http://localhost:5000',
      '/compare': 'http://localhost:5000',
      '/health': 'http://localhost:5000',
    },
  },
})
