import { ReactNode } from "react";
import { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type CategoryLayoutProps = {
  children: ReactNode;
  params: Promise<{ lng: string; slug: string }>;
};

function getSiteUrl(): string {
  const fromPublic =
    process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (fromPublic) return fromPublic.replace(/\/$/, "");

  const vercel = process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}

function formatTitle(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function getCategorySeo(slug: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("categories")
    .select("name, description")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return data;
}

export async function generateMetadata({
  params,
}: Omit<CategoryLayoutProps, "children">): Promise<Metadata> {
  const { lng, slug } = await params;
  const category = await getCategorySeo(slug);
  const categoryName = category?.name || formatTitle(slug);
  const description =
    category?.description ||
    `Explore the latest public posts in ${categoryName} on The Good Learning.`;

  const url = `${getSiteUrl()}/${lng}/c/${slug}`;

  return {
    title: `${categoryName} | The Good Learning`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${categoryName} | The Good Learning`,
      description,
      url,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryName} | The Good Learning`,
      description,
    },
  };
}

export default function CategoryLayout({ children }: CategoryLayoutProps) {
  return <>{children}</>;
}
