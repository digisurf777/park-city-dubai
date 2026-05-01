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
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					glow: 'hsl(var(--primary-glow))',
					deep: 'hsl(var(--primary-deep))'
				},
				surface: {
					DEFAULT: 'hsl(var(--surface))',
					2: 'hsl(var(--surface-2))'
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
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'zoom-slow': {
					'0%': { 
						transform: 'scale(1.05)' 
					},
					'100%': { 
						transform: 'scale(1)' 
					}
				},
				'mobile-fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
			'slide-up': {
				'0%': {
					transform: 'translateY(100%)',
					opacity: '0'
				},
				'100%': {
					transform: 'translateY(0)',
					opacity: '1'
				}
			},
			'blink-red': {
				'0%, 100%': {
					backgroundColor: 'rgb(239 68 68)',
					opacity: '1'
				},
				'50%': {
					backgroundColor: 'rgb(220 38 38)',
					opacity: '0.8'
				}
			},
			'frame-pulse': {
				'0%, 100%': {
					boxShadow:
						'0 20px 40px -15px hsl(var(--primary-deep) / 0.45), 0 8px 16px -8px hsl(var(--primary) / 0.3), 0 0 0 0 hsl(var(--primary) / 0.45), inset 0 1px 0 0 hsl(0 0% 100% / 0.4)'
				},
				'50%': {
					boxShadow:
						'0 22px 44px -14px hsl(var(--primary-deep) / 0.55), 0 10px 20px -8px hsl(var(--primary-glow) / 0.5), 0 0 0 6px hsl(var(--primary) / 0.12), inset 0 1px 0 0 hsl(0 0% 100% / 0.5)'
				}
			},
			'marquee': {
				'0%': { transform: 'translateX(0)' },
				'100%': { transform: 'translateX(-50%)' }
			},
			'marquee-reverse': {
				'0%': { transform: 'translateX(-50%)' },
				'100%': { transform: 'translateX(0)' }
			},
			'logo-float': {
				'0%, 100%': { transform: 'translateY(0) scale(1)' },
				'50%': { transform: 'translateY(-6px) scale(1.04)' }
			}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'zoom-slow': 'zoom-slow 0.6s ease-out',
				'mobile-fade-in': 'mobile-fade-in 0.4s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'blink-red': 'blink-red 1.5s ease-in-out infinite',
				'frame-pulse': 'frame-pulse 3s ease-in-out infinite',
				'marquee': 'marquee 50s linear infinite',
				'marquee-fast': 'marquee 35s linear infinite',
				'marquee-reverse': 'marquee-reverse 50s linear infinite',
				'logo-float': 'logo-float 4s ease-in-out infinite'
			},
			spacing: {
				'safe-area-top': 'env(safe-area-inset-top)',
				'safe-area-bottom': 'env(safe-area-inset-bottom)',
				'safe-area-left': 'env(safe-area-inset-left)',
				'safe-area-right': 'env(safe-area-inset-right)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
