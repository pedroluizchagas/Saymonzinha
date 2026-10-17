"use client"

// Moldura das páginas da loja virtual (o catálogo e a página de cada produto): o cabeçalho do site,
// a janela do pedido, o rodapé da home e a notificação "Adicionado ao carrinho". As páginas adicionam
// produtos pelo useAddToCart, que põe no carrinho e avisa.

import "@/components/home/sc-system.css"
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react"
import { siteMenu } from "@/components/home/shared/content"
import { HomeFooter } from "@/components/home/shared/home-footer"
import { QuoteRequestProvider } from "@/components/home/shared/quote-dialog"
import { useModalLayout } from "@/components/home/shared/use-modal-layout"
import { useCart } from "@/contexts/cart-context"
import { STORE_PATH } from "@/lib/catalog"
import type { Product } from "@/types/database"
import { AddedNotification } from "./added-notification"
import { SiteHeader } from "./site-header"
import "./loja.css"

type AddToCart = (product: Product, quantity?: number) => void

const AddToCartContext = createContext<AddToCart | null>(null)

export function useAddToCart() {
  const add = useContext(AddToCartContext)
  if (!add) throw new Error("useAddToCart precisa estar dentro de StoreShell")
  return add
}

export function StoreShell({ children }: { children: ReactNode }) {
  const cart = useCart()
  const { addItem } = cart
  const quoteLayout = useModalLayout("center")
  const menu = useMemo(() => siteMenu(STORE_PATH), [])
  const [added, setAdded] = useState({ name: "", signal: 0 })

  const add = useCallback<AddToCart>(
    (product, quantity = 1) => {
      // A loja virtual nova avisa com a notificação, sem abrir o carrinho.
      addItem(product, quantity, { open: false })
      setAdded((last) => ({ name: product.name, signal: last.signal + 1 }))
    },
    [addItem],
  )

  return (
    <QuoteRequestProvider layout={quoteLayout}>
      <AddToCartContext.Provider value={add}>
        <div className="sc lv">
          <SiteHeader
            menu={menu}
            current={STORE_PATH}
            cartCount={cart.getItemCount()}
            // Até a janela nova do carrinho (#16), abre o carrinho atual.
            onOpenCart={() => cart.setIsOpen(true)}
          />
          {children}
          <footer className="lv-footer">
            <HomeFooter menu={menu} />
          </footer>
          <AddedNotification name={added.name} signal={added.signal} />
        </div>
      </AddToCartContext.Provider>
    </QuoteRequestProvider>
  )
}
