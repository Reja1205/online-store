import "./globals.css";
import AppShell from "./components/AppShell";
import SiteFooter from "./components/SiteFooter";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "./lib/site";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f8fafc",
};

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full scroll-smooth" suppressHydrationWarning>
      <body
        className="min-h-screen bg-[var(--color-bg)] text-slate-900 antialiased"
        suppressHydrationWarning
      >
        <AppShell>{children}</AppShell>
        <SiteFooter />
      </body>
    </html>
  );
}
