import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Kalogirou Team | DJ Εύβοια | Γάμοι • Βαπτίσεις • Parties • Events",
  description:
    "Kalogirou Team - Επαγγελματίας DJ στην Εύβοια για γάμους, βαπτίσεις, parties, live events, ηχητικό εξοπλισμό, φωτισμό και special effects. Αυλωνάρι Εύβοιας και γύρω περιοχές.",
  keywords: [
    "DJ Εύβοια",
    "DJ Αυλωνάρι",
    "DJ γάμος Εύβοια",
    "DJ βάπτιση Εύβοια",
    "DJ party Εύβοια",
    "ηχητικός εξοπλισμός Εύβοια",
    "φωτισμός εκδηλώσεων Εύβοια",
    "Kalogirou Team",
    "DJ Greece",
  ],
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    title: "Kalogirou Team | DJ Εύβοια",
    description:
      "DJ services για γάμους, βαπτίσεις, parties και events στην Εύβοια.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="el"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}