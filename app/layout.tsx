import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible, Fraunces, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

/** Display: a soft, optical-size serif for headings — warm, bookish, unhurried. */
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

/** Body: designed for low-vision readers, and clear for young learners decoding letters. */
const atkinson = Atkinson_Hyperlegible({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://monalo.school"),
  title: {
    default: "MonAlo — Light of the mind",
    template: "%s · MonAlo",
  },
  description:
    "Monalo School: courses, Eco Penguin phonics for young readers, a craft shop, a gallery and a freelance team — every part orbits one school.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0b1030" },
    { media: "(prefers-color-scheme: light)", color: "#f6f4fb" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fraunces.variable} ${atkinson.variable} ${geistMono.variable} antialiased text-[var(--foreground)]`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
