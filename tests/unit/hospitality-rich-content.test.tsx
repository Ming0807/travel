import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { HospitalityGallery, HospitalityRichContent } from "@/components/hospitality/HospitalityRichContent";

describe("hospitality detail content", () => {
  it("keeps legacy plain descriptions readable", () => {
    render(<HospitalityRichContent content={"บรรยากาศดี\nใกล้วัดหน้าถ้ำ"} />);
    expect(screen.getByText(/บรรยากาศดี/)).toHaveClass("whitespace-pre-line");
  });

  it("renders managed inline images and removes executable markup", () => {
    const { container } = render(<HospitalityRichContent content={'<p>อาหารพื้นถิ่น</p><img src="/site-media/content-media/food.webp" alt="อาหารยะลา" onerror="alert(1)"><script>alert(2)</script>'} />);
    expect(screen.getByText("อาหารพื้นถิ่น")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "อาหารยะลา" })).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
    expect(container.innerHTML).not.toContain("onerror");
  });

  it("shows only additional active gallery images after the hero cover", () => {
    render(<HospitalityGallery images={[
      { url: "/site-media/content-media/cover.webp", alt: "ภาพปก" },
      { url: "/site-media/content-media/dining.webp", alt: "พื้นที่รับประทานอาหาร" },
    ]} />);
    expect(screen.getByRole("heading", { name: "ภาพเพิ่มเติม" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "พื้นที่รับประทานอาหาร" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "ภาพปก" })).not.toBeInTheDocument();
  });
});
