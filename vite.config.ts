import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
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
  build: {
    // Performance optimizations
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select'],
          'icons': ['lucide-react'],
          'supabase': ['@supabase/supabase-js'],
          'forms': ['react-hook-form', '@hookform/resolvers'],
          'query': ['@tanstack/react-query']
        }
      }
    },
    // Enable compression and tree shaking
    minify: 'esbuild',
    target: 'es2020',
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Source map for debugging (disable in production)
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Remove unused CSS
    cssMinify: true
  },
  // Optimize deps
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react'
    ]
  }
}));
