"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PostForm, { PostFormValues } from "@/components/blog/PostForm";
import { useCreatePost } from "@/hooks/blog/usePost";
import { useLng } from "@/hooks/useLng";

function NewPostContent() {
  const router = useRouter();
  const createPost = useCreatePost();
  const lng = useLng();

  async function handleSubmit(values: PostFormValues) {
    const post = await createPost.mutateAsync(values);
    router.push(`/${lng}/blog/${post.id}`);
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link href={`/${lng}/blog`} className="text-sm text-muted-foreground hover:text-foreground">
          ← Back to Blog
        </Link>
        <h1 className="text-2xl font-bold text-foreground">New Post</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-8">
        <PostForm
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/${lng}/blog`)}
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
