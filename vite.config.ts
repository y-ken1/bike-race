import { defineConfig } from "vite";

export default defineConfig({
  base: "/bike-race/", // ← サブフォルダを指定
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ["phaser"], // Phaser を独立 chunk に
        },
      },
    },
  },
});
