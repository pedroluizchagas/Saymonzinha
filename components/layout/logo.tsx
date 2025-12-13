import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  variant?: "header" | "footer"
  className?: string
  priority?: boolean
}

export function Logo({ variant = "header", className, priority }: LogoProps) {
  const heightClasses = variant === "header" ? "h-8 md:h-10 lg:h-12" : "h-8"
  const sizes =
    variant === "header"
      ? "(max-width: 640px) 128px, (max-width: 768px) 160px, 200px"
      : "(max-width: 640px) 128px, 180px"

  return (
    <Image
      src="/images/chatgpt-20image-2023-20de-20jun.png"
      alt="Saymon Cell - Assistência Técnica"
      width={200}
      height={70}
      className={cn(heightClasses, "w-auto", className)}
      priority={priority}
      sizes={sizes}
    />
  )
}

