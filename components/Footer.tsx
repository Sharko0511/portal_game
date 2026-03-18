"use client"

import Link from "next/link"
import { useLng } from "@/hooks/useLng"
import { useClientTranslation } from "@/hooks/useClientTranslation"
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export default function Footer() {
  const lng = useLng()
  const { t } = useClientTranslation(lng, "footer")
  const { t: tc } = useClientTranslation(lng, "common")
  const year = new Date().getFullYear()

  return (
    <footer className="bg-brand-footer text-white py-14 pb-8 mt-0">
      <div className="w-full px-4 md:px-21">
        <div className="flex flex-col md:flex-row mb-20 md:gap-10">
          {/* Left block - exactly 50% width */}
          <div className="mb-8 md:mb-0 md:w-1/2">
            <h2 className="text-3xl font-bold mb-6">
              The Good Learning<span className="text-white">.</span>
            </h2>
            <div className="">
              <h3 className="text-sm font-medium mb-4">{t("social.follow")}</h3>
              <div className="flex space-x-4">
                <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                  className="text-white hover:text-white/80 transition-colors" aria-label="Facebook">
                  <Facebook size={20} />
                </Link>
                <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                  className="text-white hover:text-white/80 transition-colors" aria-label="Twitter">
                  <Twitter size={20} />
                </Link>
                <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                  className="text-white hover:text-white/80 transition-colors" aria-label="Instagram">
                  <Instagram size={20} />
                </Link>
                <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                  className="text-white hover:text-white/80 transition-colors" aria-label="YouTube">
                  <Youtube size={20} />
                </Link>
              </div>
            </div>
          </div>

          {/* Right block - exactly 50% width */}
          <div className="md:w-1/2">
            <h3 className="text-xl font-bold mb-4">{t("about.title")}</h3>
            <p className="text-white/90 leading-relaxed" dangerouslySetInnerHTML={{ __html: t("about.description") }} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <p className="text-white/70">{t("copyright")}</p>
          </div>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href={`/${lng}`} className="text-white hover:text-white/80">{tc("navigation.home")}</Link>
            <Link href={`/${lng}/blog`} className="text-white hover:text-white/80">{tc("navigation.blog")}</Link>
            <Link href={`/${lng}/audio`} className="text-white hover:text-white/80">{tc("navigation.audio")}</Link>
            <Link href={`/${lng}/games`} className="text-white hover:text-white/80">{tc("navigation.games")}</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
