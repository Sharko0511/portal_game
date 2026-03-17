"use client";

import { useRouter } from "next/navigation";
import { useLng } from "@/hooks/useLng";
import { useClientTranslation } from "@/hooks/useClientTranslation";
import FeatureBlock from "./FeatureBlock";

export default function FeaturesSection() {
  const lng = useLng();
  const router = useRouter();
  const { t } = useClientTranslation(lng, "homepage_features");

  return (
    <section className="w-full bg-background py-8">
      <div className="mx-auto px-4 md:px-21">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-[40px] md:text-5xl lg:text-[64px] font-bold md:leading-27 text-[#a4c639] mb-2">
            {t("title")}
            <span className="text-[#317F5F]">.</span>
          </h2>
          <p className="text-[24px] md:text-3xl lg:text-[40px] text-[#317F5F] font-bold md:leading-12">
            {t("subtitle")}
          </p>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-10">
          <FeatureBlock
            title={t("blog.title")}
            description={t("blog.description")}
            buttonText={t("blog.button")}
            onClick={() => router.push(`/${lng}/blog`)}
          />
          <FeatureBlock
            title={t("games.title")}
            description={t("games.description")}
            buttonText={t("games.button")}
            onClick={() => router.push(`/${lng}/games`)}
          />
        </div>
      </div>
    </section>
  );
}
