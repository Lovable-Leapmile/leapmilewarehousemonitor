import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
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
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
				mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
			},
			colors: {
				border: 'var(--border)',
				input: 'var(--input)',
				ring: 'var(--ring)',
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				primary: {
					DEFAULT: 'var(--primary)',
					foreground: 'var(--primary-foreground)'
				},
				secondary: {
					DEFAULT: 'var(--secondary)',
					foreground: 'var(--secondary-foreground)'
				},
				destructive: {
					DEFAULT: 'var(--destructive)',
					foreground: 'var(--destructive-foreground)'
				},
				muted: {
					DEFAULT: 'var(--muted)',
					foreground: 'var(--muted-foreground)'
				},
				accent: {
					DEFAULT: 'var(--accent)',
					foreground: 'var(--accent-foreground)'
				},
				popover: {
					DEFAULT: 'var(--popover)',
					foreground: 'var(--popover-foreground)'
				},
				card: {
					DEFAULT: 'var(--card)',
					foreground: 'var(--card-foreground)'
				},
				warning: {
					DEFAULT: 'var(--warning)',
					foreground: 'var(--warning-foreground)'
				},
				success: {
					DEFAULT: 'var(--success)',
					foreground: 'var(--success-foreground)'
				},
				pick: {
					DEFAULT: 'var(--pick)',
					foreground: 'var(--pick-foreground)'
				},
				put: {
					DEFAULT: 'var(--put)',
					foreground: 'var(--put-foreground)'
				},
				ink: 'var(--ink)',
				surface: 'var(--surface)',
				brand: 'var(--brand)',
				'tone-a': 'var(--tone-a)',
				'tone-b': 'var(--tone-b)',
				'dot-empty': 'var(--dot-empty)',
				sidebar: {
					DEFAULT: 'var(--sidebar-background)',
					foreground: 'var(--sidebar-foreground)',
					primary: 'var(--sidebar-primary)',
					'primary-foreground': 'var(--sidebar-primary-foreground)',
					accent: 'var(--sidebar-accent)',
					'accent-foreground': 'var(--sidebar-accent-foreground)',
					border: 'var(--sidebar-border)',
					ring: 'var(--sidebar-ring)'
				}
			},
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
				'travel': {
					to: { transform: 'translateX(100%)' }
				},
				'arrival': {
					'0%': { boxShadow: 'var(--shadow-glow)', borderColor: 'color-mix(in oklab, var(--primary) 70%, transparent)' },
					'70%': { boxShadow: 'var(--shadow-glow)' },
					'100%': { boxShadow: 'var(--shadow-card)', borderColor: 'var(--border)' }
				},
				'pulse-dot': {
					'0%, 100%': { opacity: '1', transform: 'scale(1)' },
					'50%': { opacity: '0.35', transform: 'scale(0.82)' }
				},
				'spin-slow': {
					to: { transform: 'rotate(360deg)' }
				},
				'marquee': {
					'0%': { transform: 'translateX(0)' },
					'100%': { transform: 'translateX(-50%)' }
				},
				'scanner': {
					'0%, 100%': { opacity: '0.3', transform: 'scaleY(0.85)' },
					'50%': { opacity: '1', transform: 'scaleY(1)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'travel': 'travel 1.9s cubic-bezier(0.4, 0, 0.2, 1) infinite',
				'arrival': 'arrival 2.2s ease-out forwards',
				'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
				'spin-slow': 'spin-slow 3s linear infinite',
				'marquee': 'marquee var(--marquee-duration, 20s) linear infinite',
				'scanner': 'scanner 2s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
