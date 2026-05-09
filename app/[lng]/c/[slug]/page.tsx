"use client";

import { use } from "react";
import Link from "next/link";
import PostList from "@/components/blog/PostList";
import { useSearch } from "@/hooks/blog/usePost";
import { useLng } from "@/hooks/useLng";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

function formatTitle(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params);
  const lng = useLng();
  const title = formatTitle(slug);

  const postsQuery = useSearch({
    categories: [slug],
    categoriesMode: "any",
    limit: 24,
  });

  const isMissingCategory =
    postsQuery.isError && (postsQuery.error as Error).message.includes("400");

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 md:px-6 xl:px-21">
      <nav className="mb-3 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={`/${lng}`} className="hover:text-foreground">
          Home
        </Link>
        <span>›</span>
        <Link href={`/${lng}/blog`} className="hover:text-foreground">
          Blog
        </Link>
        <span>›</span>
        <span className="font-medium text-foreground">{title}</span>
      </nav>

      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        </div>
      </div>

      {isMissingCategory ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-6 text-sm text-red-600">
          Category not found or inactive.
        </div>
      ) : (
        <PostList
          posts={postsQuery.data ?? []}
          loading={postsQuery.isLoading}
          emptyMessage="No public posts in this category yet."
          singleColumn={false}
        />
      )}
    </div>
  );
}
