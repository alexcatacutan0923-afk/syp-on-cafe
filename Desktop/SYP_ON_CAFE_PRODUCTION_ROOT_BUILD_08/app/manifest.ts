import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SYP ON CAFÉ",
    short_name: "SYP CAFÉ",
    description:
      "Coffee, matcha, milky drinks, soda, fries, delivery, and digital rewards in Apollo, Orani, Bataan.",
    start_url: "/",
    display: "standalone",
    background_color: "#050706",
    theme_color: "#050706",
    orientation: "portrait-primary",
    categories: ["food", "shopping", "lifestyle"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
