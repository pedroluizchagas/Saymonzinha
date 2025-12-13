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
  title: "Saymon Cell | Assistência Técnica de Smartphones em Divinópolis",
  description:
    "Consertamos seu smartphone sem você sair de casa em Divinópolis. Troca de tela, bateria, conector de carga e mais. Serviço de busca e entrega. 3 anos de experiência.",
  keywords: [
    "conserto de celular",
    "assistência técnica",
    "Divinópolis",
    "troca de tela",
    "bateria",
    "smartphone",
    "delivery",
    "Jardim dos Candidés",
  ],
  authors: [{ name: "Saymon Cell" }],
  openGraph: {
    title: "Saymon Cell | Assistência Técnica de Smartphones",
    description: "Consertamos seu smartphone sem você sair de casa em Divinópolis. Serviço de busca e entrega.",
    type: "website",
    locale: "pt_BR",
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: "#ff0200",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="dark scroll-smooth">
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
