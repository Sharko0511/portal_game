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
  params: Promise<{ id: string }>;
}

function EditPostContent({ id }: { id: string }) {
  const router = useRouter();
  const { profile } = useAuth();
  const postQuery = usePost(id);
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
        <Link href={`/${lng}/blog`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  const post = postQuery.data;

  // Only the author can edit
  if (profile && post.author_id !== profile.id && profile.role !== "admin") {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-600">You are not allowed to edit this post.</p>
        <Link href={`/${lng}/blog`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  async function handleSubmit(values: PostFormValues) {
    await updatePost.mutateAsync({ id, ...values });
    router.push(`/${lng}/blog/${id}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link href={`/${lng}/blog/${id}`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Post
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Edit Post</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8">
        <PostForm
          initialValues={{
            title: post.title,
            content: post.content,
            cover_image_url: post.cover_image_url,
            published: post.published,
          }}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/${lng}/blog/${id}`)}
          submitLabel="Save Changes"
          loading={updatePost.isPending}
        />
      </div>
    </div>
  );
}

export default function EditPostPage({ params }: EditPostPageProps) {
  const { id } = use(params);
  return (
    <ProtectedRoute>
      <EditPostContent id={id} />
    </ProtectedRoute>
  );
}
