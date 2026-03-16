"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PostForm, { PostFormValues } from "@/components/blog/PostForm";
import { usePost, useUpdatePost } from "@/hooks/blog/usePost";
import { useAuth } from "@/hooks/useAuth";

interface EditPostPageProps {
  params: Promise<{ id: string }>;
}

function EditPostContent({ id }: { id: string }) {
  const router = useRouter();
  const { profile } = useAuth();
  const postQuery = usePost(id);
  const updatePost = useUpdatePost();

  if (postQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-gray-500">Loading post...</p>
      </div>
    );
  }

  if (postQuery.isError || !postQuery.data) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <p className="text-sm text-red-600">Post not found.</p>
        <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900">
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
        <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  async function handleSubmit(values: PostFormValues) {
    await updatePost.mutateAsync({ id, ...values });
    router.push(`/blog/${id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <Link href={`/blog/${id}`} className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to Post
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
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
          onCancel={() => router.push(`/blog/${id}`)}
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
