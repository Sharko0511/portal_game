"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import {
  useAdminPosts,
  useAdminChangeVisibility,
  useAdminDeletePost,
  AdminPost,
} from "@/hooks/admin/useAdminPosts";
import Button from "@/components/Button";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Globe,
  Link2,
  Lock,
  Heart,
  MessageCircle,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Newspaper,
  SlidersHorizontal,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────

const LEVEL_STYLES: Record<string, string> = {
  A1: "bg-emerald-100 text-emerald-700 border-emerald-200",
  A2: "bg-green-100 text-green-700 border-green-200",
  B1: "bg-yellow-100 text-yellow-700 border-yellow-200",
  B2: "bg-orange-100 text-orange-700 border-orange-200",
  C1: "bg-red-100 text-red-700 border-red-200",
  C2: "bg-rose-100 text-rose-800 border-rose-200",
};

const LEVEL_GRADIENT: Record<string, string> = {
  A1: "from-emerald-400 to-emerald-600",
  A2: "from-green-400 to-green-600",
  B1: "from-yellow-400 to-yellow-600",
  B2: "from-orange-400 to-orange-600",
  C1: "from-red-400 to-red-600",
  C2: "from-rose-500 to-rose-700",
};

const VISIBILITY_CONFIG = {
  public: {
    icon: Globe,
    label: "Public",
    style: "bg-green-100 text-green-700 border-green-200 hover:bg-green-200",
  },
  share: {
    icon: Link2,
    label: "Share",
    style: "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200",
  },
  private: {
    icon: Lock,
    label: "Private",
    style: "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200",
  },
} as const;

const VISIBILITY_CYCLE: Record<string, "private" | "share" | "public"> = {
  private: "share",
  share: "public",
  public: "private",
};

// ── Helpers ──────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

// ── Sub-components ───────────────────────────────────────────

