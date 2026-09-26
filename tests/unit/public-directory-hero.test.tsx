import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Link from "next/link";

import { PublicDirectoryHero } from "@/components/public/PublicDirectoryHero";

describe("PublicDirectoryHero", () => {
  it("keeps the destination headline, image and action accessible", () => {
    render(<PublicDirectoryHero
      id="example-hero"
      breadcrumb="สถานที่ท่องเที่ยว"
      eyebrow="EXPLORE YALA"
      title="สถานที่ท่องเที่ยวในจังหวัดยะลา"
      description="สำรวจสถานที่ที่เผยแพร่แล้ว"
      imageUrl="/site-media/homepage/yala-hero-default.webp"
      imageAlt="สถานที่ท่องเที่ยวในยะลา"
      actions={<Link href="/attractions">ดูสถานที่</Link>}
    />);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("สถานที่ท่องเที่ยวในจังหวัดยะลา");
    expect(screen.getByRole("img", { name: "สถานที่ท่องเที่ยวในยะลา" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "ดูสถานที่" })).toHaveAttribute("href", "/attractions");
    expect(screen.getByRole("navigation", { name: "เส้นทางนำทาง" })).toHaveTextContent("สถานที่ท่องเที่ยว");
  });

  it("renders a readable header when no image has been selected", () => {
    render(<PublicDirectoryHero
      id="empty-image-hero"
      breadcrumb="เรื่องราว"
      eyebrow="PEOPLE & STORIES"
      title="เรื่องราวจากพื้นที่"
      description="อ่านเรื่องราวที่เผยแพร่"
    />);

    expect(screen.getByRole("heading", { level: 1, name: "เรื่องราวจากพื้นที่" })).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
