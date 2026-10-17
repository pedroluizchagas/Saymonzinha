"use client"

// Catálogo da loja virtual nova (ver GLOSSARY.md e a spec #12): o título, os filtros, a busca e a
// grade de produtos, dentro da moldura da loja virtual (StoreShell).

import { ArrowUpRight, Search } from "lucide-react"
import { useMemo, useState } from "react"
import { whatsappLink } from "@/components/home/shared/content"
import { catalogFilters, filterCatalog, shouldShowSearch, type CatalogFilter } from "@/lib/catalog"
import type { Product } from "@/types/database"
import { ProductCard } from "./product-card"
import { useAddToCart } from "./store-shell"

export function Catalog({ products }: { products: Product[] }) {
  const add = useAddToCart()
  const filters = useMemo(() => catalogFilters(products), [products])
  const searchable = shouldShowSearch(products)
  const [category, setCategory] = useState<CatalogFilter["value"]>("all")
  const [query, setQuery] = useState("")
  const visible = filterCatalog(products, { category, query })

  return (
    <main className="lv-main">
      <h1 className="lv-title">
        <span className="sc-label lv-title__kicker">Acessórios para celular em Divinópolis</span>{" "}
        <span className="sc-display lv-title__name">Loja virtual</span>
      </h1>
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
          <p className="sc-body lv-intro">
            Capinhas, carregadores, fones e caixinhas de som. Retire na loja ou receba em casa (consulte disponibilidade e
            valor para sua região).
          </p>
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
  )
}
