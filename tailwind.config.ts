import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "amazon-orange": "#FF9900",
        "amazon-dark": "#131A22",
      },
    },
  },
  plugins: [],
};

export default config;

