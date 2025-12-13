"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Phone, Menu, X } from "lucide-react"
import { CartButton } from "@/components/store/cart-button"
import { useState } from "react"
import { Logo } from "@/components/layout/logo"

export function Header() {
  const pathname = usePathname()
  const isStorePage = pathname === "/loja"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-2 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo variant="header" priority />
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/#servicos"
            className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
          >
            Serviços
          </Link>
          <Link
            href="/#como-funciona"
            className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
          >
            Como Funciona
          </Link>
          <Link
            href="/loja"
            className={`text-sm font-medium transition-colors ${
              isStorePage ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
          >
            Loja
          </Link>
          <Link
            href="/#localizacao"
            className="text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
          >
            Localização
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <CartButton />

          <Button
            asChild
            variant="outline"
            className="hidden sm:flex bg-transparent hover:bg-transparent border border-transparent"
          >
            <a
              href="https://wa.me/5537999220892?text=Olá%20Saymon%20Cell%2C%20vi%20o%20site%20e%20gostaria%20de%20um%20orçamento%20para..."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                borderImage:
                  "linear-gradient(90deg, #ff4d4f 0%, #ff0200 60%, #b00000 100%) 1",
              }}
              className="inline-flex items-center px-4 py-2 rounded-full border border-transparent"
            >
              <svg
                className="w-4 h-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                stroke="url(#gradPhone)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <defs>
                  <linearGradient id="gradPhone" x1="0" y1="0" x2="24" y2="0">
                    <stop offset="0%" stopColor="#ff4d4f" />
                    <stop offset="60%" stopColor="#ff0200" />
                    <stop offset="100%" stopColor="#b00000" />
                  </linearGradient>
                </defs>
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.03.86.19 1.72.47 2.54a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.54-1.54a2 2 0 0 1 2.11-.45c.82.28 1.68.44 2.54.47A2 2 0 0 1 22 16.92" />
              </svg>
              <span className="font-semibold text-primary">Orçamento</span>
            </a>
          </Button>

          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden bg-background border-t border-border px-4 py-4 space-y-3">
          <Link
            href="/#servicos"
            className="block text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Serviços
          </Link>
          <Link
            href="/#como-funciona"
            className="block text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Como Funciona
          </Link>
          <Link
            href="/loja"
            className={`block text-sm font-medium transition-colors ${
              isStorePage ? "text-primary" : "text-muted-foreground hover:text-primary"
            }`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Loja
          </Link>
          <Link
            href="/#localizacao"
            className="block text-muted-foreground hover:text-primary transition-colors text-sm font-medium"
            onClick={() => setMobileMenuOpen(false)}
          >
            Localização
          </Link>
          <a
            href="https://wa.me/5537999220892?text=Olá%20Saymon%20Cell%2C%20vi%20o%20site%20e%20gostaria%20de%20um%20orçamento%20para..."
            target="_blank"
            rel="noopener noreferrer"
            className="block text-accent font-medium text-sm"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Phone className="w-4 h-4 inline mr-2" />
            Solicitar Orçamento
          </a>
        </nav>
      )}
    </header>
  )
}
