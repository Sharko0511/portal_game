import type { Metadata } from "next";
import { getSupabaseAdmin } from "@/lib/supabase-server";

type PostLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ lng: string; slug: string }>;
};

type PostSeoData = {
  id: string;
  title: string;
  cover_image_url: string | null;
  cover_image_caption: string | null;
  author_name: string;
  created_at: string;
  updated_at: string;
  visibility: "private" | "share" | "public";
};

const SITE_NAME = "The Good Learning";
const DEFAULT_OG_IMAGE = "/HeroSection.png";

function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  return envUrl.startsWith("http") ? envUrl : `https://${envUrl}`;
}

function toAbsoluteUrl(pathOrUrl: string) {
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  const normalizedPath = pathOrUrl.startsWith("/")
    ? pathOrUrl
    : `/${pathOrUrl}`;
  return new URL(normalizedPath, getSiteUrl()).toString();
}

async function getPublicPostSeoData(slug: string) {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("posts_with_counts")
    .select(
      "id, title, cover_image_url, cover_image_caption, author_name, created_at, updated_at, visibility",
    )
    .eq("slug", slug)
    .eq("visibility", "public")
    .maybeSingle<PostSeoData>();

  return data;
}

export async function generateMetadata({
  params,
}: Omit<PostLayoutProps, "children">): Promise<Metadata> {
  const { slug, lng } = await params;
  const post = await getPublicPostSeoData(slug);

  const postUrl = `${getSiteUrl()}/${lng}/blog/${slug}`;
  const fallbackDescription = "Read this article on The Good Learning.";

  if (!post) {
    return {
      title: "Blog Post",
      description: fallbackDescription,
      alternates: { canonical: postUrl },
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        type: "article",
        title: "Blog Post",
        description: fallbackDescription,
        url: postUrl,
        siteName: SITE_NAME,
        images: [
          {
            url: toAbsoluteUrl(DEFAULT_OG_IMAGE),
            width: 1200,
            height: 630,
            alt: SITE_NAME,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Blog Post",
        description: fallbackDescription,
        images: [toAbsoluteUrl(DEFAULT_OG_IMAGE)],
      },
    };
  }

  const ogImageUrl = toAbsoluteUrl(post.cover_image_url ?? DEFAULT_OG_IMAGE);
  const description = post.cover_image_caption || fallbackDescription;

  return {
    title: post.title,
    description,
    alternates: { canonical: postUrl },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: postUrl,
      siteName: SITE_NAME,
      locale: lng === "vi" ? "vi_VN" : "en_US",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
      authors: post.author_name ? [post.author_name] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: [ogImageUrl],
    },
  };
}

function buildBlogPostingSchema(input: {
  slug: string;
  lng: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  authorName: string;
}) {
  const postUrl = `${getSiteUrl()}/${input.lng}/blog/${input.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: input.title,
    description: input.description,
    image: [input.imageUrl],
    datePublished: input.createdAt,
    dateModified: input.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    author: {
      "@type": "Person",
      name: input.authorName || SITE_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: toAbsoluteUrl("/globe.svg"),
      },
    },
  };
}

export default async function PostLayout({
  children,
  params,
}: PostLayoutProps) {
  const { slug, lng } = await params;
  const post = await getPublicPostSeoData(slug);

  if (!post) return children;

  const imageUrl = toAbsoluteUrl(post.cover_image_url ?? DEFAULT_OG_IMAGE);
  const description =
    post.cover_image_caption || "Read this article on The Good Learning.";
  const schema = buildBlogPostingSchema({
    slug,
    lng,
    title: post.title,
    description,
    imageUrl,
    createdAt: post.created_at,
    updatedAt: post.updated_at,
    authorName: post.author_name,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      {children}
    </>
  );
}
