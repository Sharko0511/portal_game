"use client"

import Image from "next/image"
import { useLng } from "@/hooks/useLng"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function HeroSection() {
  const lng = useLng()
  const router = useRouter()

  return (
    <section className="w-full bg-[#a4c639] py-4 md:py-[64px]">
      <div className="mx-auto px-4 md:px-[84px] flex flex-col md:flex-row md:items-stretch md:gap-[44px]">

        {/* Mobile layout */}
        <div className="flex flex-col md:hidden w-full">
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Learn. Share.{" "}
            <span className="whitespace-nowrap">
              Grow Together<span className="text-[#317F5F] inline-block">.</span>
            </span>
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
          <p className="text-sm text-white/90 mb-4">
            A place to read, write, and discuss ideas. Follow writers you love and get notified when they post.
          </p>
          <div className="mt-auto">
            <Button
              className="w-full bg-[#317F5F] hover:bg-[#317F5F]/90 text-white rounded-full px-6 py-1.5 h-11 text-base cursor-pointer"
              onClick={() => router.push(`/${lng}/blog`)}
            >
              Read the Blog
            </Button>
          </div>
        </div>

        {/* Desktop — Text left 70% */}
        <div className="hidden md:flex md:w-[70%] flex-col justify-between">
          <div>
            <h1 className="md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white md:leading-[1.2] mb-6">
              Learn. Share.{" "}
              <span className="whitespace-nowrap">
                Grow Together<span className="text-[#317F5F] inline-block">.</span>
              </span>
            </h1>
          </div>
          <div className="mb-6">
            <Button
              className="w-auto text-xl bg-[#317F5F] hover:bg-[#317F5F]/90 text-white rounded-full px-8 py-4 h-14 cursor-pointer"
              onClick={() => router.push(`/${lng}/blog`)}
            >
              Read the Blog
            </Button>
          </div>
          <div>
            <p className="md:text-lg lg:text-xl text-white/90">
              A place to read, write, and discuss ideas. Follow writers you love and get notified when they post.
            </p>
          </div>
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
