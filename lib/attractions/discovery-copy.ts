const OUT_OF_SCOPE_COPY = /(?:3\s*จังหวัด|ชายแดนใต้|ปัตตานี|นราธิวาส)/i;
const LEGACY_DEMO_COPY = /^(?:sea of mist aiyerweng|discover the breathtaking views above the clouds\.?|learn more)$/i;

function stripMarkup(value: string) {
  return value
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function launchSafeAttractionsCopy(value: string, fallback: string) {
  const cleanValue = stripMarkup(value);
  return cleanValue
    && !OUT_OF_SCOPE_COPY.test(cleanValue)
    && !LEGACY_DEMO_COPY.test(cleanValue)
    ? cleanValue
    : fallback;
}

export function safeAttractionsBannerHref(value: string) {
  const internalHref = value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/routes";
  return internalHref === "/attractions" ? "/routes" : internalHref;
}
