import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import * as path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import compression from 'vite-plugin-compression'
import eslint from 'vite-plugin-eslint'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // تحسين React للإنتاج
      babel: {
        plugins: [
          // إزالة console.log في الإنتاج
          process.env.NODE_ENV === 'production' && ['babel-plugin-transform-remove-console']
        ].filter(Boolean)
      }
    }),
    eslint({
      cache: false,
      include: ['src/**/*.ts', 'src/**/*.tsx']
    }),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/pwa-64x64.png', 'icons/apple-touch-icon-180x180.png', 'icons/maskable-icon-512x512.png'],
      manifest: {
        name: 'سكيلو - تطبيق تعليمي تفاعلي للأطفال',
        short_name: 'سكيلو',
        description: 'تطبيق تعليمي تفاعلي للأطفال باللغة العربية',
        theme_color: '#667eea',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        lang: 'ar',
        dir: 'rtl',
        categories: ['education', 'kids', 'games'],
        icons: [
          {
            src: 'icons/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icons/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        shortcuts: [
          {
            name: 'ألعاب الحروف',
            short_name: 'حروف',
            description: 'تعلم الحروف العربية',
            url: '/letters',
            icons: [{ src: 'icon-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'ألعاب الأرقام',
            short_name: 'أرقام',
            description: 'تعلم الأرقام والحساب',
            url: '/numbers',
            icons: [{ src: 'icon-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              },
              
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
              }
            }
          },
          {
            urlPattern: /\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 1 day
              },
              networkTimeoutSeconds: 10
            }
          }
        ],
        skipWaiting: true,
        clientsClaim: true
      },
      devOptions: {
        enabled: false
      }
    }),
    compression({
      algorithm: 'gzip',
      ext: '.gz'
    }),
    compression({
      algorithm: 'brotliCompress',
      ext: '.br'
    }),
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
    cors: true
  },
  preview: {
    port: 4173,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    target: 'es2015',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          // مكتبات React الأساسية
          'react-vendor': ['react', 'react-dom'],
          // مكتبات التوجيه والحركة
          'router-animations': ['react-router-dom', 'framer-motion'],
          // مكتبات UI
          'ui-components': [
            'lucide-react',
            '@radix-ui/react-dialog',
            '@radix-ui/react-select',
            '@radix-ui/react-toast'
          ],
          // خدمات التطبيق
          'app-services': [
            '@supabase/supabase-js',
            '@stripe/stripe-js',
            '@stripe/react-stripe-js'
          ],
          // مكتبات المساعدة
          'utilities': [
            'clsx',
            'tailwind-merge',
            'class-variance-authority',
            'date-fns'
          ]
        },
        // تحسين أسماء الملفات
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    // تحسين Terser للإنتاج
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.trace']
      },
      mangle: {
        safari10: true
      },
      format: {
        safari10: true
      }
    }
  },
  // تحسين التبعيات
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      '@supabase/supabase-js'
    ]
  },
  // إعدادات CSS
  css: {
    devSourcemap: false
  },
  base: '/'
})