import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site.url;
  const routes = [
    "",
    "/about",
    "/services",
    "/services/software-development",
    "/services/it-support",
    "/services/business-automation",
    "/services/cctv-installations",
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
