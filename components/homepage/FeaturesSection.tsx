"use client"

import { useRouter } from "next/navigation"
import { useLng } from "@/hooks/useLng"
import FeatureBlock from "./FeatureBlock"

export default function FeaturesSection() {
  const lng = useLng()
  const router = useRouter()

  return (
    <section className="w-full bg-white py-8">
      <div className="mx-auto px-4 md:px-[84px]">
        <div className="text-center mb-6 md:mb-[32px]">
          <h2 className="text-3xl md:text-5xl lg:text-[64px] font-bold md:leading-[108px] text-[#a4c639] mb-2">
            What we offer<span className="text-[#317F5F]">.</span>
          </h2>
          <p className="text-xl md:text-3xl lg:text-[40px] text-[#317F5F] font-bold md:leading-[48px]">
            Learn something new every day
          </p>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-10">
          <FeatureBlock
            title="Read & Write"
            description="Explore articles and blog posts from writers in the community. Share your own knowledge and ideas. Follow your favourite authors and get notified via Telegram."
            buttonText="Go to Blog"
            onClick={() => router.push(`/${lng}/blog`)}
          />
          <FeatureBlock
            title="Play & Compete"
            description="Take a break with our collection of mini games — Snake, Pong, Breakout and more. Score points and climb the leaderboard. Challenge yourself and others."
            buttonText="Play Games"
            onClick={() => router.push(`/${lng}/games`)}
          />
        </div>
      </div>
    </section>
  )
}
