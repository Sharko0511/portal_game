"use client";

import { use, useState, useDeferredValue } from "react";
import Link from "next/link";
import { useSearch, PostLevel } from "@/hooks/blog/usePost";
import { useLng } from "@/hooks/useLng";
import { ChevronDownIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const LEVEL_LABELS: Record<PostLevel, string> = {
  A1: "A1 - Beginner",
  A2: "A2 - Elementary",
  B1: "B1 - Intermediate",
  B2: "B2 - Upper Intermediate",
  C1: "C1 - Advanced",
  C2: "C2 - Proficiency",
};

const LEVELS: PostLevel[] = ["A1", "A2", "B1", "B2", "C1", "C2"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface TagPageProps {
  params: Promise<{ tag: string }>;
}

export default function TagPage({ params }: TagPageProps) {
  const { tag } = use(params);
  const decodedTag = decodeURIComponent(tag);
  const lng = useLng();

  const [query, setQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<PostLevel | "">("");
  const deferredQuery = useDeferredValue(query);

  const { data: posts, isLoading } = useSearch({
    tag: decodedTag,
    q: deferredQuery,
    level: levelFilter,
  });

  return (
    <>
      {/* Header */}
      <section
        className="w-full flex flex-col justify-center min-h-40 px-4 py-6 md:px-6 xl:px-21"
        style={{ background: "linear-gradient(135deg, #004d40 0%, #00695c 60%, #2e7d32 100%)" }}
      >
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-1.5 text-sm text-white/70">
          <Link href={`/${lng}`} className="hover:text-white">Trang chủ</Link>
          <span>›</span>
          <span className="font-medium text-brand-lime-bright">Tag</span>
        </nav>

        {/* Tag label */}
        <p className="mb-3 text-xs text-white/50">
          Tag: <span className="font-semibold text-white/80">{decodedTag}</span>
        </p>

        {/* Search row */}
        <div className="flex items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm"
              className="w-full rounded-full border border-white/20 bg-white/10 py-2.5 pl-4 pr-10 text-sm text-white placeholder-white/50 outline-none focus:border-white/40 focus:bg-white/15"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
              &#128269;
            </span>
          </div>

          {/* Level dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-center gap-2 rounded-full border border-transparent bg-brand-lime py-2.5 px-4 text-sm font-semibold text-white outline-none cursor-pointer whitespace-nowrap">
              {levelFilter ? LEVEL_LABELS[levelFilter] : "Tất cả trình độ"}
              <ChevronDownIcon className="size-4 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className={!levelFilter ? "bg-brand-primary text-white focus:bg-brand-primary focus:text-white" : ""}
                onSelect={() => setLevelFilter("")}
              >
                Tất cả trình độ
              </DropdownMenuItem>
              {LEVELS.map((l) => (
                <DropdownMenuItem
                  key={l}
                  className={levelFilter === l ? "bg-brand-primary text-white focus:bg-brand-primary focus:text-white" : ""}
                  onSelect={() => setLevelFilter(l)}
                >
                  {LEVEL_LABELS[l]}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </section>

      {/* Article list */}
      <div className="px-4 pt-8 pb-12 md:px-6 xl:px-21">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <div className="h-32 w-40 shrink-0 animate-pulse rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2 pt-2">
                  <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                  <div className="h-5 w-full animate-pulse rounded bg-gray-100" />
                </div>
              </div>
            ))}
          </div>
        ) : !posts?.length ? (
          <p className="py-16 text-center text-sm text-muted-foreground">
            Không tìm thấy bài viết nào.
          </p>
        ) : (
          <div>
            {posts.map((post, i) => (
              <div key={post.id} className={i !== 0 ? "mt-6 border-t border-border pt-6" : ""}>
                {/* Mobile */}
                <Link href={`/blog/${post.id}`} className="group block md:hidden">
                  <div className="h-48 w-full overflow-hidden rounded-xl bg-gray-100">
                    {post.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gray-100">
                        <span className="text-2xl font-bold text-gray-300">{post.title.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      {post.level && (
                        <span className="inline-flex items-center rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
                          {LEVEL_LABELS[post.level]}
                        </span>
                      )}
                      {post.reading_time > 0 && <span>{post.reading_time} phút đọc</span>}
                    </div>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <h3 className="mt-1 text-lg font-semibold text-foreground leading-snug group-hover:underline">{post.title}</h3>
                </Link>

                {/* Desktop */}
                <div className="hidden md:grid grid-cols-12 gap-x-12 items-start">
                  <Link href={`/blog/${post.id}`} className="col-span-3 block overflow-hidden rounded-xl">
                    <div className="h-40 w-full overflow-hidden rounded-xl bg-gray-100">
                      {post.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-gray-100">
                          <span className="text-2xl font-bold text-gray-300">{post.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                  <Link href={`/blog/${post.id}`} className="col-span-9 group flex flex-col gap-3 pt-1">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        {post.level && (
                          <span className="inline-flex items-center rounded-full bg-brand-orange px-2 py-0.5 text-xs font-semibold text-white">
                            {LEVEL_LABELS[post.level]}
                          </span>
                        )}
                        {post.reading_time > 0 && <span>{post.reading_time} phút đọc</span>}
                      </div>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <h3 className="text-lg font-semibold text-foreground leading-snug group-hover:underline">{post.title}</h3>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
