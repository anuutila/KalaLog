import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'KalaLog',
    short_name: 'KalaLog',
    theme_color: '#141414',
    background_color: '#080808',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    start_url: '/catches',
    icons: [
      {
        src: '/kalalog_icon_round_gradient-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/kalalog_icon_maskable_gradient-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/kalalog_icon_round_gradient-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/kalalog_icon_maskable_gradient-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
