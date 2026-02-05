import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Game Portal",
  description: "A collection of vanilla JS canvas games",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col overflow-hidden`}
      >
        <nav className="border-b border-white/10 bg-card shrink-0">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
            <Link href="/" className="text-xl font-bold text-accent">
              Game Portal
            </Link>
            <div className="flex gap-6 text-sm">
              <Link
                href="/"
                className="text-foreground/70 transition-colors hover:text-accent"
              >
                Home
              </Link>
              <Link
                href="/leaderboard"
                className="text-foreground/70 transition-colors hover:text-accent"
              >
                Leaderboard
              </Link>
            </div>
          </div>
        </nav>
        <main className="mx-auto w-full max-w-6xl px-6 py-4 flex-1 min-h-0">{children}</main>
      </body>
    </html>
  );
}
