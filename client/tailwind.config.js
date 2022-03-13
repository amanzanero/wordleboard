module.exports = {
  content: ["./src/pages/**/*.{js,ts,jsx,tsx}", "./src/components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        wiggle: "wiggle 0.25s",
        pop: "pop 0.25s",
        card: "card 0.5s ease-in-out forwards",
      },
      colors: {
        fb: "#4267b2",
        absent: "#3a3a3c",
        darkmode: "#1a1a1b",
      },
      keyframes: {
        card: {
          "100%": { transform: "rotateX(180deg)" },
        },
        wiggle: {
          "0%,100": { transform: "translate(0px)" },
          "25%": { transform: "translate(5px)" },
          "75%": { transform: "translate(-5px)" },
        },
        pop: {
          "0%,100%": { transform: "scale(100%)" },
          "50%": { transform: "scale(105%)" },
        },
      },
    },
  },
  plugins: [require("daisyui")],
};
