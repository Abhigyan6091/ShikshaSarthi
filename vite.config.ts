import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 6091,
    proxy: {
      '/students': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/quizzes': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/questions': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/vqg': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
