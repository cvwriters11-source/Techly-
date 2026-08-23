import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://techly.co.za";
  const routes = [
    "",
    "/about",
    "/services",
    "/services/software-development",
    "/services/it-support",
    "/services/business-automation",
    "/approach",
    "/profile",
    "/contact",
    "/ticket",
  ];

  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
  }));
}
