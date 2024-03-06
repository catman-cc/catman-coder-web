import { defineConfig } from "vite";
import * as path from "node:path";
import dts from "vite-plugin-dts";
// import pkg from "./package.json" assert { type: "json" };
export default defineConfig({
  build: {
    lib: {
      entry: "index.ts",
      name: "core",
      fileName: "core",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "react",
        "react/jsx-runtime",
        "react-dom",
        "react-contexify",
        "@ant-design",
      ],
      // external: [
      //   ...Object.keys(pkg.dependencies), // don't bundle dependencies
      //   /^node:.*/, // don't bundle built-in Node.js modules (use protocol imports!)
      // ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      react: path.resolve(__dirname, "./node_modules/react"),
      "react-dom": path.resolve(__dirname, "./node_modules/react-dom"),
      "react-contexify": path.resolve(
        __dirname,
        "./node_modules/react-contexify"
      ),
    },
  },
  plugins: [dts()],
});
