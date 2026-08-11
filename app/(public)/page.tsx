import type { Metadata } from "next";
import { Homepage } from "@/components/homepage/homepage";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ท่องเที่ยวยะลา | ค้นพบสถานที่ เรื่องราว และเส้นทาง",
  description: "ค้นพบสถานที่ท่องเที่ยว เรื่องราว และเส้นทางในจังหวัดยะลา พร้อมบันทึกการเดินทางและสะสมความทรงจำดิจิทัล",
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return <Homepage />;
}
