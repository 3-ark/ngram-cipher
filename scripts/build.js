import { build } from "vite";

const sharedRollupOptions = {
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
};

const entries = [
  {
    entry: "./src/index.ts",
    name: "ngramCipher",
    fileBase: "ngram-cipher",
    emptyOutDir: true,
  },
  {
    entry: "./src/index.llm.ts",
    name: "ngramCipherLlm",
    fileBase: "ngram-cipher-llm",
    emptyOutDir: false,
  },
];

async function run() {
  for (const { entry, name, fileBase, emptyOutDir } of entries) {
    await build({
      configFile: false,
      build: {
        outDir: "dist",
        emptyOutDir,
        minify: true,
        sourcemap: true,
        lib: {
          entry,
          name,
          formats: ["es", "cjs"],
          fileName: (format) => `${fileBase}.${format === "es" ? "js" : "cjs"}`,
        },
        rollupOptions: sharedRollupOptions,
      },
    });
  }
}

run();
