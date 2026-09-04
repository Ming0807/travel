import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  resolve: {
    alias: {
      "@": root,
      "next/navigation": fileURLToPath(new URL("./navigation.ts", import.meta.url)),
      "next/link": fileURLToPath(new URL("./link.tsx", import.meta.url)),
    },
  },
  css: { postcss: root },
  server: { host: "127.0.0.1", port: 4175, strictPort: true, fs: { allow: [root] } },
});
