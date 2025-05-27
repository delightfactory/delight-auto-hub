export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // تقليل حجم CSS في وضع الإنتاج
    ...(process.env.NODE_ENV === 'production' ? {
      // إزالة التعليقات من CSS
      'cssnano': {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          // تقليل حجم CSS بشكل أكبر
          minifyFontValues: true,
          minifySelectors: true,
          normalizeWhitespace: true,
          reduceIdents: true,
          mergeIdents: true,
          discardUnused: true,
        }],
      },
      // إزالة الأنماط غير المستخدمة
      '@fullhuman/postcss-purgecss': {
        content: [
          './src/**/*.{js,jsx,ts,tsx}',
          './index.html',
        ],
        defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
        safelist: {
          standard: ['html', 'body', 'dark'],
          deep: [/^dark/, /^light/, /^bg-/, /^text-/, /^border-/, /^hover:/],
        },
      },
    } : {}),
  },
}
