"use client"

// WhatsApp e "Pedir orçamento" do cabeçalho, iguais nas duas versões da home e na loja virtual.
// Os botões próprios de cada página (menu, carrinho) entram no fim.

import { ArrowUpRight, MessageCircle } from "lucide-react"
import type { ReactNode } from "react"
import { whatsappLink } from "./content"
import { useQuoteRequest } from "./quote-dialog"

export function HeaderActions({ children }: { children?: ReactNode }) {
  const quote = useQuoteRequest()
  return (
    <div className="sc-header-actions">
      <a
        className="sc-pill sc-pill--stage sc-pill--sm sc-pill--icon"
        href={whatsappLink()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chamar no WhatsApp"
      >
        <MessageCircle aria-hidden="true" />
      </a>
      <button type="button" className="sc-pill sc-pill--red sc-pill--sm" onClick={() => quote.open()}>
        Pedir orçamento <ArrowUpRight />
      </button>
      {children}
    </div>
  )
}
