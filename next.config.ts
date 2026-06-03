import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // Đảm bảo CÓ dòng này để ăn CSS cho components nhé!
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
export default nextConfig;



