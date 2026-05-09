"use client";

import Link from "next/link";
import { Headphones } from "lucide-react";
import { useLng } from "@/hooks/useLng";
import { useClientTranslation } from "@/hooks/useClientTranslation";
import { HotCategoryWithPosts } from "@/hooks/blog/useHotCategories";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface HotCategoryGroupProps {
  category: HotCategoryWithPosts;
  first?: boolean;
  last?: boolean;
}

function HotCategoryGroup({ category, first, last }: HotCategoryGroupProps) {
  const lng = useLng();
  const { t } = useClientTranslation(lng, "blog");
  const posts = category.posts ?? [];

  if (!posts.length) return null;

  return (
    <section className={`${first ? "" : "border-t border-border pt-8"}`}>
      <div className="md:hidden">
        <h2 className="mb-4 text-2xl font-bold text-foreground">
          {category.name}
        </h2>
        {posts.map((post, i) => (
          <div
            key={post.id}
            className={i !== 0 ? "mt-6 border-t-2 border-gray-200 pt-6" : ""}
          >
            <Link href={`/blog/${post.slug}`} className="group block">
              <div className="relative h-48 w-full overflow-hidden rounded-xl bg-gray-100">
                {post.cover_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gray-100">
                    <span className="text-2xl font-bold text-gray-300">
                      {post.title.charAt(0)}
                    </span>
                  </div>
                )}
                {post.audio_url && (
                  <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
                    <Headphones className="h-3 w-3" /> Audio
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                {post.reading_time > 0 && (
                  <span>
                    {post.reading_time} {t("reading_time")}
                  </span>
                )}
                <span>{formatDate(post.created_at)}</span>
              </div>
              <h3 className="mt-1 text-lg font-semibold text-foreground leading-snug group-hover:underline">
                {post.title}
              </h3>
            </Link>
          </div>
        ))}
        <div className="mt-6 mb-4 flex justify-end">
          <Link
            href={`/${lng}/c/${category.slug}`}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            {t("more_on_topic")} ↗
          </Link>
        </div>
      </div>

      <div className="hidden md:block">
        {posts.map((post, i) => (
          <div
            key={post.id}
            className={`grid grid-cols-12 gap-x-12 gap-y-4 items-start mb-8 ${last ? "last:mb-0" : ""}`}
          >
            <div className="col-span-4">
              {i === 0 ? (
                <>
                  <h2 className="text-2xl font-bold text-foreground">
                    {category.name}
                  </h2>
                  <Link
                    href={`/${lng}/c/${category.slug}`}
                    className="mt-1 inline-block text-sm text-muted-foreground hover:text-foreground"
                  >
                    {t("more_on_topic")} ↗
                  </Link>
                </>
              ) : null}
            </div>

            <div
              className={`col-span-8 grid grid-cols-8 gap-x-14 items-start ${i !== 0 ? "border-t-2 border-gray-200 pt-8" : ""}`}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="col-span-3 block overflow-hidden rounded-xl"
              >
                <div className="relative h-50 w-full overflow-hidden rounded-xl bg-gray-100">
                  {post.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gray-100">
                      <span className="text-2xl font-bold text-gray-300">
                        {post.title.charAt(0)}
                      </span>
                    </div>
                  )}
                  {post.audio_url && (
                    <span className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
                      <Headphones className="h-3 w-3" /> Audio
                    </span>
                  )}
                </div>
              </Link>
              <Link
                href={`/blog/${post.slug}`}
                className="col-span-5 group flex flex-col justify-between gap-3 self-stretch pt-1"
              >
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  {post.reading_time > 0 && (
                    <span>
                      {post.reading_time} {t("reading_time")}
                    </span>
                  )}
                  <span>{formatDate(post.created_at)}</span>
                </div>
                <h3 className="text-lg font-semibold text-foreground leading-snug group-hover:underline">
                  {post.title}
                </h3>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

interface ArticleListByHotCategoryProps {
  categories: HotCategoryWithPosts[];
}

export default function ArticleListByHotCategory({
  categories,
}: ArticleListByHotCategoryProps) {
  const availableCategories = (categories ?? []).filter(
    (c) => (c.posts ?? []).length > 0,
  );

  if (availableCategories.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No articles yet.
      </p>
    );
  }

  return (
    <div>
      {availableCategories.map((category, i) => (
        <HotCategoryGroup
          key={category.id}
          category={category}
          first={i === 0}
          last={i === availableCategories.length - 1}
        />
      ))}
    </div>
  );
}
