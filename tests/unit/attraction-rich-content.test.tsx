import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AttractionRichContent } from "@/components/attractions/AttractionRichContent";
import { sanitizeAdminRichHtml } from "@/lib/content/admin-rich-html";
import {
  normalizeRichImageAlign,
  normalizeRichImageSize,
} from "@/lib/content/rich-image-layout";

describe("attraction rich content", () => {
  it("renders Tiptap paragraphs and managed images instead of visible HTML source", () => {
    const html = `
      <p>วัดคูหาภิมุข <strong>วัดหน้าถ้ำ</strong></p>
      <img
        src="/site-media/general/8e9ed4f3-774e-4973-a5ff-529cc9cc367f.webp"
        alt="พระพุทธรูปภายในถ้ำ"
        data-asset-id="8e9ed4f3-774e-4973-a5ff-529cc9cc367f"
      />
    `;

    const { container } = render(<AttractionRichContent html={html} />);

    expect(container.textContent).toContain("วัดคูหาภิมุข วัดหน้าถ้ำ");
    expect(container.textContent).not.toContain("<p>");
    expect(container.querySelector("strong")?.textContent).toBe("วัดหน้าถ้ำ");
    expect(container.querySelector("img")).toMatchObject({
      alt: "พระพุทธรูปภายในถ้ำ",
    });
  });

  it("removes executable markup, event handlers, unsafe links, and external images", () => {
    const result = sanitizeAdminRichHtml(`
      <script>alert(1)</script>
      <p onclick="alert(2)">เนื้อหาปลอดภัย</p>
      <a href="javascript:alert(3)" target="_blank">ลิงก์อันตราย</a>
      <img src="https://tracker.example/pixel.png" onerror="alert(4)" alt="tracker" />
    `);

    expect(result).not.toMatch(/script|onclick|javascript:|onerror|tracker\.example/i);
    expect(result).toContain("เนื้อหาปลอดภัย");
    expect(result).toContain("ลิงก์อันตราย");
  });

  it("preserves validated image layout and defaults invalid legacy values", () => {
    const html = `
      <img
        src="/site-media/general/first.webp"
        alt="รูปแรก"
        data-image-size="medium"
        data-image-align="right"
      />
      <p></p>
      <img
        src="/site-media/general/second.webp"
        alt="รูปที่สอง"
        data-image-size="oversized"
        data-image-align="floating"
      />
    `;

    const { container } = render(<AttractionRichContent html={html} />);
    const images = container.querySelectorAll("img");

    expect(container.firstElementChild).toHaveClass("rich-content-media");
    expect(container.querySelector("p:empty")).not.toBeNull();
    expect(images[0]).toHaveAttribute("data-image-size", "medium");
    expect(images[0]).toHaveAttribute("data-image-align", "right");
    expect(images[1]).toHaveAttribute("data-image-size", "full");
    expect(images[1]).toHaveAttribute("data-image-align", "center");
  });

  it("normalizes the image layout contract", () => {
    expect(normalizeRichImageSize("small")).toBe("small");
    expect(normalizeRichImageSize("invalid")).toBe("full");
    expect(normalizeRichImageAlign("left")).toBe("left");
    expect(normalizeRichImageAlign(null)).toBe("center");
  });
});
