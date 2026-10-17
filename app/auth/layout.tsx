import type React from "react"
import type { Metadata, Viewport } from "next"
import { SWRegister } from "@/components/pwa/sw-register"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { APPLE_WEB_APP, PWA_THEME_COLOR } from "@/lib/pwa"

export const metadata: Metadata = {
  title: "Entrar | Painel Saymon Cell",
  appleWebApp: APPLE_WEB_APP,
  manifest: "/manifest.webmanifest",
}

// A barra do navegador e a do app instalado no preto do palco, como o painel.
export const viewport: Viewport = {
  themeColor: PWA_THEME_COLOR,
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen-safe safe-area-top safe-area-bottom safe-area-x">
      {children}
      <SWRegister />
      <InstallPrompt />
    </div>
  )
}
