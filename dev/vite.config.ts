import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Map the actual package name to the local source for hot reload
      "@human.tech/passport-embed": resolve(__dirname, "../src"),
      // Conditionally mock Human ID SDK when MSW is enabled
      ...(process.env.VITE_ENABLE_MSW === "true" && {
        "@holonym-foundation/human-id-sdk": resolve(__dirname, "./src/mocks/mockHumanIdSdk.ts"),
      }),
    },
  },
  server: {
    port: 5173,
    open: true,
    fs: {
      // Allow serving files from parent directory for fonts
      allow: ['..']
    }
  },
});
