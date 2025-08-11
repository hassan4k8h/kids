import { VitePWA } from 'vite-plugin-pwa';

export const pwaConfig = VitePWA({
  registerType: 'autoUpdate',
  includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'safari-pinned-tab.svg'],
  manifest: {
    name: 'Kids Educational Game - لعبة تعليمية للأطفال',
    short_name: 'KidsGame',
    description: 'Fun and safe educational games for children aged 3-12. Learn alphabet, numbers, colors, and more!',
    theme_color: '#6366f1',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/',
    lang: 'ar',
    dir: 'rtl',
    categories: ['education', 'games', 'kids'],

    icons: [
      {
        src: '/icons/pwa-64x64.png',
        sizes: '64x64',
        type: 'image/png'
      },
      {
        src: '/icons/icon-144x144.png',
        sizes: '144x144',
        type: 'image/png'
      },
      {
        src: '/icons/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        src: '/icons/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/icons/maskable-icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      },
      {
        src: '/icons/apple-touch-icon-180x180.png',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'apple touch icon'
      }
    ],
    shortcuts: [
      {
        name: 'Alphabet Game',
        short_name: 'Alphabet',
        description: 'Learn the alphabet with fun games',
        url: '/games/alphabet'
      },
      {
        name: 'Numbers Game',
        short_name: 'Numbers',
        description: 'Learn numbers and counting',
        url: '/games/numbers'
      },
      {
        name: 'Colors Game',
        short_name: 'Colors',
        description: 'Learn colors and shapes',
        url: '/games/colors'
      },
      {
        name: 'Parent Dashboard',
        short_name: 'Dashboard',
        description: 'View your child\'s progress',
        url: '/parent-dashboard'
      }
    ]
  },
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
    navigateFallback: '/offline.html',
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'google-fonts-cache',
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
          }
        }
      },
      {
        urlPattern: ({ request }: { request: Request }) => request.mode === 'navigate',
        handler: 'NetworkFirst',
        options: {
          cacheName: 'pages-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 7 // 7 days
          }
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
        urlPattern: /\/api\/.*\/*.json/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 // 1 day
          },
          networkTimeoutSeconds: 10
        }
      },
      {
        urlPattern: ({ request }: { request: Request }) => request.destination === 'image',
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
          }
        }
      },
      {
        urlPattern: ({ request }: { request: Request }) => request.destination === 'audio',
        handler: 'CacheFirst',
        options: {
          cacheName: 'audio-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
          }
        }
      }
    ],
    cleanupOutdatedCaches: true,
    skipWaiting: true,
    clientsClaim: true
  },
  devOptions: {
    enabled: true,
    type: 'module'
  }
});