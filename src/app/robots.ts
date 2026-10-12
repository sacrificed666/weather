import type { MetadataRoute } from "next";

import { isIndexable, siteUrl } from "@/shared/lib/site";

// Robots rules: open on the indexable site, closed on every other deployment
const robots = (): MetadataRoute.Robots => {
  const base = siteUrl();
  if (!isIndexable()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: new URL("/sitemap.xml", base).href,
    host: base.origin,
  };
};

export default robots;
