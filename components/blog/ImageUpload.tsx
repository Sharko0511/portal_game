"use client";

import { useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/useAuth";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  label?: string;
  initialUrl?: string;
}

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export default function ImageUpload({ onUpload, label = "Cover Image", initialUrl }: ImageUploadProps) {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPEG, PNG, WebP and GIF images are allowed.");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Image must be under ${MAX_SIZE_MB}MB.`);
      return;
    }
    if (!user) {
      setError("You must be logged in to upload images.");
      return;
    }

    setUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const ext = file.name.split(".").pop();
      const path = `${user.id}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("post-images")
        .upload(path, file, { upsert: false });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("post-images").getPublicUrl(path);
      onUpload(data.publicUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleRemove() {
    setPreview(null);
    setError(null);
    onUpload("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>

      {preview ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Cover preview"
            className="h-48 w-full rounded-xl border border-border object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs text-muted-foreground shadow hover:bg-white"
          >
            Remove
          </button>
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70">
              <span className="text-sm text-muted-foreground">Uploading...</span>
            </div>
          )}
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          className="flex h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-gray-50 transition-colors hover:border-gray-400 hover:bg-gray-100"
        >
          <span className="mb-1 text-2xl">🖼️</span>
          <p className="text-sm text-muted-foreground">
            {uploading ? "Uploading..." : "Click or drag to upload"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">JPEG, PNG, WebP, GIF — max {MAX_SIZE_MB}MB</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(",")}
        onChange={handleChange}
        className="hidden"
      />

      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
}
