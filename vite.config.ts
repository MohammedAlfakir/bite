import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'plugin-inspect-react-code'

// https://vite.dev/config/
export default defineConfig({
  // Absolute base, NOT './'. With a relative base, assets on a nested route
  // resolve against that route — /menu would request /menu/favicon.svg and
  // /menu/assets/index.js, which 404 on a hard refresh or direct link.
  base: '/',
  plugins: [inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
