import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  // clean: true,
  sourcemap: true,
  minify: true,
  splitting: true,
  ignoreWatch: ["**/node_modules", "**/dist", "**/.git"],
  // watch: ["src"],
  external: ["react", "react-dom", "@ant-design"],
  tsconfig: "tsconfig.json",
});
