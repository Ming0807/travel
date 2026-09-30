import { renderToString } from "react-dom/server";
import { HomepageEditorial } from "@/components/homepage/HomepageEditorial";
import { data } from "./data";

export function render() { return renderToString(<HomepageEditorial {...data} />); }
