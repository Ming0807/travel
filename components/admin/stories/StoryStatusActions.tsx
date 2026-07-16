import { ArrowRight, Image as ImageIcon, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { StoryLibraryMode } from "@/lib/content/story-library";

interface StoryStatusActionsProps {
  storyId: number;
  mode?: StoryLibraryMode;
}

export function StoryStatusActions({
  storyId,
  mode = "editorial",
}: StoryStatusActionsProps) {
  return (
    <div className="flex min-h-11 items-center justify-end gap-1">
      <Link
        href={`/admin/stories/${storyId}/media`}
        className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
        title="จัดการรูปภาพ"
      >
        <ImageIcon size={18} weight="bold" />
        <span className="sr-only">จัดการรูปภาพ</span>
      </Link>
      <Link
        href={`/admin/stories/${storyId}/edit`}
        className={
          mode === "submissions"
            ? "inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-bold text-[#0A6B62] transition hover:bg-[#E6F4EF] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
            : "flex h-11 w-11 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-[#0A6B62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A6B62]"
        }
        title={mode === "submissions" ? "เปิดตรวจเรื่องเล่า" : "แก้ไขบทความ"}
      >
        {mode === "submissions" ? (
          <>เปิดตรวจ <ArrowRight size={17} weight="bold" /></>
        ) : (
          <><PencilSimple size={18} weight="bold" /><span className="sr-only">แก้ไขบทความ</span></>
        )}
      </Link>
    </div>
  );
}
