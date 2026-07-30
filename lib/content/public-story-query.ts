export type PublicStoryAuthorType = "admin" | "tourist";

export type PublicStoryQuery = {
  search?: string;
  province?: string;
  topic?: string;
  authorType?: PublicStoryAuthorType;
  page: number;
  pageSize: number;
};

type RawSearchParams = Record<string, string | string[] | undefined>;

const SAFE_KEY = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SAFE_PROVINCE = /^[A-Za-z][A-Za-z -]{0,49}$/;

function first(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export function parsePublicStorySearchParams(
  params: RawSearchParams
): PublicStoryQuery {
  const search = first(params.q).trim().slice(0, 120);
  const provinceValue = first(params.province).trim();
  const topicValue = first(params.topic).trim().toLowerCase();
  const authorTypeValue = first(params.type).trim();
  const requestedPage = Number.parseInt(first(params.page), 10);

  return {
    search: search || undefined,
    province: SAFE_PROVINCE.test(provinceValue) ? provinceValue : undefined,
    topic: SAFE_KEY.test(topicValue) ? topicValue : undefined,
    authorType:
      authorTypeValue === "admin" || authorTypeValue === "tourist"
        ? authorTypeValue
        : undefined,
    page: Number.isFinite(requestedPage)
      ? Math.min(100, Math.max(1, requestedPage))
      : 1,
    pageSize: 12,
  };
}

export function buildPublicStoryHref(
  current: PublicStoryQuery,
  patch: Partial<PublicStoryQuery>
): string {
  const next: PublicStoryQuery = {
    ...current,
    ...patch,
    page: Object.keys(patch).some((key) => key !== "page")
      ? 1
      : (patch.page ?? current.page),
  };
  const params = new URLSearchParams();
  if (next.search) params.set("q", next.search);
  if (next.province) params.set("province", next.province);
  if (next.topic) params.set("topic", next.topic);
  if (next.authorType) params.set("type", next.authorType);
  if (next.page > 1) params.set("page", String(next.page));
  const query = params.toString();
  return query ? `/stories?${query}` : "/stories";
}
