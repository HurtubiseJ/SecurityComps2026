import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    base: process.env.VITE_LOCAL === 'true' ? '/' : '/SecurityComps2026/',
    plugins: [react()],
})
