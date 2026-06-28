import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          leaflet: ['leaflet', 'react-leaflet', 'leaflet-routing-machine', 'leaflet-control-geocoder', 'leaflet.markercluster', 'react-leaflet-markercluster', 'leaflet-pegman'],
          supabase: ['@supabase/supabase-js'],
          router: ['react-router-dom'],
          vendor: ['framer-motion', 'lucide-react', 'browser-image-compression'],
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/\.(css)$/.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: "Hpa-An Travel Guide",
        short_name: "HpaAnGuide",
        description: "Your offline travel companion for Hpa-An",
        theme_color: "#1A3A3A",
        background_color: "#F6F4EF",
        start_url: "/",
        display: "standalone",
        orientation: "portrait-primary",
        scope: "/",
        lang: "en",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable"
          }
        ],
        categories: ["travel", "navigation"],
        screenshots: []
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/hqzodqvstvdemmqxphbv\.supabase\.co\/rest\/v1\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
            }
          },
          {
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'map-tiles',
              expiration: { maxEntries: 5000, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|webp|avif)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 500, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-styles',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 }
            }
          }
        ],
        offlineGoogleAnalytics: true,
      },
      devOptions: {
        enabled: false,
      },
    })
  ]
});