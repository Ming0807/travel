import "server-only";

import sanitizeHtml from "sanitize-html";
import {
  isPublicContentMediaReference,
  normalizeSiteMediaStoragePath,
  siteMediaImageUrl,
} from "@/lib/media/storage-paths";
import {
  normalizeRichImageAlign,
  normalizeRichImageSize,
} from "@/lib/content/rich-image-layout";

function managedImageUrl(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;

  if (isPublicContentMediaReference(value)) {
    return siteMediaImageUrl(value);
  }

  if (value.startsWith("/api/media/image")) {
    try {
      const url = new URL(value, "https://content.local");
      if (url.pathname !== "/api/media/image") return null;
      const path = url.searchParams.get("path");
      return path && isPublicContentMediaReference(path)
        ? siteMediaImageUrl(path)
        : null;
    } catch {
      return null;
    }
  }

  try {
    return siteMediaImageUrl(normalizeSiteMediaStoragePath(value));
  } catch {
    return null;
  }
}

function safeLinkHref(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//")) return value;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export function sanitizeAdminRichHtml(value: string | null | undefined): string {
  const source = value?.trim();
  if (!source) return "";

  return sanitizeHtml(source, {
    allowedTags: [
      "p",
      "h2",
      "h3",
      "h4",
      "ul",
      "ol",
      "li",
      "blockquote",
      "strong",
      "b",
      "em",
      "i",
      "s",
      "code",
      "br",
      "hr",
      "a",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: [
        "src",
        "alt",
        "title",
        "data-asset-id",
        "data-storage-path",
        "data-caption",
        "data-image-size",
        "data-image-align",
        "loading",
        "decoding",
      ],
    },
    allowedSchemes: ["http", "https"],
    allowProtocolRelative: false,
    disallowedTagsMode: "discard",
    transformTags: {
      a: (_tagName, attribs) => {
        const href = safeLinkHref(attribs.href);
        if (!href) return { tagName: "span", attribs: {} };
        const opensNewTab = attribs.target === "_blank";
        return {
          tagName: "a",
          attribs: {
            href,
            ...(opensNewTab
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {}),
          },
        };
      },
      img: (_tagName, attribs) => {
        const src =
          managedImageUrl(attribs["data-storage-path"]) ??
          managedImageUrl(attribs.src);
        if (!src) return { tagName: "span", attribs: {} };

        return {
          tagName: "img",
          attribs: {
            src,
            alt: attribs.alt?.trim() ?? "",
            ...(attribs.title ? { title: attribs.title } : {}),
            ...(attribs["data-asset-id"]
              ? { "data-asset-id": attribs["data-asset-id"] }
              : {}),
            ...(attribs["data-storage-path"]
              ? { "data-storage-path": attribs["data-storage-path"] }
              : {}),
            ...(attribs["data-caption"]
              ? { "data-caption": attribs["data-caption"] }
              : {}),
            "data-image-size": normalizeRichImageSize(
              attribs["data-image-size"],
            ),
            "data-image-align": normalizeRichImageAlign(
              attribs["data-image-align"],
            ),
            loading: "lazy",
            decoding: "async",
          },
        };
      },
    },
  });
}
