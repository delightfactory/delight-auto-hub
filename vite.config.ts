import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';
import viteCompression from 'vite-plugin-compression';
// استخدام sharp بدلاً من imagemin لتحسين الصور
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    // مكون تسمية المكونات في وضع التطوير
    mode === 'development' && componentTagger(),
    
    // مكون دعم تطبيقات الويب التقدمية (PWA)
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'Delight Auto Hub',
        short_name: 'Delight',
        description: 'Delight Auto Hub - متجر إكسسوارات السيارات',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      // تحسين أداء Service Worker
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // سنة واحدة
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
                maxAgeSeconds: 60 * 60 * 24 * 365 // سنة واحدة
              }
            }
          },
          {
            urlPattern: /\.(png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 يوم
              }
            }
          },
          {
            urlPattern: /\.(js|css)$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-resources',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 7 // أسبوع
              }
            }
          },
          {
            urlPattern: /^https:\/\/api\..*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 // ساعة واحدة
              },
              networkTimeoutSeconds: 10
            }
          }
        ]
      }
    }),
    
    // ضغط الملفات في وضع الإنتاج
    mode === 'production' && viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // 10KB
      deleteOriginFile: false
    }),
    
    // ضغط الملفات بتنسيق Brotli في وضع الإنتاج
    mode === 'production' && viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // 10KB
      deleteOriginFile: false
    }),
    
    // تم استبدال تحسين الصور باستخدام سكربت optimize-images.js الذي يستخدم مكتبة sharp
    // يمكن تشغيل السكربت باستخدام الأمر: npm run optimize-images
    
    // تحليل حجم الحزم في وضع التحليل
    mode === 'analyze' && visualizer({
      open: true,
      filename: 'dist/stats.html',
      gzipSize: true,
      brotliSize: true
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // إنشاء source maps فقط في وضع التطوير
    sourcemap: mode === 'development',
    // تحسين أداء البناء
    target: 'es2015',
    // تقليل حجم الملفات الناتجة - تم تعديله لتجنب مشاكل العرض
    minify: mode === 'production' ? 'terser' : false,
    terserOptions: {
      compress: {
        drop_console: false, // تم تعطيل حذف console.log للمساعدة في التصحيح
        drop_debugger: mode === 'production',
        pure_funcs: [] // تم تعطيل حذف وظائف console.log و console.info
      },
      output: {
        comments: false
      },
      // تجنب تحويل أسماء المتغيرات والدوال للحفاظ على قابلية التصحيح
      mangle: {
        keep_classnames: true,
        keep_fnames: true
      }
    },
    // تقسيم الكود إلى حزم أصغر
    rollupOptions: {
      output: {
        manualChunks: {
          // مكتبات React الأساسية
          react: ['react', 'react-dom', 'react-router-dom'],
          // مكتبات الطرف الثالث
          vendor: ['axios', 'date-fns', 'clsx', 'framer-motion'],
          // مكونات واجهة المستخدم
          ui: [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog',
            '@radix-ui/react-avatar'
          ],
          // مكونات النماذج
          forms: [
            '@hookform/resolvers',
            'react-hook-form',
            'zod'
          ],
          // مكونات الرسوم البيانية
          charts: ['recharts']
        },
        // تحسين أسماء الملفات
        entryFileNames: mode === 'production' 
          ? 'assets/[name].[hash].js' 
          : 'assets/[name].js',
        chunkFileNames: mode === 'production' 
          ? 'assets/[name].[hash].js' 
          : 'assets/[name].js',
        assetFileNames: mode === 'production' 
          ? 'assets/[name].[hash].[ext]' 
          : 'assets/[name].[ext]'
      }
    },
    // زيادة حد تحذير حجم الحزمة
    chunkSizeWarningLimit: 1000,
    // تحسين الأداء في وضع الإنتاج
    cssCodeSplit: true,
    assetsInlineLimit: 4096, // 4KB
    emptyOutDir: true
  },
  optimizeDeps: {
    // تحسين أداء المكتبات المستخدمة بشكل متكرر
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      'axios',
      'date-fns',
      'clsx',
      'framer-motion',
      'react-hook-form',
      'zod',
      '@hookform/resolvers',
      'react-virtualized',
      'react-window',
      'react-intersection-observer',
      'react-lazy-load-image-component',
      'web-vitals'
    ],
    // تحسين أداء التطوير
    esbuildOptions: {
      target: 'es2020',
    },
    // تمكين التحسين المسبق للمكتبات
    force: true
  },
  envPrefix: 'VITE_'
}));
