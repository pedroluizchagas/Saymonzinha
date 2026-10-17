"use client"

// Cabeçalho do site fora da home (a loja virtual): a marca, o menu da home, o WhatsApp, "Pedir
// orçamento" e o carrinho com a contagem, que pula quando um produto entra. Transparente no topo e com
// fundo depois que a página rola (data-scrolled na moldura). No celular, o menu é compacto, como na Raio-X.

import { Menu, ShoppingBag, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { WHATSAPP_DISPLAY, whatsappLink } from "@/components/home/shared/content"
import { HeaderActions } from "@/components/home/shared/header-actions"

type MenuItem = { label: string; href: string }

export function SiteHeader({
  menu,
  current,
  cartCount,
  onOpenCart,
}: {
  menu: MenuItem[]
  /** Endereço da página aberta, para marcar o item do menu. */
  current: string
  cartCount: number
  onOpenCart: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [menuOpen])

  const link = (item: MenuItem) => (
    <a href={item.href} aria-current={item.href === current ? "page" : undefined} onClick={() => setMenuOpen(false)}>
      {item.label}
    </a>
  )

  return (
    <header className="lv-header">
      <a className="sc-logo" href="/" aria-label="Saymon Cell, página inicial">
        Saymon <b>Cell</b>
        <sup>®</sup>
      </a>
      <nav className="lv-nav" aria-label="Menu">
        {menu.map((item) => (
          <span key={item.href}>{link(item)}</span>
        ))}
      </nav>
      <HeaderActions>
        <button
          type="button"
          className="sc-pill sc-pill--stage sc-pill--sm sc-pill--icon lv-cart"
          aria-label={cartCount === 0 ? "Carrinho vazio" : `Carrinho, ${cartCount} ${cartCount === 1 ? "item" : "itens"}`}
          onClick={onOpenCart}
        >
          <ShoppingBag aria-hidden="true" />
          {cartCount > 0 && (
            // A chave muda com a contagem, para o número pular de novo.
            <span className="lv-cart__count" key={cartCount} aria-hidden="true">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          )}
        </button>
        <button
          ref={menuButtonRef}
          type="button"
          className="sc-pill sc-pill--stage sc-pill--sm sc-pill--icon lv-menu-button"
          aria-expanded={menuOpen}
          aria-controls="lv-menu"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </HeaderActions>
      <nav id="lv-menu" className="lv-menu" aria-label="Menu" hidden={!menuOpen}>
        <ul>
          {menu.map((item) => (
            <li key={item.href}>{link(item)}</li>
          ))}
          {/* Nas telas estreitas, o WhatsApp sai do cabeçalho e fica aqui. */}
          <li>
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer">
              WhatsApp {WHATSAPP_DISPLAY}
            </a>
          </li>
        </ul>
      </nav>
    </header>
  )
}
