import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { FormRichText } from "@/components/admin/forms/FormRichText";

vi.mock("@/components/admin/media/MediaPickerModal", () => ({
  MediaPickerModal: ({
    isOpen,
    onSelectAsset,
  }: {
    isOpen: boolean;
    onSelectAsset?: (asset: {
      id: string;
      url: string;
      file_name: string;
      storage_path: string;
      mime_type: string;
      category: string;
    }) => void;
  }) =>
    isOpen ? (
      <button
        type="button"
        onClick={() =>
          onSelectAsset?.({
            id: "f04a9a4e-4e2a-4f7f-9fb5-000000000042",
            url: "/site-media/stories/pattani.webp",
            file_name: "pattani.webp",
            storage_path: "stories/pattani.webp",
            mime_type: "image/webp",
            category: "Stories",
          })
        }
      >
        เลือกรูปทดสอบ
      </button>
    ) : null,
}));

describe("FormRichText managed media insertion", () => {
  beforeAll(() => {
    Object.defineProperty(document, "elementFromPoint", {
      configurable: true,
      value: vi.fn(() => document.body),
    });
  });

  it("inserts a selected Media Library asset with required alt text into canonical JSON", async () => {
    const onValueChange = vi.fn();
    render(
      <FormRichText
        label="เนื้อหา"
        name="content"
        documentName="contentDocument"
        imageLayoutControls
        onValueChange={onValueChange}
      />,
    );

    await userEvent.click(
      await screen.findByRole("button", { name: "แทรกรูปจากคลังสื่อ" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "เลือกรูปทดสอบ" }),
    );
    await userEvent.type(
      screen.getByLabelText("คำอธิบายรูปภาพ"),
      "มัสยิดกลางปัตตานียามเย็น",
    );
    await userEvent.click(screen.getByRole("button", { name: "ขนาดกลาง" }));
    await userEvent.click(screen.getByRole("button", { name: "ชิดขวา" }));
    await userEvent.click(screen.getByRole("button", { name: "แทรกรูปภาพ" }));

    await waitFor(() =>
      expect(onValueChange).toHaveBeenCalledWith(
        expect.objectContaining({
          document: expect.objectContaining({
            version: 2,
            content: expect.arrayContaining([
              expect.objectContaining({
                type: "image",
                attrs: expect.objectContaining({
                  assetId: "f04a9a4e-4e2a-4f7f-9fb5-000000000042",
                  storagePath: "stories/pattani.webp",
                  alt: "มัสยิดกลางปัตตานียามเย็น",
                }),
              }),
            ]),
          }),
        }),
      ),
    );

    await waitFor(() => {
      const htmlCalls = onValueChange.mock.calls
        .map(([value]) => value.html as string)
        .filter(Boolean);
      expect(htmlCalls.some((html) => html.includes('data-image-size="medium"'))).toBe(true);
      expect(htmlCalls.some((html) => html.includes('data-image-align="right"'))).toBe(true);
      expect(htmlCalls.some((html) => html.includes("<p></p>"))).toBe(true);
    });
  });

  it("updates the layout of an existing selected image", async () => {
    const onValueChange = vi.fn();
    render(
      <FormRichText
        label="เนื้อหา"
        name="content"
        defaultValue={'<img src="/site-media/stories/pattani.webp" alt="รูปเดิม" data-asset-id="f04a9a4e-4e2a-4f7f-9fb5-000000000042" data-storage-path="stories/pattani.webp" data-image-size="full" data-image-align="center"><p></p>'}
        imageLayoutControls
        onValueChange={onValueChange}
      />,
    );

    await userEvent.click(await screen.findByRole("img", { name: "รูปเดิม" }));
    await userEvent.click(await screen.findByRole("button", { name: "ขนาดกลาง" }));
    await userEvent.click(screen.getByRole("button", { name: "ชิดขวา" }));

    await waitFor(() => {
      const htmlCalls = onValueChange.mock.calls
        .map(([value]) => value.html as string)
        .filter(Boolean);
      expect(htmlCalls.some((html) => html.includes('data-image-size="medium"'))).toBe(true);
      expect(htmlCalls.some((html) => html.includes('data-image-align="right"'))).toBe(true);
    });
  });
});
