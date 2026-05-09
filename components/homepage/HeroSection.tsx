"use client"

import Image from "next/image"
import { useLng } from "@/hooks/useLng"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useClientTranslation } from "@/hooks/useClientTranslation"

export default function HeroSection() {
  const lng = useLng()
  const router = useRouter()
  const { t } = useClientTranslation(lng, "homepage")

  return (
    <section className="w-full bg-brand-hero py-8 md:py-16 flex justify-center">
      <div className="w-full max-w-[1600px] px-4 md:px-21 flex flex-col md:flex-row md:items-start md:gap-10">

        {/* Mobile layout */}
        <div className="flex flex-col md:hidden w-full">
          <h1 className="text-[36px] font-bold text-white leading-tight mb-4">
            {t("hero.title")}<span className="text-brand-dark">.</span>
          </h1>
          <div className="w-full mb-4">
            <Image
              src="/HeroSection.png"
              alt="Study setup with laptop and coffee"
              width={385}
              height={472}
              className="object-cover w-full h-auto rounded-[20px]"
              priority
              unoptimized
            />
          </div>
          <p className="text-sm text-white/90 mb-4"
            dangerouslySetInnerHTML={{ __html: t("hero.description") }}
          />
          <div className="mt-auto">
            <Button
              className="w-full bg-brand-dark hover:bg-brand-dark/90 text-white rounded-full px-6 h-12 text-base font-semibold cursor-pointer"
              onClick={() => router.push(`/${lng}/blog`)}
            >
              {t("hero.button")}
            </Button>
          </div>
        </div>

        {/* Desktop — Text left 70% */}
        <div className="hidden md:flex md:w-[70%] flex-col gap-6">
          <h1 className="md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white md:leading-[1.2]">
            {t("hero.title")}<span className="text-brand-dark">.</span>
          </h1>
          <Button
            className="w-auto self-start text-2xl font-semibold bg-brand-dark hover:bg-brand-dark/90 text-white rounded-full px-8 py-4 h-16 cursor-pointer"
            onClick={() => router.push(`/${lng}/blog`)}
          >
            {t("hero.button")}
          </Button>
          <p className="md:text-lg lg:text-xl text-white/90"
            dangerouslySetInnerHTML={{ __html: t("hero.description") }}
          />
        </div>

        {/* Desktop — Image right 30% */}
        <div className="hidden md:block md:w-[30%]">
          <div className="rounded-[20px] overflow-hidden">
            <Image
              src="/HeroSection.png"
              alt="Study setup with laptop and coffee"
              width={385}
              height={472}
              className="object-cover w-full h-auto"
              priority
              unoptimized
            />
          </div>
        </div>

      </div>
    </section>
  )
}
