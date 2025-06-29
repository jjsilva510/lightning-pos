import type React from 'react';
import type { Metadata } from 'next';
import type { Viewport } from 'next/types'; // <-- ADD THIS IMPORT
import Script from 'next/script';

import { Space_Mono } from 'next/font/google';

import { InjectedNFCProvider } from '@/context/injected-nfc';

import { Toaster } from '@/components/ui/toaster';

import './globals.css';

// Define Space Mono as the primary font
const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono',
});

// Define Viewport here
export const viewport: Viewport = { // <-- ADD THIS EXPORT BLOCK
  themeColor: '#0F0F0F',
  // You might want to define other viewport properties here, e.g.:
  // width: 'device-width',
  // initialScale: 1,
  // userScalable: 'no',
};

export const metadata: Metadata = {
  title: 'Lightning PoS',
  description: 'Point of Sale System with Lightning Network',
  manifest: '/manifest.json',
  // themeColor: '#0F0F0F', // <-- REMOVE THIS LINE from here
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'POS',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Lightning PoS',
    title: 'Lightning PoS',
    description: 'Point of Sale System with Lightning Network',
  },
  icons: {
    shortcut: '/iso-white.svg?height=32&width=32',
    apple: [
      {
        url: '/iso-white.svg?height=180&width=180',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang='en'>
      <head>
        <meta name='application-name' content='Lightning PoS' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='Lightning PoS' />
        <meta name='format-detection' content='telephone=no' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='msapplication-config' content='/browserconfig.xml' />
        <meta name='msapplication-TileColor' content='#0F0F0F' />
        <meta name='msapplication-tap-highlight' content='no' />
        {/* If you add `themeColor` to `viewport` export, you can remove this duplicate meta tag too. */}
        <meta name='theme-color' content='#0F0F0F' />
        {/* If you add `width`, `initialScale`, `userScalable` to `viewport` export, you can remove this too. */}
        <meta name='viewport' content='width=device-width, initial-scale=1, user-scalable=no' />

        <link rel='apple-touch-icon' href='/iso.svg?height=180&width=180' />
        <link rel='icon' type='image/svg+xml' href='/iso-white.svg?height=32&width=32' />
        <link rel='manifest' href='/manifest.json' />
        <link rel='shortcut icon' href='/iso.svg?height=32&width=32' />

        <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}`} />
        <Script id='google-analytics'>
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_TAG_ID}');
          `}
        </Script>
      </head>
      <body className={`flex flex-col min-h-[100dvh] ${spaceMono.className} select-none`}>
        <InjectedNFCProvider>{children}</InjectedNFCProvider>
        <Toaster />
        {/* The commented-out service worker script is fine and not the cause. */}
      </body>
    </html>
  );
}