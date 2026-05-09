import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import QueryProvider from "@/components/QueryProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { fetchThemeCss } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const SITE_NAME = "The Good Learning";

function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
}

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "Improve your English through blog posts, articles, and games.",
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description:
      "Improve your English through blog posts, articles, and games.",
    images: [
      {
        url: "/HeroSection.png",
        width: 1200,
        height: 630,
        alt: "The Good Learning",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description:
      "Improve your English through blog posts, articles, and games.",
    images: ["/HeroSection.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let themeCss = "";
  try {
    themeCss = await fetchThemeCss();
  } catch {
    /* fallback to globals.css */
  }

  return (
    <html lang="en" suppressHydrationWarning>
      {themeCss && (
        <head>
          <style dangerouslySetInnerHTML={{ __html: themeCss }} />
        </head>
      )}
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} antialiased font-montserrat min-h-screen flex flex-col bg-background text-foreground`}
        style={{
          fontFamily:
            "var(--font-montserrat), var(--font-geist-sans), sans-serif",
        }}
      >
        <ThemeProvider defaultTheme="system">
          <AuthProvider>
            <QueryProvider>{children}</QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
