"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PostForm, { PostFormValues } from "@/components/blog/PostForm";
import { useCreatePost } from "@/hooks/blog/usePost";

function NewPostContent() {
  const router = useRouter();
  const createPost = useCreatePost();

  async function handleSubmit(values: PostFormValues) {
    const post = await createPost.mutateAsync(values);
    router.push(`/blog/${post.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href="/blog" className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to Blog
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">New Post</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8">
        <PostForm
          onSubmit={handleSubmit}
          onCancel={() => router.push("/blog")}
          submitLabel="Publish Post"
          loading={createPost.isPending}
        />
      </div>
    </div>
  );
}

export default function NewPostPage() {
  return (
    <ProtectedRoute>
      <NewPostContent />
    </ProtectedRoute>
  );
}
