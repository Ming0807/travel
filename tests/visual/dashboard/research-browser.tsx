import { createRoot } from "react-dom/client";
import { ResearchConsentSubmit } from "@/components/research/ResearchConsentSubmit";
import "@/app/globals.css";

createRoot(document.getElementById("root")!).render(<main className="min-h-screen bg-white p-4 sm:p-8">
  <form className="mx-auto max-w-lg space-y-4" onSubmit={(event)=>event.preventDefault()}>
    <h1 className="text-xl font-bold">ยืนยันการเข้าร่วมวิจัย</h1>
    <ResearchConsentSubmit prepareBrowser/>
    <a href="#declined" className="flex min-h-12 items-center justify-center border border-gray-300 p-3">ไม่เข้าร่วม และสร้างใบประกาศต่อ</a>
  </form>
</main>);
