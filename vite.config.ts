import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig(() => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  // Worker format: IIFE (default) = classic worker, universally supported on mobile.
  // Do NOT use format:"es" — that creates a module worker ({type:"module"})
  // which only works on iOS 15.4+ / Chrome 80+, breaking older mobile browsers.
  worker: {
    format: "iife",
  },
}));
