/** @type {import('tailwindcss').Config} */
export const content = ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"];
export const theme = {
  extend: {
    keyframes: {
      "cell-add": {
        "0%": { transform: "scale(0.7)", opacity: "0" },
        "50%": { transform: "scale(1.08)", opacity: "0.9" },
        "100%": { transform: "scale(1)", opacity: "1" },
      },
      "cell-remove": {
        "0%": { transform: "scale(1)", opacity: "1" },
        "50%": { transform: "scale(0.9)", opacity: "0.4" },
        "100%": { transform: "scale(0.7)", opacity: "0" },
      },
      "text-appear": {
        "0%": { transform: "scale(0.5)", opacity: "0" },
        "70%": { transform: "scale(1.1)", opacity: "0.9" },
        "100%": { transform: "scale(1)", opacity: "1" },
      },
      "text-disappear": {
        "0%": { transform: "scale(1)", opacity: "1" },
        "100%": { transform: "scale(0.3)", opacity: "0" },
      },
      "strike-line": {
        "0%": { opacity: "0", transform: "scaleX(0)" },
        "100%": { opacity: "1", transform: "scaleX(1)" },
      },
      "pulse-once": {
        // New animation for winner
        "0%, 100%": { opacity: 1, transform: "scale(1)" },
        "50%": { opacity: 0.8, transform: "scale(1.02)" },
      },
      "fade-in-out": {
        // New animation for current player
        "0%, 100%": { opacity: 1 },
        "50%": { opacity: 0.6 },
      },
    },
    animation: {
      "cell-add": "cell-add 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards",
      "cell-remove": "cell-remove 0.35s ease-out forwards",
      "text-appear": "text-appear 0.35s cubic-bezier(0.4, 0, 0.2, 1) forwards",
      "text-disappear": "text-disappear 0.3s ease-out forwards",
      "strike-line": "strike-line 0.8s ease-out forwards",
      "pulse-once": "pulse-once 1.5s ease-in-out", // Changed to not repeat endlessly
      "fade-in-out": "fade-in-out 1.8s infinite ease-in-out",
    },
    boxShadow: {
      // Added a stronger inner shadow for the board
      "inner-lg":
        "inset 0 2px 10px rgba(0, 0, 0, 0.6), inset 0 -2px 10px rgba(0, 0, 0, 0.6)",
    },
  },
};
export const plugins = [];
