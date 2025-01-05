import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '../styles.css';

import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { ColorSchemeScript } from '@mantine/core';
import AppShellWrapper from '@/components/layout/AppShellWrapper/AppShellWrapper';
import { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: "KalaLog",
  description: "KalaLog is a simple web application for logging your fishing catches.",
  generator: "Next.js",
  keywords: ["kala", "kalalog", "fishing"],
  creator: "Akseli Nuutila",
  icons: {
    icon: [
      { url: '/kalalog_icon_round-16.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/kalalog_icon_round-48.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/kalalog_logo-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/kalalog_logo-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#4dabf7',
}

export default function RootLayout({ children }: { children: any }) {
  return (
    <html lang="fi" suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" forceColorScheme="dark" />
      </head>
      <body>
        <AppShellWrapper>
          {children}
        </AppShellWrapper>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
