import { defineConfig } from "vite";

// Two bundles: the sidebar panel and the Lovelace card. Both are committed to
// the repository because HACS does not run a build step.
export default defineConfig({
  build: {
    outDir: "../custom_components/stateguard/frontend",
    emptyOutDir: false,
    target: "es2021",
    minify: "esbuild",
    sourcemap: false,
    rollupOptions: {
      input: {
        "stateguard-panel": "src/stateguard-panel.ts",
        "stateguard-card": "src/card/stateguard-card.ts",
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "stateguard-shared.js",
        format: "es",
      },
    },
  },
});
