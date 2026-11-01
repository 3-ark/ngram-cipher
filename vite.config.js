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
      entry: {
        "ngram-cipher": "./src/index.ts",
        "ngram-cipher-llm": "./src/index.llm.ts",
      },
      name: "ngramCipher",
      formats: ["es", "cjs"],
      fileName: (format, entryName) => {
        const ext = format === "es" ? "js" : "cjs";
        return `${entryName}.${ext}`;
      },
    },
    rollupOptions: {
      external: [
        "@huggingface/transformers",
        /^@huggingface\/transformers\/.*/,
        "onnxruntime-web",
        /^onnxruntime-web\/.*/,
        /^node:.*/,
      ],
      output: {
        exports: "named",
      },
    },
  },
});
