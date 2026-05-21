import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { LineLinkPanel } from "@/components/account/LineLinkPanel";

type AccountLinkingTeaserProps = {
  isGuest?: boolean;
  context?: "certificate" | "passport" | "profile";
};

export function AccountLinkingTeaser({ isGuest = true, context = "passport" }: AccountLinkingTeaserProps) {
  if (!isGuest) {
    return (
      <section className="rounded-[1.75rem] border border-teal/10 bg-tealSoft p-5 text-teal shadow-card">
        <div className="flex items-start gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-teal">
            <CheckCircle size={22} weight="fill" />
          </div>
          <div>
            <h2 className="text-lg font-black text-ink">พาสปอร์ตนี้เชื่อมบัญชีแล้ว</h2>
            <p className="mt-2 text-sm leading-6 text-teal">
              คุณสามารถใช้บัญชีที่เชื่อมไว้เพื่อกู้คืนพาสปอร์ตและตราประทับในอนาคตได้
            </p>
          </div>
        </div>
      </section>
    );
  }

  return <LineLinkPanel context={context} />;
}
