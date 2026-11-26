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
    // Radix components carry their own copies of this package; one copy is needed so that
    // the right-to-left setting reaches all of them.
    dedupe: ["@radix-ui/react-direction"],
  },
  build: {
    rollupOptions: {
      output: {
        // The Supabase library changes rarely: a separate file stays cached between deployments.
        manualChunks(id) {
          if (id.includes("/node_modules/@supabase/")) return "supabase";
          // Texts of the three languages, in their own file.
          if (id.includes("/src/i18n/locales/")) return "locales";
        },
      },
    },
  },
});