function SkeletonRow() {
  return (
    <div className="flex gap-5 rounded-2xl border border-gray-200 bg-white p-5 animate-pulse">
      <div className="h-20 w-20 shrink-0 rounded-xl bg-gray-200" />
      <div className="flex-1 space-y-2.5">
        <div className="h-5 w-3/4 rounded bg-gray-200" />
        <div className="h-4 w-1/3 rounded bg-gray-100" />
        <div className="flex gap-2">
          <div className="h-6 w-14 rounded-full bg-gray-200" />
          <div className="h-6 w-18 rounded-full bg-gray-100" />
        </div>
        <div className="flex gap-4">
          <div className="h-4 w-10 rounded bg-gray-100" />
          <div className="h-4 w-10 rounded bg-gray-100" />
          <div className="h-4 w-8 rounded bg-gray-100" />
        </div>
      </div>
      <div className="w-28 flex flex-col justify-between">
        <div className="h-7 w-full rounded-full bg-gray-200" />
        <div className="flex gap-2 justify-end">
          <div className="h-9 w-9 rounded-xl bg-gray-100" />
          <div className="h-9 w-9 rounded-xl bg-gray-100" />
          <div className="h-9 w-9 rounded-xl bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

function Thumbnail({ post }: { post: AdminPost }) {
  if (post.cover_image_url) {
    return (
      <img
        src={post.cover_image_url}
        alt={post.title}
        className="h-28 w-28 shrink-0 rounded-2xl object-cover"
      />
    );
  }
  const gradient = post.level ? LEVEL_GRADIENT[post.level] : "from-gray-400 to-gray-600";
  const Icon = post.category === "baohay" ? Newspaper : BookOpen;
  return (
    <div
      className={`h-28 w-28 shrink-0 rounded-2xl bg-linear-to-br ${gradient} flex items-center justify-center`}
    >
      <Icon className="h-11 w-11 text-white/80" />
    </div>
  );
}

function VisibilityToggle({
  post,
  onCycle,
  loading,
}: {
  post: AdminPost;
  onCycle: (id: string, next: "private" | "share" | "public") => void;
  loading: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cfg = VISIBILITY_CONFIG[post.visibility];
  const Icon = cfg.icon;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${cfg.style} disabled:opacity-50`}
      >
        <Icon className="h-4 w-4" />
        {cfg.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-44 rounded-2xl border border-gray-200 bg-white py-2 shadow-xl">
          {(["public", "share", "private"] as const).map((v) => {
            const c = VISIBILITY_CONFIG[v];
            const VIcon = c.icon;
            const isActive = post.visibility === v;
            return (
              <button
                key={v}
                onClick={() => { onCycle(post.id, v); setOpen(false); }}
                disabled={isActive || loading}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 disabled:cursor-default ${
                  isActive ? "font-semibold text-gray-900" : "text-gray-600"
                }`}
              >
                <VIcon className="h-4 w-4 shrink-0" />
                <span>{c.label}</span>
                {isActive && <span className="ml-auto text-gray-400">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PostRow({
  post,
  adminId,
  onVisibilityChange,
  onDelete,
  visibilityLoading,
}: {
  post: AdminPost;
  adminId: string;
  onVisibilityChange: (id: string, v: "private" | "share" | "public") => void;
  onDelete: (id: string, title: string) => void;
  visibilityLoading: boolean;
}) {
  const canEdit = post.author_id === adminId;

  return (
    <div className="flex items-center gap-6 rounded-2xl border border-gray-200 bg-white p-6 transition-shadow hover:shadow-lg">
      {/* Thumbnail */}
      <Thumbnail post={post} />

      {/* Main content */}
      <div className="min-w-0 flex-1 space-y-3">
        {/* Title */}
        <h3 className="truncate text-lg font-semibold text-gray-900">
          {post.title}
        </h3>

        {/* Author + date */}
        <div className="flex items-center gap-2.5 text-sm text-gray-500">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">
            {initials(post.author_name || "?")}
          </span>
          <span className="font-medium text-gray-700">{post.author_name}</span>
          <span>·</span>
          <span>{formatDate(post.created_at)}</span>
        </div>

        {/* Level + tags — always rendered to keep consistent card height */}
        <div className="flex min-h-8 flex-wrap items-center gap-2">
          {post.level && (
            <span className={`rounded-full border px-3 py-1 text-sm font-bold ${LEVEL_STYLES[post.level]}`}>
              🎯 {post.level}
            </span>
          )}
          {post.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600">
              #{tag}
            </span>
          ))}
          {post.tags.length > 3 && (
            <span className="text-sm text-gray-400">+{post.tags.length - 3} more</span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-5 text-sm text-gray-400">
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {post.reading_time}m
          </span>
          <span className="flex items-center gap-1.5">
            <FileText className="h-4 w-4" />
            {formatCount(post.word_count)}w
          </span>
          <span className="flex items-center gap-1.5 text-rose-400">
            <Heart className="h-4 w-4" />
            {formatCount(post.like_count)}
          </span>
          <span className="flex items-center gap-1.5 text-blue-400">
            <MessageCircle className="h-4 w-4" />
            {formatCount(post.comment_count)}
          </span>
        </div>
      </div>

      {/* Status + Actions — gom thành cột sát nhau */}
      <div className="flex shrink-0 flex-col items-end gap-3 justify-center">
        <VisibilityToggle
          post={post}
          onCycle={onVisibilityChange}
          loading={visibilityLoading}
        />
        <div className="flex items-center gap-1">
          <Link
            href={`/blog/${post.id}`}
            target="_blank"
            title="View post"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <Eye className="h-5 w-5" />
          </Link>
          {canEdit && (
            <Link
              href={`/blog/${post.id}/edit`}
              title="Edit post (yours)"
              className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
            >
              <Pencil className="h-5 w-5" />
            </Link>
          )}
          <button
            onClick={() => onDelete(post.id, post.title)}
            title="Delete post"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────

export default function AdminBlogManagement() {
  const { profile } = useAuth();

  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [level, setLevel] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);

  // Debounce search input → auto-trigger without needing to click Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const postsQuery = useAdminPosts({ page, search: searchQuery, visibility, level, category, sort });
  const changeVisibility = useAdminChangeVisibility();
  const deletePost = useAdminDeletePost();

  const posts = postsQuery.data?.data ?? [];
  const total = postsQuery.data?.total ?? 0;
  const totalPages = postsQuery.data?.totalPages ?? 1;

  const publicCount = posts.filter((p) => p.visibility === "public").length;
  const privateCount = posts.filter((p) => p.visibility === "private").length;
  const shareCount = posts.filter((p) => p.visibility === "share").length;

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchQuery(search);
    setPage(1);
  }

  function handleFilterChange(key: string, value: string) {
    setPage(1);
    if (key === "visibility") setVisibility(value);
    if (key === "level") setLevel(value);
    if (key === "category") setCategory(value);
    if (key === "sort") setSort(value);
  }

  function clearFilters() {
    setSearch("");
    setSearchQuery("");
    setVisibility("all");
    setLevel("all");
    setCategory("all");
    setSort("newest");
    setPage(1);
  }

  const hasActiveFilters =
    searchQuery || visibility !== "all" || level !== "all" || category !== "all" || sort !== "newest";

  const handleVisibilityChange = useCallback(
    (postId: string, next: "private" | "share" | "public") => {
      changeVisibility.mutate({ postId, visibility: next });
    },
    [changeVisibility]
  );

  const handleDelete = useCallback(
    (postId: string, title: string) => {
      if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
      deletePost.mutate(postId);
    },
    [deletePost]
  );

  const pages = buildPageList(page, totalPages);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <BookOpen className="h-6 w-6 text-brand-lime-bright" />
            Blog Management
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Manage and moderate all user blog posts
          </p>
        </div>
        <Link href="/blog/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </Link>
      </div>

      {/* Summary stats */}
      {!postsQuery.isLoading && (
        <div className="flex flex-wrap gap-3">
          <StatChip icon="📄" label="Total" count={total} active={visibility === "all"} onClick={() => handleFilterChange("visibility", "all")} />
          <StatChip icon="🌍" label="Public" count={postsQuery.data ? posts.filter(p => p.visibility === "public").length : 0} fullCount active={visibility === "public"} onClick={() => handleFilterChange("visibility", "public")} />
          <StatChip icon="🔗" label="Share" count={shareCount} active={visibility === "share"} onClick={() => handleFilterChange("visibility", "share")} />
          <StatChip icon="🔒" label="Private" count={privateCount} active={visibility === "private"} onClick={() => handleFilterChange("visibility", "private")} />
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 rounded-lg border border-border bg-card pl-8 pr-3 text-sm outline-none focus:border-foreground/40 w-52"
            />
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400 shrink-0" />

          <FilterDropdown
            value={visibility}
            onChange={(v) => handleFilterChange("visibility", v)}
            options={[
              { value: "all", label: "All visibility" },
              { value: "public", label: "🌍 Public" },
              { value: "share", label: "🔗 Share" },
              { value: "private", label: "🔒 Private" },
            ]}
          />

          <FilterDropdown
            value={level}
            onChange={(v) => handleFilterChange("level", v)}
            options={[
              { value: "all", label: "All levels" },
              { value: "A1", label: "A1" },
              { value: "A2", label: "A2" },
              { value: "B1", label: "B1" },
              { value: "B2", label: "B2" },
              { value: "C1", label: "C1" },
              { value: "C2", label: "C2" },
            ]}
          />

          <FilterDropdown
            value={category}
            onChange={(v) => handleFilterChange("category", v)}
            options={[
              { value: "all", label: "All categories" },
              { value: "blog", label: "📖 Blog" },
              { value: "baohay", label: "📰 Báo Hay" },
            ]}
          />

          <FilterDropdown
            value={sort}
            onChange={(v) => handleFilterChange("sort", v)}
            options={[
              { value: "newest", label: "↓ Newest" },
              { value: "oldest", label: "↑ Oldest" },
              { value: "most_liked", label: "❤️ Most liked" },
            ]}
          />

          {hasActiveFilters && (
            <Button onClick={clearFilters} variant="secondary" size="sm">
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      {postsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState hasFilters={!!hasActiveFilters} onClear={clearFilters} />
      ) : (
        <>
          <div className="space-y-3">
            {posts.map((post) => (
              <PostRow
                key={post.id}
                post={post}
                adminId={profile?.id ?? ""}
                onVisibilityChange={handleVisibilityChange}
                onDelete={handleDelete}
                visibilityLoading={changeVisibility.isPending}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                {pages.map((p, i) =>
                  p === "..." ? (
                    <span key={`ellipsis-${i}`} className="px-1 text-sm text-gray-400">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors ${
                        page === p
                          ? "bg-brand-lime-bright font-semibold text-gray-900"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-400">
                Showing {(page - 1) * 10 + 1}–{Math.min(page * 10, total)} of {total} posts
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Utility components ────────────────────────────────────────

function StatChip({
  icon,
  label,
  count,
  active,
  onClick,
  fullCount,
}: {
  icon: string;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  fullCount?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-all ${
        active
          ? "border-gray-900 bg-gray-900 font-semibold text-white"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <span
        className={`rounded-full px-1.5 py-0.5 text-xs font-bold ${
          active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-700"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function FilterDropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value) ?? options[0];
  const isFiltered = value !== options[0].value;

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all ${
          isFiltered
            ? "border-gray-900 bg-gray-900 text-white"
            : "border-border bg-card text-muted-foreground hover:border-foreground/40 hover:text-foreground"
        }`}
      >
        {current.label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-2 min-w-[10rem] rounded-2xl border border-gray-200 bg-white py-2 shadow-xl">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                value === o.value ? "font-semibold text-gray-900" : "text-gray-600"
              }`}
            >
              <span>{o.label}</span>
              {value === o.value && <span className="text-gray-400">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-16 text-center">
      <BookOpen className="mb-3 h-10 w-10 text-gray-300" />
      <p className="text-base font-medium text-gray-600">
        {hasFilters ? "No posts match your filters" : "No posts yet"}
      </p>
      <p className="mt-1 text-sm text-gray-400">
        {hasFilters ? "Try adjusting your search or filters" : "Posts will appear here once users start writing"}
      </p>
      {hasFilters && (
        <Button onClick={onClear} variant="primary" size="md" className="mt-4">
          Clear filters
        </Button>
      )}
    </div>
  );
}

function buildPageList(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i);
  }
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}
