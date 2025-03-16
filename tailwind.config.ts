
import type { Config } from "tailwindcss";

export default {
	darkMode: ['class'],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'sm': '640px',
				'md': '768px',
				'lg': '1024px',
				'xl': '1280px',
				'2xl': '1536px',
				'3xl': '1920px', // Added for ultra-wide screens
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				delight: {
					50: '#f0f9ff',
					100: '#e0f2fe',
					200: '#bae6fd',
					300: '#7dd3fc',
					400: '#38bdf8',
					500: '#0ea5e9',
					600: '#0284c7',
					700: '#0369a1',
					800: '#075985',
					900: '#0c4a6e',
				},
				amazon: {
					primary: '#131921',
					secondary: '#232f3e',
					yellow: '#FFD814',
					orange: '#FF9900',
					link: '#007185',
					button: '#f0c14b',
					warning: '#c40000',
					success: '#067D62',
					light: '#F5F5F5',
					dark: '#0F1111',
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			typography: ({ theme }) => ({
				DEFAULT: {
					css: {
						'--tw-prose-body': theme('colors.gray.700'),
						'--tw-prose-headings': theme('colors.gray.900'),
						'--tw-prose-lead': theme('colors.gray.600'),
						'--tw-prose-links': theme('colors.blue.700'),
						'--tw-prose-bold': theme('colors.gray.900'),
						'--tw-prose-counters': theme('colors.gray.500'),
						'--tw-prose-bullets': theme('colors.gray.300'),
						'--tw-prose-hr': theme('colors.gray.200'),
						'--tw-prose-quotes': theme('colors.gray.900'),
						'--tw-prose-quote-borders': theme('colors.gray.200'),
						'--tw-prose-captions': theme('colors.gray.500'),
						'--tw-prose-code': theme('colors.gray.900'),
						'--tw-prose-pre-code': theme('colors.gray.200'),
						'--tw-prose-pre-bg': theme('colors.gray.800'),
						'--tw-prose-th-borders': theme('colors.gray.300'),
						'--tw-prose-td-borders': theme('colors.gray.200'),
						'--tw-prose-invert-body': theme('colors.gray.300'),
						'--tw-prose-invert-headings': theme('colors.white'),
						'--tw-prose-invert-lead': theme('colors.gray.400'),
						'--tw-prose-invert-links': theme('colors.blue.400'),
						'--tw-prose-invert-bold': theme('colors.white'),
						'--tw-prose-invert-counters': theme('colors.gray.400'),
						'--tw-prose-invert-bullets': theme('colors.gray.600'),
						'--tw-prose-invert-hr': theme('colors.gray.700'),
						'--tw-prose-invert-quotes': theme('colors.gray.100'),
						'--tw-prose-invert-quote-borders': theme('colors.gray.700'),
						'--tw-prose-invert-captions': theme('colors.gray.400'),
						'--tw-prose-invert-code': theme('colors.white'),
						'--tw-prose-invert-pre-code': theme('colors.gray.300'),
						'--tw-prose-invert-pre-bg': theme('colors.gray.900'),
						'--tw-prose-invert-th-borders': theme('colors.gray.600'),
						'--tw-prose-invert-td-borders': theme('colors.gray.700'),
					},
				},
			}),
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(10px)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					from: { transform: 'scale(1)', opacity: '1' },
					to: { transform: 'scale(0.95)', opacity: '0' }
				},
				'slide-in': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(0)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)' },
					'100%': { transform: 'translateY(0)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' }
				},
				'shine': {
					'0%': { backgroundPosition: '200% 0' },
					'100%': { backgroundPosition: '-200% 0' }
				},
				'spin-slow': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'bounce-light': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-out': 'fade-out 0.5s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'scale-out': 'scale-out 0.3s ease-out',
				'slide-in': 'slide-in 0.5s ease-out',
				'slide-in-right': 'slide-in-right 0.5s ease-out',
				'slide-up': 'slide-up 0.5s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'shine': 'shine 8s ease-in-out infinite',
				'spin-slow': 'spin-slow 15s linear infinite',
				'bounce-light': 'bounce-light 2s ease-in-out infinite'
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				display: ['Lexend', 'sans-serif'],
				arabic: ['Tajawal', 'sans-serif'],
				amazon: ['Amazon Ember', 'Helvetica Neue', 'Arial', 'sans-serif']
			},
			boxShadow: {
				'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
				'neobrut': '0.5rem 0.5rem 0 0 rgba(0, 0, 0, 1)',
				'soft': '0 5px 15px rgba(0, 0, 0, 0.05)',
				'highlight': '0 0 15px rgba(59, 130, 246, 0.3)',
				'amazon': '0 2px 5px rgba(15, 17, 17, 0.15)'
			},
			backgroundImage: {
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				'shine': 'linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent)',
				'blue-gradient': 'linear-gradient(45deg, #0284c7, #38bdf8, #0ea5e9)',
				'amazon-button': 'linear-gradient(to bottom, #f7dfa5, #f0c14b)',
				'glass-gradient': 'linear-gradient(to right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2))'
			},
			// Added support for ultra-wide screens
			screens: {
				'3xl': '1920px',
				'4xl': '2560px'
			}
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		require('@tailwindcss/typography')
	],
} satisfies Config;
