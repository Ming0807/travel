import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { LineLinkPanel } from "@/components/account/LineLinkPanel";

type AccountLinkingTeaserProps = {
  isGuest?: boolean;
  context?: "certificate" | "passport" | "profile";
};

export function AccountLinkingTeaser({ isGuest = true, context = "passport" }: AccountLinkingTeaserProps) {
  if (!isGuest) {
    return (
      <section className="rounded-xl border border-[#E18868]/10 bg-[#FAF3EE] p-6 text-[#E18868] shadow-sm">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-[#E18868] shadow-sm">
            <CheckCircle size={24} weight="fill" />
          </div>
          <div>
            <h2 className="text-xl font-black text-ink">พาสปอร์ตนี้เชื่อมบัญชีแล้ว</h2>
            <p className="mt-2 text-sm leading-6 text-[#E18868]/80">
              คุณสามารถใช้บัญชีที่เชื่อมไว้เพื่อกู้คืนพาสปอร์ตและตราประทับในอนาคตได้
            </p>
          </div>
        </div>
      </section>
    );
  }

  return <LineLinkPanel context={context} />;
}
