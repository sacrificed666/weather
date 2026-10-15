import { fileURLToPath, URL } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "server-only": fileURLToPath(new URL("./src/test/emptyModule.ts", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    // One jsdom per worker with each test file in its own context: about twice as fast
    pool: "vmThreads",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/test/**",
        "src/**/*.test.{ts,tsx}",
        "src/app/**/{layout,page,error,global-error,global-not-found,manifest,apple-icon,opengraph-image}.{ts,tsx}",
        "src/features/seo/og/**",
        "src/app/pwa/**",
      ],
      reporter: ["text", "html", "json-summary"],
      thresholds: {
        statements: 98,
        branches: 95,
        functions: 98,
        lines: 98,
      },
    },
  },
});
