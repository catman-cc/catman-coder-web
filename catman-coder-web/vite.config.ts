import react from "@vitejs/plugin-react-swc";
import path from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";

import { defineConfig } from "vite";
// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
  build: {
    // target: "esnext",
  },
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: path.resolve(
            __dirname,
            "node_modules/web-tree-sitter/tree-sitter.wasm",
          ),
          dest: "./",
        },
        {
          src: path.resolve(
            __dirname,
            "node_modules/curlconverter/dist/tree-sitter-bash.wasm",
          ),
          dest: "./",
        },
        {
          src: path.resolve(
            __dirname,
            "node_modules/bootstrap/dist/css/bootstrap.min.css.map",
          ),
          dest: "./",
        },
      ],
    }),
    // topLevelAwait({
    //   // The export name of top-level await promise for each chunk module
    //   promiseExportName: "__tla",
    //   // The function to generate import names of top-level await promise in each chunk module
    //   promiseImportName: (i) => `__tla_${i}`,
    // }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
