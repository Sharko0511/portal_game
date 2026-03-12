"use client";

import { usePosts } from "./usePosts";

/** Posts by a specific author — reuses usePosts with author filter */
export function useUserPosts(userId: string) {
  return usePosts({ author: userId });
}
