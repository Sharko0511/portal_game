"use client";

import { useSiteStatus } from "@/hooks/useSiteStatus";
import HeroSection from "@/components/homepage/HeroSection";
import FeaturesSection from "@/components/homepage/FeaturesSection";

export default function HomePage() {
  const statusQuery = useSiteStatus();

  if (statusQuery.data?.maintenance_mode) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-6xl">🔧</div>
          <h1 className="mb-2 text-2xl font-bold">Under Maintenance</h1>
          <p className="text-gray-500">We are making some improvements. Please check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeroSection />
      <FeaturesSection />
    </>
  );
}
