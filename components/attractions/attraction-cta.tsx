import Image from "next/image";

type AttractionCTAProps = {
  name: string;
};

export function AttractionCTA({ name }: AttractionCTAProps) {
  return (
    <div className="relative mt-16 overflow-hidden rounded-[2rem] bg-ink px-6 py-16 text-center text-white shadow-xl sm:px-12 sm:py-20 lg:mt-24">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1542640244-7e672d6cb466?auto=format&fit=crop&w=1600&q=80"
          alt="CTA Background"
          fill
          className="object-cover opacity-40"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/80 to-transparent"></div>
      </div>
      
      <div className="relative z-10 mx-auto max-w-2xl">
        <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to Explore {name}?
        </h2>
        <p className="mb-8 text-base font-medium text-white/80 sm:text-lg">
          Plan your unforgettable journey today and experience the beauty of the Southern Border.
        </p>
        <button className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-ink shadow-lg hover:bg-cream transition-colors">
          Plan your trip
        </button>
      </div>
    </div>
  );
}
