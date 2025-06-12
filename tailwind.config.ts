import { type Config } from "tailwindcss";
import animate from 'tailwindcss-animate';
import typography from '@tailwindcss/typography';
import forms from '@tailwindcss/forms';
import aspectRatio from '@tailwindcss/aspect-ratio';
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  prefix: "",
  // تحسين الأداء عن طريق تقليل حجم CSS
  future: {
    hoverOnlyWhenSupported: true, // تفعيل :hover فقط على الأجهزة التي تدعمه
    respectDefaultRingColorOpacity: true,
    disableColorOpacityUtilitiesByDefault: true,
  },
  // تقليل حجم CSS في وضع الإنتاج
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "amazon-primary": "hsl(var(--amazon-primary))",
        "amazon-secondary": "hsl(var(--amazon-secondary))",
        "amazon-orange": "hsl(var(--amazon-orange))",
        "amazon-yellow": "hsl(var(--amazon-yellow))",
        "amazon-link": "hsl(var(--amazon-link))",
        "amazon-warning": "hsl(var(--amazon-warning))",
        "amazon-success": "hsl(var(--amazon-success))",
        "amazon-light": "hsl(var(--amazon-light))",
        "amazon-dark": "hsl(var(--amazon-dark))",
        "delight": {
          "50": "#fff1f1",
          "100": "#ffdfdf",
          "200": "#ffc5c5",
          "300": "#ff9d9d",
          "400": "#ff6464",
          "500": "#ff3333",
          "600": "#ff0f0f",
          "700": "#e60000",
          "800": "#c50000",
          "900": "#a10000",
          "950": "#570000"
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        amazon: ["Amazon Ember", "Amazon Ember Arabic", "Helvetica Neue", "Arial", "sans-serif"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "fade-out": "fade-out 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        "slide-out": "slide-out 0.3s ease-out",
      },
      typography: theme => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.800'),
            a: {
              color: theme('colors.red.600'),
              '&:hover': { color: theme('colors.red.700') },
            },
            h2: { fontWeight: '700', color: theme('colors.gray.900') },
            h3: { fontWeight: '600', color: theme('colors.gray.900') },
            p: { lineHeight: '1.75' },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.200'),
            a: { color: theme('colors.red.400') },
          },
        },
      }),
      gridTemplateColumns: {
        'product-card': '1fr 120px',
      },
      gridTemplateRows: {
        'card-layout': '1fr auto',
      },
    },
  },
  plugins: [
    animate,
    typography,
    forms({ strategy: 'class' }),
    aspectRatio,
  ],
  safelist: [
    // احتياطي للحفاظ على فئات أنيمشن وموضع Dialog
    'data-[state=open]:animate-fade-in',
    'data-[state=closed]:animate-fade-out',
    'data-[state=open]:animate-slide-in',
    'data-[state=closed]:animate-slide-out',
    '-translate-x-1/2',
    '-translate-y-1/2',
    // فئات لمكون ProductCard و OptimizedProductCard
    'bg-white', 'dark:bg-gray-800', 'rounded-lg', 'shadow-md', 'overflow-hidden', 'hover:shadow-lg', 'transition-all', 'duration-300',
    'block', 'relative', 'aspect-square', 'w-full', 'h-full', 'object-cover', 'transition-transform', 'duration-500',
    'absolute', 'top-2', 'right-2', 'flex', 'flex-col', 'gap-2',
    'bg-blue-500', 'text-white', 'text-xs', 'font-bold', 'px-2', 'py-1', 'rounded',
    'bg-amber-500', 'bg-red-500',
    'p-4', 'text-gray-500', 'dark:text-gray-400', 'mb-1', 'block',
    'text-lg', 'font-semibold', 'text-gray-800', 'dark:text-white', 'mb-2', 'line-clamp-2',
    'items-center', 'justify-between', 'gap-2',
    'text-blue-600', 'dark:text-blue-400',
    'text-sm', 'line-through',
    'text-amber-500', 'mr-1', 'text-gray-600', 'dark:text-gray-300',
    // فئات جديدة لضمان تنسيق ProductCard في وضع الإنتاج
    'grid', 'grid-cols-1', 'order-first', 'order-last',
    'grid-rows-[auto_1fr]', 'grid-row-1', 'grid-row-2',
    // فئات إضافية لمكون ProductCard
    'cursor-pointer', 'group', 'rounded-xl', 'border', 'border-gray-200', 'dark:border-gray-700', 'shadow-sm', 'hover:shadow-xl', 'flex', 'flex-col', 'h-full',
    'aspect-[3/2]', 'border-b', 'border-gray-100', 'bg-gray-50',
    'top-0', 'left-0', 'w-12', 'h-12', 'bg-red-500', 'shadow-lg', 'z-20',
    'bottom-3', 'left-2', 'transform', '-rotate-45', 'origin-bottom-left',
    'right-0', 'bg-gradient-to-br', 'from-yellow-400', 'to-amber-500',
    'bottom-3', 'right-2', 'rotate-45', 'origin-bottom-right',
    'ease-in-out', 'inset-0', 'bg-gradient-to-t', 'from-black/60', 'to-transparent', 'opacity-0', 'group-hover:opacity-100', 'transition-opacity',
    'space-y-1', 'text-xs', 'text-gray-500', 'dark:text-gray-400',
    'flex-wrap', 'gap-x-1.5', 'gap-y-0.5',
    'text-[10px]', 'bg-delight-50', 'dark:bg-delight-900/30', 'text-delight-700', 'dark:text-delight-300', 'px-1.5', 'py-0.5', 'rounded-sm', 'inline-flex',
    'w-2.5', 'h-2.5', 'ml-0.5',
    'bg-amber-100', 'dark:bg-amber-900/20', 'text-amber-600', 'dark:text-amber-300',
    'w-2.5', 'h-2.5', 'ml-0.5',
    'mt-1', 'line-through', 'text-gray-400', 'dark:text-gray-500', 'text-sm',
    'text-delight-600', 'dark:text-delight-400', 'font-bold',
    'mt-0.5', 'bg-red-100', 'dark:bg-red-900/20', 'text-red-600', 'dark:text-red-300', 'px-1', 'font-bold',
    'h-2.5', 'w-2.5', 'mr-0.5',
    'bg-green-100', 'dark:bg-green-900/20', 'text-green-600', 'dark:text-green-300',
    'h-2.5', 'w-2.5', 'mr-0.5',
    'mt-2', 'mb-3',
    'gap-1', 'text-[10px]', 'text-gray-600', 'dark:text-gray-300',
    'w-3', 'h-3', 'ml-1', 'text-delight-500', 'dark:text-delight-400',
    'mt-auto', 'pt-2', 'border-t', 'border-gray-100', 'dark:border-gray-700/50',
    'border-gray-200', 'text-amazon-link', 'hover:bg-gray-50', 'hover:text-amazon-link', 'hover:border-gray-300',
    '-z-10', 'bg-gradient-to-r', 'from-amber-200/20', 'to-delight-300/20', 'group-hover:opacity-100', 'rounded-xl',
    // فئات لشارات المخزون
    'bg-red-100', 'dark:bg-red-900/20', 'text-red-600', 'dark:text-red-300',
    'bg-yellow-100', 'dark:bg-yellow-900/20', 'text-yellow-600', 'dark:text-yellow-300',
    'bg-green-100', 'dark:bg-green-900/20', 'text-green-600', 'dark:text-green-300',
    'bg-blue-100', 'dark:bg-blue-900/20', 'text-blue-600', 'dark:text-blue-300',
    'bg-purple-100', 'dark:bg-purple-900/20', 'text-purple-600', 'dark:text-purple-300',
    'bg-gray-100', 'dark:bg-gray-900/20', 'text-gray-600', 'dark:text-gray-300',
    // فئات للأزرار
    'flex', 'items-center', 'justify-center', 'gap-1', 'rounded-md', 'px-3', 'py-1.5', 'text-sm', 'font-medium',
    'bg-delight-600', 'text-white', 'hover:bg-delight-700', 'dark:bg-delight-600', 'dark:hover:bg-delight-700',
    'border', 'border-gray-300', 'bg-white', 'text-gray-700', 'hover:bg-gray-50', 'dark:border-gray-600', 'dark:bg-gray-800', 'dark:text-gray-300', 'dark:hover:bg-gray-700',
    'w-full', 'sm:w-auto',
    // فئات للأيقونات
    'w-4', 'h-4', 'ml-1', 'mr-0',
    // فئات للشبكة (grid)
    'grid', 'gap-2', 'p-2', 'p-3',
    'order-last', 'w-[90px]', 'h-[90px]', 'w-full', 'h-full', 'h-[180px]',
    'order-first', 'pr-0',
    'flex-col', 'justify-between', 'h-full',
    'mb-1', 'mb-2', 'text-base', 'rounded-b-lg',
    'justify-center', 'items-center',
    'h-[150px]', 'w-[120px]', 'h-[120px]', 'order-last', 'order-first', 'pr-2',
    'absolute', 'bottom-0', 'left-0', 'right-0', 'bg-white/80', 'dark:bg-gray-800/80', 'backdrop-blur-sm',
    // فئات إضافية لمكون OptimizedProductCard
    'text-amber-500', 'text-blue-600', 'dark:text-blue-400',
    'font-bold', 'text-lg',
    'priceWrapperClasses', 'priceContainerClasses', 'ratingContainerClasses', 'ratingStarClasses', 'ratingValueClasses',
    'currentPriceClasses', 'originalPriceClasses', 'categoryClasses', 'titleClasses', 'contentClasses',
    'badgesContainerClasses', 'newBadgeClasses', 'bestSellerBadgeClasses', 'discountBadgeClasses',
    'imageClasses', 'imageWrapperClasses', 'imageContainerClasses', 'linkClasses', 'cardContainerClasses',
    'style', 'transform', 'scale(1.05)', 'scale(1)',
    // Clases de VirtualizedProductGrid
    'relative', 'overflow-auto', 'position-relative', 'grid-cols-1', 'md:grid-cols-2',
    'lg:grid-cols-3', 'xl:grid-cols-4', '2xl:grid-cols-5', 'gap-1', 'gap-2', 'gap-3', 'gap-4',
    'gap-5', 'gap-6', 'gap-8',
    // Clases para animaciones y efectos
    'animate-fade-in', 'animate-slide-up', 'transition-all', 'duration-300',
    'hover:scale-105', 'active:scale-95', 'group-hover:animate-pulse',
    'absolute', '-z-10', 'inset-0', 'bg-gradient-to-r', 'from-amber-200/20', 'to-delight-300/20',
    'opacity-0', 'group-hover:opacity-100', 'transition-opacity', 'duration-500', 'rounded-xl',
    // ثوابت الارتفاع والفجوة الرأسية
    'ROW_GAP', 'CARD_HEIGHT', 'h-[150px]', 'flex-shrink-0', 'backdrop-blur-sm', 'bg-white/80', 'dark:bg-gray-800/80', 'w-[120px]', 'h-[120px]', 'flex-shrink-0',
    // Classes used by VirtualizedProductGrid component
    'grid-cols-[1fr]',
    'grid-rows-[1fr_auto]',
    'row-start-1',
    'row-start-2',
    'col-span-2',
    '-mt-3',
    '-mt-9',
    '-mt-10',
    'overflow-x-visible',
    'overflow-y-auto',
    'px-4',
    'sm:px-6',
    'lg:px-8',
    'py-1',
    'py-2',
    'py-3',
    'h-full',
    // فئات لضمان دعم تمرير ونسبة ارتفاع الموديال
    'max-h-[90vh]',
    'overflow-y-auto',
    // Ensure custom strikethrough utilities are not purged
    'h-[1.5px]', 'rotate-[-7deg]', 'top-[50%]', 'transform',
    // Ensure sidebar z-index classes are preserved
    'z-[9990]', 'z-[9999]',
  ],
} satisfies Config;

export default config;
