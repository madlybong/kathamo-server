import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path, { resolve } from "path";

export default defineConfig({
  root: resolve(__dirname, "."), // Set root to src/client
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  server: {
    port: 5173, // Vite dev server port
    proxy: {
      "/api": {
        target: "http://localhost:3000", // Proxy API requests to Bun server
        changeOrigin: true,
        secure: false,
      },
      "/ws": {
        target: "ws://localhost:3000", // Proxy WebSocket requests to Bun server
        ws: true,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: "../../dist/client",
    emptyOutDir: true,
    minify: "esbuild", // Enable minification
    cssMinify: true, // Minify CSS
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["vue", "vue-router", "pinia"], // Split vendor code
        },
      },
    },
  },
});
