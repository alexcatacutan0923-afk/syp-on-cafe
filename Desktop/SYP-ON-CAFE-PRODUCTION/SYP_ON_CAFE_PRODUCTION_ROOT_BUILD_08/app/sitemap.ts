import type { MetadataRoute } from "next";

const baseUrl = "https://syponcafe.shop";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    { path: "", priority: 1, changeFrequency: "weekly" as const },
    { path: "/menu", priority: 0.95, changeFrequency: "daily" as const },
    { path: "/moments", priority: 0.75, changeFrequency: "weekly" as const },
    { path: "/reviews", priority: 0.75, changeFrequency: "weekly" as const },
    { path: "/about", priority: 0.65, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { path: "/member-register", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/member-login", priority: 0.7, changeFrequency: "monthly" as const },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
    lastModified: new Date(),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
