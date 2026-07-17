import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

    server: {
    proxy: {
      "/api": {
        target: "https://openaq-rob-287820185021-eu-west-1-an.s3.eu-west-1.amazonaws.com/processed/",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        secure: false,
      },
    },
  },
});