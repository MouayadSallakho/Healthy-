import type { Metadata } from "next";
import { Geist, Geist_Mono, Oswald } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Athletic, editorial display face for headlines.
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Barbell Kitchen — Clean Food. Stronger You.",
  description:
    "High-protein, macro-balanced meals prepared fresh inside your gym. Order before training and pick up after your workout — built for performance, recovery, and everyday strength.",
  openGraph: {
    title: "Barbell Kitchen — Clean Food. Stronger You.",
    description:
      "Healthy, high-protein meals made fresh inside your gym. Fast in-gym pickup and delivery for members.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-graphite">
        {children}
      </body>
    </html>
  );
}
