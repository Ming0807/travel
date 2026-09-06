import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../../", import.meta.url));
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  resolve: { alias: [
    { find: "@/app/actions/admin-nfc-actions", replacement: fileURLToPath(new URL("./nfc-actions.ts", import.meta.url)) },
    { find: "@", replacement: root },
    { find: "next/navigation", replacement: fileURLToPath(new URL("./navigation.ts", import.meta.url)) },
  ] },
  css: { postcss: root },
  server: { host: "127.0.0.1", port: 4180, strictPort: true, fs: { allow: [root] } },
});
