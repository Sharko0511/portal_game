import { Geist, Geist_Mono } from "next/font/google";
import AuthProvider from "@/components/AuthProvider";
import QueryProvider from "@/components/QueryProvider";
import Navbar from "@/components/Navbar";
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
  title: "The Good Learning",
  description: "Improve your English through blog posts, articles, and games.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-white">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-white text-gray-900`}
      >
        <AuthProvider>
          <QueryProvider>
            <Navbar />
            <main className="mx-auto w-full max-w-6xl px-6 py-8 flex-1 bg-white">{children}</main>
          </QueryProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
