import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../../", import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  publicDir: `${root}public`,
  resolve: {
    alias: [
      { find: "@/app/actions/admin-route-actions", replacement: fileURLToPath(new URL("./admin-actions.ts", import.meta.url)) },
      { find: "next/navigation", replacement: fileURLToPath(new URL("./navigation.ts", import.meta.url)) },
      { find: "next/link", replacement: fileURLToPath(new URL("../dashboard/link.tsx", import.meta.url)) },
      { find: "next/image", replacement: fileURLToPath(new URL("./image.tsx", import.meta.url)) },
      { find: "@", replacement: root },
    ],
  },
  css: { postcss: root },
  server: { host: "127.0.0.1", port: 4188, strictPort: true, fs: { allow: [root] } },
});
