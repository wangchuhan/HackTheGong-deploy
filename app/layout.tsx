import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import PointsToast from "@/components/PointsToast";
import CelebrationModal from "@/components/CelebrationModal";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VapeSafe — Wollongong",
  description:
    "Report vape litter, find disposal points, and earn rewards. HackTheGong civic demo.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "VapeSafe" },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pb-20">
        <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
          <PageTransition>{children}</PageTransition>
        </main>
        <Footer />
        <Nav />
        <PointsToast />
        <CelebrationModal />
      </body>
    </html>
  );
}
