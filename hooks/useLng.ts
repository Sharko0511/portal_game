"use client";

import { useParams } from "next/navigation";

export function useLng(): string {
  const params = useParams();
  return (params?.lng as string) || "en";
}
