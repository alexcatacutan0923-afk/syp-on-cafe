import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/menu", "/about", "/contact", "/moments", "/reviews", "/member-register", "/member-login"],
      disallow: [
        "/admin",
        "/pos",
        "/kitchen",
        "/rider",
        "/customers",
        "/checkout",
        "/track",
      ],
    },
    sitemap: "https://syponcafe.shop/sitemap.xml",
    host: "https://syponcafe.shop",
  };
}
