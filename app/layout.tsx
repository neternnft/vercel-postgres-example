import React from 'react';
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from './providers/Providers';

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: {
    template: '%s | Glurbnok',
    default: 'Glurbnok',
  },
  description: "Created by @Glurbnok",
  metadataBase: new URL('https://your-domain.com'),
  openGraph: {
    title: 'Glurbnok',
    description: 'Created by @Glurbnok',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glurbnok',
    description: 'Created by @Glurbnok',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
