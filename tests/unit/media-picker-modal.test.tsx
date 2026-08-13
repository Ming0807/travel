import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";

vi.mock("@/components/admin/media/MediaLibrary", () => ({
  MediaLibrary: () => <div>media library</div>,
}));

describe("MediaPickerModal", () => {
  afterEach(() => {
    document.body.style.overflow = "";
  });

  it("restores the parent drawer scroll lock after closing", () => {
    document.body.style.overflow = "hidden";
    const { rerender } = render(
      <MediaPickerModal isOpen onClose={() => undefined} onSelect={() => undefined} />,
    );

    rerender(
      <MediaPickerModal isOpen={false} onClose={() => undefined} onSelect={() => undefined} />,
    );

    expect(document.body.style.overflow).toBe("hidden");
  });
});
