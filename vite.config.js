/// <reference types="vitest/config" />
import { defineConfig } from "vite";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 20000,
  },
  build: {
    outDir: "dist",
    minify: true,
    sourcemap: true,
    lib: {
      entry: "./src/index.ts",
      name: "ngram-cipher",
      fileName: "ngram-cipher",
      formats: ["es", "cjs"],
    },
  },
});
