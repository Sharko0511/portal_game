"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PostForm, { PostFormValues } from "@/components/blog/PostForm";
import { usePost, useUpdatePost } from "@/hooks/blog/usePost";
import { useAuth } from "@/hooks/useAuth";
import { useLng } from "@/hooks/useLng";

interface EditPostPageProps {
  params: Promise<{ slug: string }>;
}

function EditPostContent({ slug }: { slug: string }) {
  const router = useRouter();
  const { profile } = useAuth();
  const postQuery = usePost(slug);
  const updatePost = useUpdatePost();
  const lng = useLng();

  if (postQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading post...</p>
      </div>
    );
  }

  if (postQuery.isError || !postQuery.data) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-600">Post not found.</p>
        <Link
          href={`/${lng}/blog`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Blog
        </Link>
      </div>
    );
  }

  const post = postQuery.data;
  const isAdmin = profile?.role === "admin";
  const isAuthor = profile?.id === post.author_id;

  // Only the author can edit
  if (profile && !isAuthor && !isAdmin) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-600">
          You are not allowed to edit this post.
        </p>
        <Link
          href={`/${lng}/blog`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Blog
        </Link>
      </div>
    );
  }

  async function handleSubmit(values: PostFormValues) {
    const { id } = postQuery.data!;
    await updatePost.mutateAsync({ id, ...values });
    router.push(`/${lng}/blog/${slug}`);
  }

  return (
    <div className="mx-auto max-w-3xl md:px-6 md:py-8">
      <div className="mb-6 flex items-center gap-4 px-4 pt-6 md:px-0 md:pt-0">
        <Link
          href={`/${lng}/blog/${slug}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to Post
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Edit Post</h1>
      </div>

      <div className="rounded-none border-y border-border bg-card p-4 md:rounded-2xl md:border md:p-8">
        <PostForm
          initialValues={{
            title: post.title,
            content: post.content,
            cover_image_url: post.cover_image_url,
            cover_image_caption: post.cover_image_caption,
            visibility: post.visibility,
            category: post.category,
            categoryIds: (post.categories ?? []).map((c) => c.id),
            level: post.level,
            audio_url: post.audio_url,
            reading_time: post.reading_time,
            tags: post.tags,
            word_count: post.word_count,
            event_encounters: post.event_encounters,
            cards_count: post.cards_count,
            feedback_intro: post.feedback_intro,
            player_feedback: post.player_feedback,
          }}
          initialCategoryOptions={(post.categories ?? []).map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
          }))}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/${lng}/blog/${slug}`)}
          submitLabel="Save Changes"
          loading={updatePost.isPending}
          isAdmin={isAdmin}
          readOnlyBase={isAdmin && !isAuthor}
        />
      </div>
    </div>
  );
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { slug } = use(params);
  return (
    <ProtectedRoute>
      <EditPostContent slug={slug} />
    </ProtectedRoute>
  );
}
