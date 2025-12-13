"use client"

import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Phone, Menu, X } from "lucide-react"
import { CartButton } from "@/components/store/cart-button"
import { useState } from "react"

export function Header() {
  const pathname = usePathname()
  const isStorePage = pathname === "/loja"
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/chatgpt-20image-2023-20de-20jun.png"
            alt="Saymon Cell - Assistência Técnica"
            width={180}
            height={60}
            className="h-12 w-auto"
            priority
          />
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

          <Button asChild className="hidden sm:flex bg-accent hover:bg-accent/90 text-accent-foreground">
            <a
              href="https://wa.me/5537999220892?text=Olá%20Saymon%20Cell%2C%20vi%20o%20site%20e%20gostaria%20de%20um%20orçamento%20para..."
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone className="w-4 h-4 mr-2" />
              Orçamento
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
