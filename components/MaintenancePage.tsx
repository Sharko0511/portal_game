"use client";

export default function MaintenancePage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <div className="text-6xl">🔧</div>
      <h1 className="text-2xl font-bold text-gray-900">Under Maintenance</h1>
      <p className="text-foreground/60">
        We&apos;re currently performing maintenance. Please check back later.
      </p>
    </div>
  );
}
