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
  title: "PaperScout — Personal Research Intelligence",
  description: "PaperScout keeps watch over the research around your interests and brings you the papers, ideas, and discoveries worth your attention.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased selection:bg-slate-200 selection:text-slate-900`}
    >
      <body className="min-h-full flex flex-col bg-[#FAFAFA] text-slate-900 font-sans">
        {children}
      </body>
    </html>
  );
}
