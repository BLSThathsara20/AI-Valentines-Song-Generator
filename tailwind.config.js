/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			animation: {
				"gradient-x": "gradient-x 3s ease infinite",
				"float-hearts": "float-hearts 20s ease-in-out infinite",
				"bounce-subtle": "bounce-subtle 2s ease-in-out infinite",
				"pulse-subtle": "pulse-subtle 2s ease-in-out infinite",
				shimmer: "shimmer 2s linear infinite",
				shake: "shake 0.5s cubic-bezier(.36,.07,.19,.97) both",
				"fade-in": "fade-in 0.5s ease-out forwards",
				"fade-in-delay": "fade-in 0.5s ease-out 0.2s forwards",
				"fade-in-delay-2": "fade-in 0.5s ease-out 0.4s forwards",
				success: "success 0.3s ease-out forwards",
				"float-heart": "floatHeart 30s cubic-bezier(0.4, 0, 0.6, 1) infinite",
			},
			keyframes: {
				"gradient-x": {
					"0%, 100%": {
						"background-size": "200% 200%",
						"background-position": "left center",
					},
					"50%": {
						"background-size": "200% 200%",
						"background-position": "right center",
					},
				},
				"float-hearts": {
					"0%": {
						transform: "translateY(0) rotate(0deg)",
						opacity: 0,
					},
					"50%": {
						transform: "translateY(-40vh) rotate(180deg)",
						opacity: 0.6,
					},
					"100%": {
						transform: "translateY(-80vh) rotate(360deg)",
						opacity: 0,
					},
				},
				"bounce-subtle": {
					"0%, 100%": {
						transform: "translateY(-5%)",
						"animation-timing-function": "cubic-bezier(0.8, 0, 1, 1)",
					},
					"50%": {
						transform: "translateY(0)",
						"animation-timing-function": "cubic-bezier(0, 0, 0.2, 1)",
					},
				},
				"pulse-subtle": {
					"0%, 100%": {
						opacity: 1,
						transform: "scale(1)",
					},
					"50%": {
						opacity: 0.9,
						transform: "scale(1.05)",
					},
				},
				shimmer: {
					"0%": {
						transform: "translateX(-100%)",
					},
					"100%": {
						transform: "translateX(100%)",
					},
				},
				shake: {
					"10%, 90%": {
						transform: "translate3d(-1px, 0, 0)",
					},
					"20%, 80%": {
						transform: "translate3d(2px, 0, 0)",
					},
					"30%, 50%, 70%": {
						transform: "translate3d(-4px, 0, 0)",
					},
					"40%, 60%": {
						transform: "translate3d(4px, 0, 0)",
					},
				},
				"fade-in": {
					"0%": {
						opacity: 0,
						transform: "translateY(10px)",
					},
					"100%": {
						opacity: 1,
						transform: "translateY(0)",
					},
				},
				success: {
					"0%": {
						transform: "scale(1)",
					},
					"50%": {
						transform: "scale(1.2) rotate(10deg)",
					},
					"100%": {
						transform: "scale(1) rotate(0deg)",
					},
				},
				floatHeart: {
					"0%": {
						transform: "translateY(120vh) translateX(-20px) scale(0)",
						opacity: "0",
					},
					"5%": {
						transform: "translateY(100vh) translateX(0) scale(0.2)",
						opacity: "0.1",
					},
					"15%": {
						transform: "translateY(80vh) translateX(20px) scale(0.5)",
						opacity: "0.3",
					},
					"30%": {
						transform: "translateY(60vh) translateX(-10px) scale(1)",
						opacity: "0.2",
					},
					"50%": {
						transform: "translateY(40vh) translateX(10px) scale(0.8)",
						opacity: "0.15",
					},
					"70%": {
						transform: "translateY(20vh) translateX(-5px) scale(0.4)",
						opacity: "0.1",
					},
					"85%": {
						transform: "translateY(10vh) translateX(0) scale(0.2)",
						opacity: "0.05",
					},
					"95%": {
						transform: "translateY(5vh) translateX(0) scale(0.1)",
						opacity: "0.02",
					},
					"100%": {
						transform: "translateY(-10vh) translateX(0) scale(0)",
						opacity: "0",
					},
				},
			},
			colors: {
				valentine: {
					pink: "#FF69B4",
					orange: "#FF8C69",
				},
			},
		},
	},
	plugins: [],
	corePlugins: {
		preflight: true,
	},
};
