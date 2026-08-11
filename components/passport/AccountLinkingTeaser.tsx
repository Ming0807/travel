import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { LineLinkPanel } from "@/components/account/LineLinkPanel";

type AccountLinkingTeaserProps = {
  isGuest?: boolean;
  context?: "certificate" | "passport" | "profile";
};

export function AccountLinkingTeaser({ isGuest = true, context = "passport" }: AccountLinkingTeaserProps) {
  if (!isGuest) {
    return (
      <section className="rounded-lg border border-teal/20 bg-teal/[0.06] p-5 sm:p-6">
        <div className="flex items-start gap-5">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-teal text-white">
            <CheckCircle size={24} weight="fill" />
          </div>
          <div>
            <h2 className="text-xl font-black text-ink">พาสปอร์ตนี้ถูกเชื่อมโยงบัญชีแล้ว</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              ตราประทับและพาสปอร์ตนี้เชื่อมกับบัญชีของคุณแล้ว จึงค้นคืนได้เมื่อเข้าสู่ระบบบนอุปกรณ์อื่น
            </p>
          </div>
        </div>
      </section>
    );
  }

  return <LineLinkPanel context={context} />;
}
