import { PublicCtaBand } from "@/components/public/PublicCtaBand";

export function AttractionDiscoveryCta({
  title,
  subtitle,
  linkText,
  linkUrl,
  image,
}: {
  title: string;
  subtitle: string;
  linkText: string;
  linkUrl: string;
  image: string;
}) {
  return (
    <PublicCtaBand
      title={title}
      description={subtitle}
      linkText={linkText}
      linkUrl={linkUrl}
      image={image}
    />
  );
}
