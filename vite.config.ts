import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@styles": path.resolve(__dirname, "./src/styles"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@constants": path.resolve(__dirname, "./src/constants"),
      "@utils": path.resolve(__dirname, "./src/utils"),
    },
  },
  build: {
    cssCodeSplit: true,
    minify: "terser",
    sourcemap: 'hidden',
    terserOptions: {
      compress: {
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split React and React DOM into separate vendor chunk
          const reactRegex = /node_modules[\\/](react|react-dom)[\\/]/;
          if (reactRegex.test(id)) {
            return "react-vendor";
          }
          // Keep all other node_modules in a single vendor chunk
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
        // Optimize chunk file names
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
    // Performance optimizations
    chunkSizeWarningLimit: 1000, // Intentionally raised to suppress warnings for large vendor chunks. TODO: Monitor bundle size and lower if needed.
  },
  server: {
    port: 3000,
    open: true,
  },
});
