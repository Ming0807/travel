import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("attraction rich image layout surfaces", () => {
  it("shares responsive image and intentional empty-paragraph styles", () => {
    const globalStyles = readFileSync(resolve(process.cwd(), "app/globals.css"), "utf8");
    const editor = readFileSync(
      resolve(process.cwd(), "components/admin/forms/FormRichText.tsx"),
      "utf8",
    );
    const preview = readFileSync(
      resolve(
        process.cwd(),
        "components/admin/attractions/visual-editor/AttractionVisualEditor.tsx",
      ),
      "utf8",
    );

    expect(globalStyles).toMatch(/\.rich-content-media\s*>\s*p:empty/);
    expect(globalStyles).toMatch(/data-image-size="medium"/);
    expect(globalStyles).toMatch(/data-image-align="right"/);
    expect(globalStyles).toMatch(/@media\s*\(max-width:\s*640px\)/);
    expect(editor).toContain("rich-content-media");
    expect(preview).toContain("rich-content-media");
  });
});
