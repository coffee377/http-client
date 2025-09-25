import { defineConfig } from "tsup";

export default defineConfig((options) => {
  return {
    entry: ["src/index.ts"],
    format: ["esm", "cjs", "iife"],
    clean: true,
    legacyOutput: true,
    outExtension: ({ format }) => {
      return { js: `.${format}.js` };
    },
    // minify: "terser",
    // splitting: true,
    dts: true,
    // minify: !options.watch,
  };
});
