import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // The Supabase library changes rarely: a separate file stays cached between deployments.
        manualChunks: { supabase: ["@supabase/supabase-js"] },
      },
    },
  },
});
