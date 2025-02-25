import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/carousel/styles.css';
import '../styles.css';

import React from 'react';
import { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import { ColorSchemeScript } from '@mantine/core';
import AppShellWrapper from '@/components/layout/AppShellWrapper/AppShellWrapper';

export const metadata: Metadata = {
  title: 'KalaLog',
  description: 'KalaLog is a fishing diary web application for logging, viewing and analyzing your fishing catches.',
  generator: 'Next.js',
  keywords: ['kala', 'kalalog', 'fishing'],
  creator: 'Akseli Nuutila',
  icons: {
    icon: [
      { url: '/kalalog_icon_round-16.ico', sizes: '16x16', type: 'image/x-icon' },
      { url: '/kalalog_icon_round-48.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/kalalog_icon_gradient-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/kalalog_icon_gradient-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#141414',
};

export default async function RootLayout({ children }: { children: any }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <ColorSchemeScript defaultColorScheme="dark" forceColorScheme="dark" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <AppShellWrapper>{children}</AppShellWrapper>
          <SpeedInsights />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
