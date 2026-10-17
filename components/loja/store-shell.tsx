"use client"

// Moldura das páginas da loja virtual (o catálogo e a página de cada produto): o cabeçalho do site,
// a janela do pedido, o carrinho, o rodapé da home e a notificação "Adicionado ao carrinho". As
// páginas adicionam produtos pelo useAddToCart, que põe no carrinho e avisa. Ao abrir a página e ao
// abrir o carrinho, o carrinho guardado é conferido com o banco.

import "@/components/home/sc-system.css"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { siteMenu } from "@/components/home/shared/content"
import { HomeFooter } from "@/components/home/shared/home-footer"
import { QuoteRequestProvider } from "@/components/home/shared/quote-dialog"
import { useModalLayout } from "@/components/home/shared/use-modal-layout"
import { useCart } from "@/contexts/cart-context"
import { getPublishedProducts } from "@/lib/actions/store-actions"
import { STORE_PATH } from "@/lib/catalog"
import { checkPurchaseRequest } from "@/lib/purchase-request"
import type { Product } from "@/types/database"
import { AddedNotification } from "./added-notification"
import { CartDialog } from "./cart-dialog"
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
  const { addItem, items, isHydrated, replaceItems } = cart
  const quoteLayout = useModalLayout("center")
  const cartLayout = useModalLayout("side")
  const menu = useMemo(() => siteMenu(STORE_PATH), [])
  const [added, setAdded] = useState({ name: "", signal: 0 })
  const [cartOpen, setCartOpen] = useState(false)
  const [published, setPublished] = useState<Product[] | null>(null)
  const [removed, setRemoved] = useState<string[]>([])

  const refresh = useCallback(() => {
    getPublishedProducts().then(setPublished, () => {})
  }, [])
  useEffect(refresh, [refresh])

  // Confere o carrinho guardado com o banco: preço atual, quantidade até o estoque e sem os produtos
  // que saíram. Só troca os itens quando algo mudou.
  useEffect(() => {
    if (!published || !isHydrated || items.length === 0) return
    const check = checkPurchaseRequest(items, published, "retirada")
    const now = check.items.map(({ product, quantity }) => ({ product, quantity }))
    const key = (list: typeof now) => JSON.stringify(list.map((i) => [i.product.id, i.quantity, i.product.sale_price, i.product.stock_quantity]))
    if (key(now) === key(items)) return
    replaceItems(now)
    if (check.removed.length) setRemoved((last) => [...new Set([...last, ...check.removed])])
  }, [published, isHydrated, items, replaceItems])

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
            onOpenCart={() => {
              refresh()
              setCartOpen(true)
            }}
          />
          {children}
          <footer className="lv-footer">
            <HomeFooter menu={menu} />
          </footer>
          <AddedNotification name={added.name} signal={added.signal} />
          <CartDialog
            open={cartOpen}
            onClose={() => {
              setCartOpen(false)
              setRemoved([])
            }}
            layout={cartLayout}
            published={published}
            removed={removed}
          />
        </div>
      </AddToCartContext.Provider>
    </QuoteRequestProvider>
  )
}
