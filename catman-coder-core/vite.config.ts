import { defineConfig } from "vite";
import * as path from "node:path";
import dts from "vite-plugin-dts";
export default defineConfig({
  build: {
    lib: {
      entry: "./src/main.ts",
      name: "core",
      fileName: "core",
    },
    rollupOptions: {
      external: ["react", "react-dom", "@ant-design"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  plugins: [dts()],
});
