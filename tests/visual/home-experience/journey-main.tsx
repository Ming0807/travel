import { createRoot } from "react-dom/client";
import { PassportFixture, RouteFixture } from "./passport-fixture";
import "@/app/globals.css";
import "../dashboard/fixture-fonts.css";

const params = new URLSearchParams(location.search);
createRoot(document.getElementById("root")!).render(params.has("routes") ? <RouteFixture params={params} /> : <PassportFixture params={params} />);
