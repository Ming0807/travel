import { sanitizeAdminRichHtml } from "@/lib/content/admin-rich-html";

export const ATTRACTION_RICH_CONTENT_CLASS =
  "rich-content-media prose prose-lg max-w-[72ch] prose-headings:scroll-mt-28 prose-headings:font-black prose-headings:text-[var(--public-ink)] prose-p:leading-8 prose-p:text-slate-700 prose-a:font-bold prose-a:text-[var(--public-teal)] prose-a:underline prose-a:underline-offset-4 prose-blockquote:border-[var(--public-coral)] prose-blockquote:text-slate-700 prose-img:rounded-lg prose-img:bg-slate-100";

export function AttractionRichContent({
  html,
  className = "",
}: {
  html: string | null | undefined;
  className?: string;
}) {
  const safeHtml = sanitizeAdminRichHtml(html);
  if (!safeHtml) return null;

  return (
    <div
      className={`${ATTRACTION_RICH_CONTENT_CLASS} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: safeHtml }}
    />
  );
}
