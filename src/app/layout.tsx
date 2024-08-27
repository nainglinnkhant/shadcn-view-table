import { Analytics } from "@vercel/analytics/react"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"
import { SiteHeader } from "@/components/layouts/site-header"
import { ThemeProvider } from "@/components/providers"
import { TailwindIndicator } from "@/components/tailwind-indicator"

import "@/styles/globals.css"

import type { Metadata, Viewport } from "next"

import { fontMono, fontSans } from "@/lib/fonts"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "nextjs",
    "react",
    "react server components",
    "table",
    "react-table",
    "tanstack-table",
    "shadcn-table",
    "shadcn-view-table",
  ],
  authors: [
    {
      name: "sadmann7",
      url: "https://www.sadmn.com",
    },
    {
      name: "nainglinnkhant",
      url: "https://nainglinnkhant.com",
    },
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [`${siteConfig.url}/og.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@nainglk",
    images: [`${siteConfig.url}/og.png`],
  },
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/favicon-light.svg",
        href: "/favicon-light.svg",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/favicon-dark.svg",
        href: "/favicon-dark.svg",
      },
    ],
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
}

export const viewport: Viewport = {
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({ children }: React.PropsWithChildren) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
          fontMono.variable
        )}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <main className="flex-1">{children}</main>
          </div>
          <TailwindIndicator />
        </ThemeProvider>
        <Toaster richColors />
        <Analytics />
      </body>
    </html>
  )
}
