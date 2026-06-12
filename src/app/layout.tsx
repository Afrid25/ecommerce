import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Toaster from "@/components/Toaster";
import MobileBottomNav from "@/components/MobileBottomNav";
import SupportChat from "@/components/SupportChat";
import { getSiteSettings } from "@/lib/commerce";
import { defaultSiteSettings } from "@/lib/matverse-data";
import { buildSiteThemeVariables } from "@/lib/theme";
import ThemeProvider from "@/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "MATVerse | Online Marketplace",
  description: "MATVerse is a general ecommerce marketplace for electronics, fashion, grocery, home, beauty, sports, baby products, eco-friendly picks, and more.",
  icons: {
    icon: "/logo.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteSettings = await getSiteSettings().catch(() => ({ id: 1, ...defaultSiteSettings }));
  const themeStyle = buildSiteThemeVariables(siteSettings);

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={themeStyle}
        className="min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased"
      >
        <ThemeProvider>
          <Navbar />
          <main className="min-h-screen pb-20 lg:pb-0">{children}</main>
          <Footer />
          <SupportChat />
          <MobileBottomNav />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
