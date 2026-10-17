"use client"

// Loja virtual nova (ver GLOSSARY.md e a spec #12): o catálogo no sistema visual da home, numa versão
// só para todos os aparelhos. O carrinho é o do site inteiro.

import "@/components/home/sc-system.css"
import { ArrowUpRight, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { siteMenu, whatsappLink } from "@/components/home/shared/content"
import { HomeFooter } from "@/components/home/shared/home-footer"
import { QuoteRequestProvider } from "@/components/home/shared/quote-dialog"
import { useModalLayout } from "@/components/home/shared/use-modal-layout"
import { useCart } from "@/contexts/cart-context"
import { STORE_PATH, catalogFilters, filterCatalog, shouldShowSearch, type CatalogFilter } from "@/lib/catalog"
import type { Product } from "@/types/database"
import { AddedNotification } from "./added-notification"
import { ProductCard } from "./product-card"
import { SiteHeader } from "./site-header"
import "./loja.css"

export function LojaVirtual({ products }: { products: Product[] }) {
  const cart = useCart()
  const quoteLayout = useModalLayout("center")
  const menu = useMemo(() => siteMenu(STORE_PATH), [])
  const filters = useMemo(() => catalogFilters(products), [products])
  const searchable = shouldShowSearch(products)
  const [category, setCategory] = useState<CatalogFilter["value"]>("all")
  const [query, setQuery] = useState("")
  const visible = filterCatalog(products, { category, query })
  const [added, setAdded] = useState({ name: "", signal: 0 })

  const add = (product: Product) => {
    cart.addItem(product, 1, { open: false })
    setAdded((last) => ({ name: product.name, signal: last.signal + 1 }))
  }

  return (
    <QuoteRequestProvider layout={quoteLayout}>
      <div className="sc lv">
        <SiteHeader
          menu={menu}
          current={STORE_PATH}
          cartCount={cart.getItemCount()}
          // Até a janela nova do carrinho (#16), abre o carrinho atual.
          onOpenCart={() => cart.setIsOpen(true)}
        />

        <main className="lv-main">
          <h1 className="lv-title">
            <span className="sc-label lv-title__kicker">Acessórios para celular em Divinópolis</span>{" "}
            <span className="sc-display lv-title__name">Loja virtual</span>
          </h1>
          <p className="sc-body lv-intro">
            Capinhas, carregadores, fones e caixinhas de som. Retire na loja ou receba em casa.
          </p>

          {products.length === 0 ? (
            <section className="lv-empty" aria-label="Loja virtual sem produtos">
              <p className="sc-body">
                Ainda não há produtos publicados na loja virtual. Fale com a loja pelo WhatsApp para saber o que tem
                disponível.
              </p>
              <div className="lv-empty__actions">
                <a
                  className="sc-pill sc-pill--red"
                  href={whatsappLink("Olá Saymon Cell! Vi a loja virtual e quero saber dos produtos disponíveis.")}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Chamar no WhatsApp <ArrowUpRight />
                </a>
                <a className="sc-pill sc-pill--ghost" href="/">
                  Ir para a home
                </a>
              </div>
            </section>
          ) : (
            <>
              {(filters.length > 0 || searchable) && (
                <div className="lv-controls">
                  {filters.length > 0 && (
                    <div className="lv-filters" role="group" aria-label="Categorias">
                      {filters.map((filter) => (
                        <button
                          key={filter.value}
                          type="button"
                          className="sc-pill sc-pill--sm lv-filter"
                          aria-pressed={category === filter.value}
                          onClick={() => setCategory(filter.value)}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {searchable && (
                    <label className="lv-search">
                      <span className="sc-sr">Buscar na loja virtual</span>
                      <Search aria-hidden="true" />
                      <input
                        type="search"
                        placeholder="Buscar produto"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                      />
                    </label>
                  )}
                </div>
              )}

              {visible.length > 0 ? (
                <ul className="lv-grid">
                  {visible.map((product, i) => (
                    <li key={product.id}>
                      <ProductCard product={product} onAdd={add} eager={i < 4} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="sc-body lv-none">
                  Nenhum produto encontrado.{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setCategory("all")
                      setQuery("")
                    }}
                  >
                    Ver todos
                  </button>
                </p>
              )}
            </>
          )}
        </main>

        <footer className="lv-footer">
          <HomeFooter menu={menu} />
        </footer>

        <AddedNotification name={added.name} signal={added.signal} />
      </div>
    </QuoteRequestProvider>
  )
}
