"use client"

// Moldura das páginas da loja virtual (o catálogo e a página de cada produto): o cabeçalho do site,
// a janela do pedido de orçamento, o carrinho, o rodapé da home e os avisos. As páginas adicionam
// produtos pelo useAddToCart, que põe no carrinho e avisa. Ao abrir a página e ao abrir o carrinho, o
// carrinho guardado é conferido com o banco.

import "@/components/home/sc-system.css"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { siteMenu } from "@/components/home/shared/content"
import { HomeFooter } from "@/components/home/shared/home-footer"
import { QuoteRequestProvider } from "@/components/home/shared/quote-dialog"
import { useModalLayout } from "@/components/home/shared/use-modal-layout"
import { useCart } from "@/contexts/cart-context"
import { getPublishedProducts } from "@/lib/actions/store-actions"
import { STORE_PATH } from "@/lib/catalog"
import { reconcileCart } from "@/lib/purchase-request"
import type { Product } from "@/types/database"
import { CartDialog } from "./cart-dialog"
import { SiteHeader } from "./site-header"
import { StoreNotification, type StoreNotice } from "./store-notification"
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
  const [notice, setNotice] = useState<{ notice: StoreNotice | null; signal: number }>({ notice: null, signal: 0 })
  const [cartOpen, setCartOpen] = useState(false)
  const [published, setPublished] = useState<Product[] | null>(null)
  const [removed, setRemoved] = useState<string[]>([])

  const notify = useCallback((next: StoreNotice) => setNotice((last) => ({ notice: next, signal: last.signal + 1 })), [])

  // Só uma leitura que deu certo conta: se o banco não respondeu, o carrinho fica como está.
  const refresh = useCallback(() => {
    getPublishedProducts().then((list) => list && setPublished(list), () => {})
  }, [])
  useEffect(refresh, [refresh])

  // Confere o carrinho guardado com o banco e avisa na hora se algum produto saiu da loja virtual.
  useEffect(() => {
    if (!published || !isHydrated || items.length === 0) return
    const check = reconcileCart(items, published)
    if (!check.changed) return
    replaceItems(check.items)
    if (check.removed.length === 0) return
    setRemoved((last) => [...new Set([...last, ...check.removed])])
    notify({
      title: check.removed.length === 1 ? "1 produto saiu da loja virtual" : `${check.removed.length} produtos saíram da loja virtual`,
      detail: check.removed.join(", "),
      tone: "info",
    })
  }, [published, isHydrated, items, replaceItems, notify])

  const add = useCallback<AddToCart>(
    (product, quantity = 1) => {
      // Avisa com a notificação, sem abrir o carrinho, e não promete mais do que há em estoque.
      const room = product.stock_quantity - (items.find((i) => i.product.id === product.id)?.quantity ?? 0)
      if (room <= 0) {
        notify({ title: "Todas as unidades já estão no carrinho", detail: product.name, tone: "info" })
        return
      }
      addItem(product, Math.min(quantity, room))
      notify({
        title: quantity > room ? `Só ${room} ${room === 1 ? "unidade adicionada" : "unidades adicionadas"}: é o que há em estoque` : "Adicionado ao carrinho",
        detail: product.name,
        tone: "done",
      })
    },
    [addItem, items, notify],
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
          <StoreNotification notice={notice.notice} signal={notice.signal} />
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
