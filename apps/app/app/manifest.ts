import type { MetadataRoute } from "next";
import { BRAND_NAME } from "@irossini/core";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND_NAME,
    short_name: BRAND_NAME,
    description: "Puntos y beneficios en tu red de estaciones de servicio.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#78BE20",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
