import { createRoot } from "react-dom/client";
import { HomepageEditorial } from "@/components/homepage/HomepageEditorial";
import { HomepageLoading } from "@/components/homepage/HomepageLoading";
import { LeaderboardContent } from "@/components/badges/LeaderboardContent";
import { LeaderboardLoading, LeaderboardPageShell } from "@/components/badges/LeaderboardPageShell";
import { data } from "./data";
import "@/app/globals.css";
import "../dashboard/fixture-fonts.css";
import "@/components/homepage/homepage-editorial.css";

const params = new URLSearchParams(location.search);
const entries = ["นักเดินทางสายหมอก", "นักเดินทางชื่อยาวมากสำหรับตรวจการแสดงผลบนมือถือและแท็บเล็ต", "เส้นทางชุมชน", "นักเดินทาง 04"].map((publicName, index) => ({ rank: index + 1, publicName, totalXp: 10000 - index * 500, stampCount: 12 - index, badgeCount: 5 - index, level: 6 - index, isCurrentTourist: index === 1 }));
const leaderboard = <LeaderboardPageShell>{params.has("loading") ? <LeaderboardLoading /> : <LeaderboardContent allTime={params.has("empty") ? [] : entries} monthly={[]} weekly={[]} currentVisibility={params.has("private") ? "private" : "alias"} availability={params.has("error") ? "service" : "ready"} />}</LeaderboardPageShell>;
createRoot(document.getElementById("root")!).render(params.has("leaderboard") ? leaderboard : params.has("loading") ? <HomepageLoading hero /> : <HomepageEditorial {...data} />);
