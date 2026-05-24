import type { Metadata, Viewport } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { WhatsAppDirect } from "@/components/whatsapp-direct";
import { SpeedInsights } from '@vercel/speed-insights/next';

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

// SEO Metadata Configuration
export const metadata: Metadata = {
  metadataBase: new URL('https://prisma-rt04.vercel.app'), // Replace with your actual domain
  title: {
    default: "PRISMA RT 04 Kemayoran - Sistem Warga Digital",
    template: "%s | PRISMA RT 04"
  },
  description: "Website resmi RT 04/RW 09 Kemayoran. Layanan surat pengantar online, transparansi keuangan, dan pengaduan warga 24 jam.",
  keywords: ["RT 04 Kemayoran", "Surat Pengantar Online", "Layanan Warga Jakarta Pusat", "Sistem RT Digital", "PRISMA Kemayoran", "Smart City Jakarta"],
  openGraph: {
    title: "PRISMA RT 04 Kemayoran",
    description: "Sistem Manajemen Digital RT 04/RW 09 Kemayoran. Transparansi & Pelayanan dalam genggaman.",
    url: 'https://prisma-rt04.vercel.app',
    siteName: 'PRISMA RT 04',
    type: 'website',
    locale: 'id_ID',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

// JSON-LD for Local Government Service
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "GovernmentService",
  "name": "Sekretariat RT 04 RW 09 Kemayoran",
  "alternateName": "PRISMA RT 04",
  "url": "https://prisma-rt04.vercel.app",
  "image": "https://prisma-rt04.vercel.app/og-image.jpg", // Placeholder
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Gg. Bugis No.95",
    "addressLocality": "Kemayoran",
    "addressRegion": "Jakarta Pusat",
    "postalCode": "10620",
    "addressCountry": "ID"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -6.1618,
    "longitude": 106.8456
  },
  "openingHours": "Mo-Su 08:00-20:00",
  "telephone": "+6287872004448",
  "areaServed": "RT 04 RW 09 Kemayoran"
};

// Chatbot removed

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${geistMono.variable} font-sans antialiased min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        {/* Skip to Content - WCAG 2.1 AA Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg focus:text-sm focus:font-medium focus:shadow-lg focus:outline-none"
        >
          Langsung ke konten utama
        </a>
        <Script
          src="/sql-wasm.js"
          strategy="beforeInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Navbar />
            <main id="main-content" className="flex-1" role="main">
              {children}
            </main>
            <PWAInstallPrompt />
            <WhatsAppDirect />
            <Footer />
          </AuthProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
