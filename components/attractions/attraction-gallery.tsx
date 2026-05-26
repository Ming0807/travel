import Image from "next/image";

type AttractionGalleryProps = {
  mainImage: string | null;
  gallery: string[];
};

export function AttractionGallery({ mainImage, gallery }: AttractionGalleryProps) {
  // We expect up to 4 images in the gallery array
  const smallImages = gallery.filter(Boolean).slice(0, 4);

  return (
    <div className="mb-12">
      <div className="grid gap-3 lg:grid-cols-4 lg:grid-rows-2 lg:h-[500px]">
        {/* Main large image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl lg:col-span-4 lg:row-span-1 lg:aspect-auto lg:h-[340px]">
          {mainImage ? (
            <Image
              src={mainImage}
              alt="Main attraction view"
              fill
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-cream px-6 text-center text-sm font-semibold text-muted">
              No public image has been added for this attraction yet.
            </div>
          )}
        </div>

        {/* Small thumbnail images */}
        <div className="hidden grid-cols-4 gap-3 lg:grid lg:col-span-4 lg:row-span-1 lg:h-[148px]">
          {smallImages.map((src, index) => {
            const isLast = index === 3;
            return (
              <div key={index} className="relative h-full w-full overflow-hidden rounded-2xl group cursor-pointer">
                <Image
                  src={src}
                  alt={`Gallery image ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  unoptimized
                />
                {isLast && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ink/40 transition-colors group-hover:bg-ink/50 backdrop-blur-[2px]">
                    <span className="text-sm font-bold text-white">+18 Photos</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
