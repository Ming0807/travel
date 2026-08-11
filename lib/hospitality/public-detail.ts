export type HospitalityAction = {
  kind: "phone" | "website" | "map";
  href: string;
};

type HospitalityActionInput = {
  contactInfo: string | null;
  latitude: number | null;
  longitude: number | null;
};

function phoneHref(value: string): string | null {
  if (!/^[+\d][\d\s().-]{6,24}$/.test(value)) return null;
  const prefix = value.trim().startsWith("+") ? "+" : "";
  const digits = value.replace(/\D/g, "");
  if (digits.length < 7 || digits.length > 15) return null;
  return `tel:${prefix}${digits}`;
}

function websiteHref(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

function hasValidCoordinates(latitude: number | null, longitude: number | null) {
  return typeof latitude === "number"
    && Number.isFinite(latitude)
    && latitude >= -90
    && latitude <= 90
    && typeof longitude === "number"
    && Number.isFinite(longitude)
    && longitude >= -180
    && longitude <= 180;
}

export function buildHospitalityActions({
  contactInfo,
  latitude,
  longitude,
}: HospitalityActionInput): HospitalityAction[] {
  const actions: HospitalityAction[] = [];
  const contact = contactInfo?.trim() ?? "";

  if (contact) {
    const phone = phoneHref(contact);
    const website = websiteHref(contact);
    if (phone) actions.push({ kind: "phone", href: phone });
    else if (website) actions.push({ kind: "website", href: website });
  }

  if (hasValidCoordinates(latitude, longitude)) {
    const query = encodeURIComponent(`${latitude},${longitude}`);
    actions.push({
      kind: "map",
      href: `https://www.google.com/maps/search/?api=1&query=${query}`,
    });
  }

  return actions;
}
