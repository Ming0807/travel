import { CheckCircle } from "@phosphor-icons/react/dist/ssr";
import { LineLinkPanel } from "@/components/account/LineLinkPanel";

type AccountLinkingTeaserProps = {
  isGuest?: boolean;
  context?: "certificate" | "passport" | "profile";
};

export function AccountLinkingTeaser({ isGuest = true, context = "passport" }: AccountLinkingTeaserProps) {
  if (!isGuest) {
    return (
      <section className="rounded-2xl border border-teal/10 bg-teal/5 p-6 sm:p-8">
        <div className="flex items-start gap-5">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal text-white">
            <CheckCircle size={24} weight="fill" />
          </div>
          <div>
            <h2 className="text-xl font-black text-ink">พาสปอร์ตนี้ถูกเชื่อมโยงบัญชีแล้ว</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              ข้อมูลประวัติการเดินทางและตราประทับของคุณถูกบันทึกไว้อย่างปลอดภัย สามารถลงชื่อเข้าใช้บนอุปกรณ์อื่นเพื่อเรียกดูพาสปอร์ตของคุณได้ทันที
            </p>
          </div>
        </div>
      </section>
    );
  }

  return <LineLinkPanel context={context} />;
}
