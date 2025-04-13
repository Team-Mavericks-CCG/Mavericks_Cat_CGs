/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  logLevel: "info",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    // Ensure all assets get copied, even small ones
    assetsInlineLimit: 0,
    // Improve source maps for debugging
    sourcemap: true,
    // Ensure chunks are properly named for caching
    reportCompressedSize: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          // Add other vendor libraries as needed
        },
      },
    },
  },
  // Make sure the public directory is properly copied
  publicDir: "public",
});
