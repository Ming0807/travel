export function plainTextFromLegacyHtml(value: string): string {
  let result = value;
  for (let pass = 0; pass < 3; pass += 1) {
    const previous = result;
    result = result
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#x27;/gi, "'")
      .replace(/&#(\d+);/g, (_match, digits: string) =>
        String.fromCodePoint(Number(digits))
      )
      .replace(/&#x([\da-f]+);/gi, (_match, hex: string) =>
        String.fromCodePoint(Number.parseInt(hex, 16))
      );
    if (result === previous) break;
  }

  return result
    .replace(/<br\b[^>]*\/?>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
