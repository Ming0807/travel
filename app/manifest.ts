import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Southern Border Travel Passport",
    short_name: "Travel Passport",
    description: "Reward-first tourism participation platform for Southern Border travel planning.",
    start_url: "/",
    display: "standalone",
    background_color: "#EEF6F2",
    theme_color: "#073F37"
  };
}
