import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Map the actual package name to the local source for hot reload
      "@passportxyz/passport-embed": resolve(__dirname, "../src"),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
