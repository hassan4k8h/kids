module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/letters',
        'http://localhost:3000/numbers',
        'http://localhost:3000/colors',
        'http://localhost:3000/stories'
      ],
      startServerCommand: 'npm run preview',
      startServerReadyPattern: 'Local:',
      startServerReadyTimeout: 30000,
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage --disable-gpu',
        preset: 'desktop',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 1,
          requestLatencyMs: 0,
          downloadThroughputKbps: 0,
          uploadThroughputKbps: 0
        },
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false
        },
        formFactor: 'desktop',
        onlyCategories: [
          'performance',
          'accessibility',
          'best-practices',
          'seo',
          'pwa'
        ]
      }
    },
    assert: {
      assertions: {
        // Performance thresholds
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'categories:pwa': ['warn', { minScore: 0.8 }],
        
        // Core Web Vitals
        'first-contentful-paint': ['warn', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'first-meaningful-paint': ['warn', { maxNumericValue: 2000 }],
        'speed-index': ['warn', { maxNumericValue: 3000 }],
        'interactive': ['error', { maxNumericValue: 3800 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        
        // Resource optimization
        'unused-css-rules': ['warn', { maxNumericValue: 20000 }],
        'unused-javascript': ['warn', { maxNumericValue: 20000 }],
        'modern-image-formats': ['warn', { minScore: 0.8 }],
        'uses-optimized-images': ['warn', { minScore: 0.8 }],
        'uses-webp-images': ['warn', { minScore: 0.8 }],
        'uses-responsive-images': ['warn', { minScore: 0.8 }],
        'efficient-animated-content': ['warn', { minScore: 0.8 }],
        
        // Network optimization
        'uses-text-compression': ['error', { minScore: 0.9 }],
        'uses-rel-preconnect': ['warn', { minScore: 0.8 }],
        'uses-rel-preload': ['warn', { minScore: 0.8 }],
        'font-display': ['warn', { minScore: 0.8 }],
        
        // JavaScript optimization
        'unminified-javascript': ['error', { maxNumericValue: 0 }],
        'unminified-css': ['error', { maxNumericValue: 0 }],
        'render-blocking-resources': ['warn', { maxNumericValue: 500 }],
        
        // Accessibility
        'color-contrast': ['error', { minScore: 1 }],
        'image-alt': ['error', { minScore: 1 }],
        'label': ['error', { minScore: 1 }],
        'link-name': ['error', { minScore: 1 }],
        'button-name': ['error', { minScore: 1 }],
        'document-title': ['error', { minScore: 1 }],
        'html-has-lang': ['error', { minScore: 1 }],
        'html-lang-valid': ['error', { minScore: 1 }],
        'meta-viewport': ['error', { minScore: 1 }],
        
        // SEO
        'meta-description': ['error', { minScore: 1 }],
        'http-status-code': ['error', { minScore: 1 }],
        'crawlable-anchors': ['error', { minScore: 1 }],
        'is-crawlable': ['error', { minScore: 1 }],
        'robots-txt': ['warn', { minScore: 1 }],
        'hreflang': ['warn', { minScore: 1 }],
        'canonical': ['warn', { minScore: 1 }],
        
        // PWA
        'service-worker': ['warn', { minScore: 1 }],
        'installable-manifest': ['warn', { minScore: 1 }],
        'splash-screen': ['warn', { minScore: 1 }],
        'themed-omnibox': ['warn', { minScore: 1 }],
        'content-width': ['warn', { minScore: 1 }],
        'viewport': ['error', { minScore: 1 }],
        
        // Security
        'is-on-https': ['error', { minScore: 1 }],
        'uses-https': ['error', { minScore: 1 }],
        'no-vulnerable-libraries': ['error', { minScore: 1 }]
      }
    },
    upload: {
      target: 'temporary-public-storage'
    },
    server: {
      port: 9001,
      storage: {
        storageMethod: 'sql',
        sqlDialect: 'sqlite',
        sqlDatabasePath: './lhci.db'
      }
    },
    wizard: {
      // Configuration for LHCI wizard
    }
  }
};