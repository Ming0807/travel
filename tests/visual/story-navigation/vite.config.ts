import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("../../../", import.meta.url));
const here = (path: string) => fileURLToPath(new URL(path, import.meta.url));
export default defineConfig({
  root: here("."), publicDir: `${root}public`,
  resolve: { alias: [
    { find: "@/lib/supabase/browser", replacement: here("./auth.ts") },
    { find: "@/app/actions/admin-story-actions", replacement: here("./actions.ts") },
    { find: "@/components/admin/forms/FormRichText", replacement: here("./editor-stubs.tsx") },
    { find: "@/components/admin/media/MediaPickerModal", replacement: here("./editor-stubs.tsx") },
    { find: "@/components/admin/stories/editor/StoryRecommendationManager", replacement: here("./editor-stubs.tsx") },
    { find: "next/navigation", replacement: here("./navigation.ts") },
    { find: "next/link", replacement: here("../dashboard/link.tsx") },
    { find: "next/image", replacement: here("../routes/image.tsx") },
    { find: "@", replacement: root },
  ] },
  css: { postcss: root },
  server: { host: "127.0.0.1", port: 4190, strictPort: true, fs: { allow: [root] } },
});
