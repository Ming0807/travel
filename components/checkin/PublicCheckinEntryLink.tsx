import type { AnchorHTMLAttributes } from "react";

type PublicCheckinEntryLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export function PublicCheckinEntryLink(props: PublicCheckinEntryLinkProps) {
  // A hard navigation mirrors a physical QR scan and avoids prefetching the session-creating redirect chain.
  // eslint-disable-next-line @next/next/no-html-link-for-pages
  return <a {...props} href="/checkin/try" />;
}
