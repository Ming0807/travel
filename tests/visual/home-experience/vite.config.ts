import { defineConfig, type Plugin } from "vite";
import { fileURLToPath } from "node:url";
import { routeMapData } from "./data";

const root = fileURLToPath(new URL("../../../", import.meta.url));
const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
const stylesheet = (path: string) => `/@fs/${root.replaceAll("\\", "/")}${path}?direct`;
const fixtureApi: Plugin = {
  name: "home-synthetic-api-and-ssr",
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const path = req.url?.split("?")[0];
      const match = path?.match(/^\/api\/public\/routes\/(fixture-route-[123])\/map$/);
      if (match) {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ success: true, data: routeMapData(match[1]) }));
        return;
      }
      if (path !== "/ssr.html") { next(); return; }
      try {
        const rendered = await server.ssrLoadModule(here("./server.tsx"));
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(`<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Home SSR without JavaScript</title><link rel="stylesheet" href="${stylesheet("app/globals.css")}"><link rel="stylesheet" href="${stylesheet("tests/visual/dashboard/fixture-fonts.css")}"><link rel="stylesheet" href="${stylesheet("components/homepage/homepage-editorial.css")}"></head><body>${rendered.render()}</body></html>`);
      } catch (error) { next(error); }
    });
  },
};

export default defineConfig({
  root: here("."), publicDir: `${root}public`,
  plugins: [fixtureApi],
  resolve: { alias: [
    { find: "next/link", replacement: here("../dashboard/link.tsx") },
    { find: "next/image", replacement: here("./image.tsx") },
    { find: "@", replacement: root },
  ] },
  css: { postcss: root },
  server: { host: "127.0.0.1", port: 4192, strictPort: true, fs: { allow: [root] } },
});
