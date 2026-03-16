"use client"

import { Button } from "@/components/ui/button"

interface FeatureBlockProps {
  title: string
  description: string
  buttonText: string
  onClick?: () => void
}

export default function FeatureBlock({ title, description, buttonText, onClick }: FeatureBlockProps) {
  return (
    <div className="p-4 md:p-[32px] border border-[#225D2D] rounded-[20px] flex flex-col h-auto">
      <h3 className="text-2xl md:text-4xl lg:text-[48px] font-bold mb-3 md:mb-[32px] text-[#262626]">{title}</h3>
      <div className="mb-3 md:mb-[32px] text-sm md:text-base">
        <p className="text-[#262626] leading-relaxed font-medium">{description}</p>
      </div>
      <div className="w-full">
        <Button
          className="w-full md:w-auto text-base md:text-[24px] bg-[#317F5F] hover:bg-[#317F5F]/90 text-white rounded-full px-6 py-1.5 h-11 md:py-4 md:h-16 cursor-pointer"
          onClick={onClick}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  )
}
