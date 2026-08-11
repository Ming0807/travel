export function PublicRouteLoading({ detail = false }: { detail?: boolean }) {
  return (
    <div className="animate-pulse" aria-label="กำลังโหลดข้อมูลเส้นทาง">
      <div className="h-4 w-36 bg-black/10" />
      <div className="mt-8 h-10 w-3/4 max-w-2xl bg-black/10" />
      <div className="mt-4 h-5 w-full max-w-3xl bg-black/10" />
      <div className="mt-8 aspect-[4/3] w-full bg-black/10 sm:aspect-[2/1] lg:aspect-[16/7]" />
      <div className={`mt-8 grid gap-5 ${detail ? "lg:grid-cols-[minmax(0,1fr)_300px]" : "md:grid-cols-2 xl:grid-cols-3"}`}>
        {Array.from({ length: detail ? 3 : 6 }, (_, index) => (
          <div key={index} className="h-48 border border-black/10 bg-white" />
        ))}
      </div>
    </div>
  );
}
