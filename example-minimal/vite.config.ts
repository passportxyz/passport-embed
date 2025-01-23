import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Directly map the package name to your source
      "passport-widgets": resolve(__dirname, "../src"),
    },
  },
});
