import type React from "react"
import type { Metadata } from "next"
import { SWRegister } from "@/components/pwa/sw-register"

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Saymon Cell Admin",
  },
  manifest: "/manifest.webmanifest",
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      {children}
      <SWRegister />
    </div>
  )
}
