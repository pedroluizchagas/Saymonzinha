import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { CartProvider } from "@/contexts/cart-context"
import { CartDrawer } from "@/components/store/cart-drawer"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  title: "Saymon Cell | Assistencia Tecnica de Smartphones em Divinopolis",
  description:
    "Consertamos seu smartphone sem voce sair de casa em Divinopolis. Troca de tela, bateria, conector de carga e mais. Servico de busca e entrega. 3 anos de experiencia.",
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
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Saymon Cell",
    startupImage: [
      {
        url: "/images/logo.png",
        media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/images/logo.png",
        media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/images/logo.png",
        media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/images/logo.png",
        media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/images/logo.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)",
      },
      {
        url: "/images/logo.png",
        media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)",
      },
      {
        url: "/images/logo.png",
        media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
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
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        {/* Detecta iOS antes do primeiro paint para desabilitar safe-area */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var u=navigator.userAgent||'';if(/iPad|iPhone|iPod/.test(u)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1))document.documentElement.classList.add('is-ios')})()`,
          }}
        />
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
