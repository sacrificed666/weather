import type { MetadataRoute } from "next";

import { en } from "@/shared/i18n/messages/en";
import { SITE } from "@/shared/lib/site";

// Web app manifest with the name, colours and icons
const manifest = (): MetadataRoute.Manifest => ({
  id: "/",
  name: en["app.name"],
  short_name: en["app.name"],
  description: en["app.description"],
  lang: "en",
  start_url: "/",
  scope: "/",
  display: "standalone",
  background_color: SITE.themeColor.dark,
  theme_color: SITE.themeColor.dark,
  categories: ["weather", "utilities"],
  icons: [
    { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/pwa/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    { src: "/apple-icon", sizes: "180x180", type: "image/png" },
  ],
});

export default manifest;
