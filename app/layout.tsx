import type React from "react"
import type { Metadata, Viewport } from "next"
import { Analytics } from "@vercel/analytics/next"
import { scFontVariables } from "@/components/home/fonts"
import { CartProvider } from "@/contexts/cart-context"
import { APPLE_WEB_APP } from "@/lib/pwa"
import "./globals.css"
// Os tokens e as fontes do sistema visual valem no site inteiro: no painel, no login e nas janelas e
// menus que abrem fora da página (portais). A home e a loja virtual continuam com o próprio .sc.
import "@/components/home/sc-system.css"

export const metadata: Metadata = {
  title: "Saymon Cell | Assistencia Tecnica de Smartphones em Divinopolis",
  description:
    "Consertamos seu smartphone sem voce sair de casa em Divinopolis. Troca de tela, bateria, conector de carga e mais. Servico de busca e entrega. 10 anos de experiencia.",
  keywords: [
    "conserto de celular",
    "assistencia tecnica",
    "Divinopolis",
    "troca de tela",
    "bateria",
    "smartphone",
    "delivery",
    "Jardim dos Candides",
  ],
  authors: [{ name: "Saymon Cell" }],
  openGraph: {
    title: "Saymon Cell | Assistencia Tecnica de Smartphones",
    description: "Consertamos seu smartphone sem voce sair de casa em Divinopolis. Servico de busca e entrega.",
    type: "website",
    locale: "pt_BR",
  },
  icons: {
    icon: [
      { url: "/icons/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { url: "/icons/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/icons/favicon-48x48.png", type: "image/png", sizes: "48x48" },
      { url: "/icons/icon-192x192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", type: "image/png", sizes: "180x180" },
    ],
  },
  appleWebApp: APPLE_WEB_APP,
  manifest: "/manifest.webmanifest",
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "application-name": "Saymon Cell",
    "apple-mobile-web-app-title": "Saymon Cell",
    "msapplication-TileColor": "#000000",
    "msapplication-navbutton-color": "#ff0200",
  },
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ff0200" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark scroll-smooth">
      <body className={`sc ${scFontVariables} font-sans antialiased`}>
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
