export function HomepageLoading({ hero = false }: { hero?: boolean }) {
  return <div className="home-editorial ed-home-loading" role="status" aria-label="กำลังเตรียมข้อมูลท่องเที่ยว">
    {hero ? <div className="ed-loading-hero"><div className="ed-container"><span className="ed-loading-line" /><span className="ed-loading-title" /><span className="ed-loading-title" /><span className="ed-loading-line" /><span className="ed-loading-button" /></div></div> : null}
    <div className="ed-container ed-loading-discovery"><span className="ed-loading-title" /><div className="ed-loading-categories">{Array.from({ length: 5 }, (_, index) => <div key={index}><span className="ed-loading-arch" /><span className="ed-loading-line" /></div>)}</div></div>
    <span className="sr-only">กำลังโหลดสถานที่และเส้นทางท่องเที่ยว</span>
  </div>;
}
