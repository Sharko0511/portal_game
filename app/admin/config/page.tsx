"use client";

import { useEffect, useState } from "react";
import { useAdminConfig, useUpdateAdminConfig, SiteConfig } from "@/hooks/admin/useAdminConfig";
import Button from "@/components/Button";

export default function AdminConfig() {
  const configQuery = useAdminConfig();
  const updateConfig = useUpdateAdminConfig();
  const [configs, setConfigs] = useState<SiteConfig[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (configQuery.data) {
      setConfigs(configQuery.data);
    }
  }, [configQuery.data]);

  async function handleUpdate(key: string, value: string | boolean) {
    setMessage("");
    try {
      await updateConfig.mutateAsync({ key, value });
      setMessage("Config saved");
    } catch {
      setMessage("Failed to save");
    }
  }

  function handleChange(key: string, value: string | boolean) {
    setConfigs((prev) =>
      prev.map((c) => (c.key === key ? { ...c, value } : c))
    );
  }

  if (configQuery.isLoading) {
    return <p className="text-foreground/50">Loading...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Site Configuration</h1>

      {message && (
        <p className={`text-sm ${message.includes("Failed") ? "text-danger" : "text-success"}`}>
          {message}
        </p>
      )}

      <div className="rounded-xl border border-white/10 bg-card p-6 space-y-6">
        {configs.map((c) => (
          <div key={c.key}>
            <label className="mb-1 block text-sm font-medium">
              {c.key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </label>
            <p className="mb-2 text-xs text-foreground/50">{c.description}</p>

            {typeof c.value === "boolean" ? (
              <div className="flex items-center gap-4">
                <Button
                  onClick={() => handleUpdate(c.key, !c.value)}
                  disabled={updateConfig.isPending}
                  variant={c.value ? "success" : "ghost"}
                  size="lg"
                >
                  {c.value ? "Enabled" : "Disabled"}
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={c.value}
                  onChange={(e) => handleChange(c.key, e.target.value)}
                  className="flex-1 rounded-lg border border-white/10 bg-background px-3 py-2 text-sm"
                />
                <Button
                  onClick={() => handleUpdate(c.key, c.value)}
                  disabled={updateConfig.isPending}
                  size="lg"
                >
                  Save
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
