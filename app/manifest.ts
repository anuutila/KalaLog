import type { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "KalaLog",
    short_name: "kalalog",
    theme_color: "#4dabf7",
    background_color: "#1f1f1f",
    display: "standalone",
    orientation: "portrait",
    scope: "/",
    start_url: "/",
    icons: [
      {
        src: "/kalalog_icon_round-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/kalalog_icon_maskable-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/kalalog_icon_round-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      },
      {
        src: "/kalalog_icon_maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable"
      },
    ],
  }
}
