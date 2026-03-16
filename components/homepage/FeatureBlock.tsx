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
    <div className="p-4 md:p-8 border border-[#225D2D] rounded-[20px] flex flex-col h-full">
      <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-8 text-foreground">{title}</h3>
      <div className="mb-3 md:mb-8 text-sm md:text-base">
        <p className="text-foreground leading-relaxed font-medium">{description}</p>
      </div>
      <div className="w-full mt-auto">
        <Button
          className="w-full md:w-auto text-2xl font-semibold bg-[#225D2D] hover:bg-[#225D2D]/90 text-white rounded-full px-8 py-4 h-16 cursor-pointer"
          onClick={onClick}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  )
}
