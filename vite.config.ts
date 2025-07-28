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
    // Advanced performance optimizations
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('react-router')) {
              return 'vendor-router';
            }
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            if (id.includes('@tanstack')) {
              return 'vendor-query';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-animation';
            }
            return 'vendor-misc';
          }
          
          // Route-based chunks
          if (id.includes('/pages/zones/')) {
            return 'routes-zones';
          }
          if (id.includes('/pages/') && (id.includes('Admin') || id.includes('My'))) {
            return 'routes-protected';
          }
          if (id.includes('/pages/')) {
            return 'routes-public';
          }
          
          // Component chunks
          if (id.includes('/components/ui/')) {
            return 'components-ui';
          }
          if (id.includes('/components/') && (id.includes('Chat') || id.includes('Modal'))) {
            return 'components-interactive';
          }
        },
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `assets/[name]-[hash].js`;
        },
        // Optimize asset naming
        assetFileNames: (assetInfo) => {
          if (!assetInfo.name) return `assets/[name]-[hash][extname]`;
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `assets/css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        }
      }
    },
    // Enable advanced compression
    minify: 'esbuild',
    target: 'es2020',
    // Optimize chunk size more aggressively
    chunkSizeWarningLimit: 300,
    // Disable source maps in production
    sourcemap: false,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Advanced CSS minification
    cssMinify: 'esbuild',
    // Reduce asset inline threshold
    assetsInlineLimit: 2048,
    // Enable module preload polyfill
    modulePreload: {
      polyfill: true
    }
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
