import { createRoot } from "react-dom/client";
import { HomepageEditorial } from "@/components/homepage/HomepageEditorial";
import { HomepageLoading } from "@/components/homepage/HomepageLoading";
import { data } from "./data";
import "@/app/globals.css";
import "../dashboard/fixture-fonts.css";
import "@/components/homepage/homepage-editorial.css";

createRoot(document.getElementById("root")!).render(new URLSearchParams(location.search).has("loading") ? <HomepageLoading hero /> : <HomepageEditorial {...data} />);
