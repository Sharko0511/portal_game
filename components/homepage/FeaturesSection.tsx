"use client";

import { useRouter } from "next/navigation";
import { useLng } from "@/hooks/useLng";
import { useClientTranslation } from "@/hooks/useClientTranslation";
import { useHotCategories } from "@/hooks/blog/useHotCategories";
import FeatureBlock from "./FeatureBlock";

export default function FeaturesSection() {
  const lng = useLng();
  const router = useRouter();
  const { t } = useClientTranslation(lng, "homepage_features");
  const hotCategoriesQuery = useHotCategories(4);
  const hotCategories = hotCategoriesQuery.data ?? [];

  return (
    <section className="w-full bg-background py-8 flex justify-center">
      <div className="w-full max-w-[1600px] px-4 md:px-21">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-[40px] md:text-5xl lg:text-[64px] font-bold md:leading-27 text-brand-lime mb-2">
            {t("title")}
            <span className="text-brand-primary">.</span>
          </h2>
          <p className="text-[24px] md:text-3xl lg:text-[40px] text-brand-primary font-bold md:leading-12">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-10">
          <FeatureBlock
            title={t("blog.title")}
            description={t("blog.description")}
            buttonText={t("blog.button")}
            onClick={() => router.push(`/${lng}/blog`)}
          />
          <FeatureBlock
            title={t("games.title")}
            description={t("games.description")}
            buttonText={t("games.button")}
            onClick={() => router.push(`/${lng}/games`)}
          />
        </div>

        <div className="mt-10 space-y-6">
          <h3 className="text-xl font-bold text-brand-dark md:text-2xl">
            Hot Categories
          </h3>

          {hotCategoriesQuery.isLoading && (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div
                  key={idx}
                  className="h-44 animate-pulse rounded-2xl border border-brand-dark/10 bg-brand-lime/20"
                />
              ))}
            </div>
          )}

          {!hotCategoriesQuery.isLoading && hotCategories.length === 0 && (
            <p className="rounded-2xl border border-dashed border-brand-dark/30 bg-white px-4 py-6 text-sm text-brand-dark/70">
              No hot categories yet.
            </p>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            {hotCategories.map((category) => (
              <section
                key={category.id}
                className="rounded-2xl border border-brand-dark/20 bg-white p-4"
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="text-lg font-bold text-brand-dark">
                    {category.name}
                  </h4>
                  <button
                    type="button"
                    onClick={() => router.push(`/${lng}/c/${category.slug}`)}
                    className="text-xs font-semibold text-brand-primary hover:underline"
                  >
                    View all
                  </button>
                </div>

                <div className="space-y-2">
                  {category.posts.slice(0, 3).map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => router.push(`/${lng}/blog/${post.slug}`)}
                      className="block w-full rounded-xl border border-brand-dark/10 px-3 py-2 text-left transition-colors hover:bg-brand-lime/20"
                    >
                      <p className="line-clamp-2 text-sm font-semibold text-foreground">
                        {post.title}
                      </p>
                    </button>
                  ))}
                  {category.posts.length === 0 && (
                    <p className="rounded-xl bg-gray-50 px-3 py-2 text-sm text-muted-foreground">
                      No public posts in this category.
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
