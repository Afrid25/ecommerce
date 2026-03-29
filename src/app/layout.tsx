import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Toaster from "@/components/Toaster";
import BottomNav from "@/components/BottomNav";
import ThemeProvider from "@/theme/ThemeProvider";

export const metadata: Metadata = {
  title: "MATVerse | Eco-Friendly Modern Commerce",
  description: "MATVerse is a production-ready eco-friendly commerce experience for curated home, lifestyle, fashion, and tech essentials.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        <ThemeProvider>
          <Navbar />
          <main className="min-h-screen pb-16 md:pb-0">{children}</main>
          <Footer />
          <BottomNav />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
