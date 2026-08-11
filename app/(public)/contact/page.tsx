import type { Metadata } from "next";
import { ContactPageClient } from "@/components/contact/ContactPageClient";
import { SiteFooter } from "@/components/layout/SiteFooter";

export const metadata: Metadata = {
  title: "ติดต่อโครงการ | แพลตฟอร์มข้อมูลท่องเที่ยวยะลา",
  description: "แจ้งปัญหาการใช้งาน เสนอแก้ไขข้อมูลสถานที่ หรือสอบถามความร่วมมือกับโครงการนำร่องยะลา",
};

export default function ContactPage() {
  return (
    <>
      <ContactPageClient />
      <SiteFooter />
    </>
  );
}
