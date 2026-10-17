"use client"

// Catálogo da loja virtual (ver GLOSSARY.md e a spec #12), dentro da moldura da loja virtual
// (StoreShell): o letreiro "Loja virtual" dividido como o wordmark da Desdobra, com os fatos da
// retirada, da entrega e do pagamento no meio; a vitrine com os filtros, a busca e a grade, fechada
// por um cartão que leva ao WhatsApp; os passos do pedido de compra e a faixa da retirada e da entrega,
// que só aparecem quando há produto.

import { ArrowUpRight, Search } from "lucide-react"
import { useMemo, useState, type CSSProperties } from "react"
import { ADDRESS, whatsappLink } from "@/components/home/shared/content"
import { catalogFilters, closingSpan, filterCatalog, shouldShowSearch, type CatalogFilter } from "@/lib/catalog"
import type { Product } from "@/types/database"
import { ProductCard } from "./product-card"
import { useAddToCart } from "./store-shell"
import { PurchaseSteps, ReceivingBand } from "./store-sections"

const ASK_MESSAGE = "Olá Saymon Cell! Vi a loja virtual e procuro um acessório que não encontrei lá: "

export function Catalog({ products }: { products: Product[] }) {
  const add = useAddToCart()
  const filters = useMemo(() => catalogFilters(products), [products])
  const searchable = shouldShowSearch(products)
  const [category, setCategory] = useState<CatalogFilter["value"]>("all")
  const [query, setQuery] = useState("")
  const visible = filterCatalog(products, { category, query })

  return (
    <main className="lv-main">
      <Masthead count={products.length} />

      {products.length === 0 ? (
        <section className="lv-empty" aria-label="Loja virtual sem produtos">
          <span className="lv-empty__avatar" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/home/glyph.png" alt="" />
          </span>
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
              Chamar no WhatsApp <ArrowUpRight aria-hidden="true" />
            </a>
            <a className="sc-pill sc-pill--ghost" href="/">
              Ir para a home
            </a>
          </div>
        </section>
      ) : (
        <section className="lv-shelf" aria-labelledby="lv-vitrine">
          <div className="lv-shelf__bar">
            <h2 className="sc-label lv-shelf__title" id="lv-vitrine">
              Vitrine{" "}
              <span className="lv-muted lv-shelf__count" data-filtered={category !== "all" || query ? "1" : undefined}>
                · {visible.length === 1 ? "1 produto" : `${visible.length} produtos`}
              </span>
            </h2>
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

          {visible.length > 0 ? (
            <ul className="lv-grid">
              {visible.map((product, i) => (
                <li key={product.id}>
                  <ProductCard product={product} index={i} onAdd={add} eager={i < 4} />
                </li>
              ))}
              <li
                className="lv-ask"
                style={
                  {
                    "--span-2": closingSpan(visible.length, 2),
                    "--span-3": closingSpan(visible.length, 3),
                    "--span-4": closingSpan(visible.length, 4),
                    "--span-5": closingSpan(visible.length, 5),
                  } as CSSProperties
                }
              >
                <p className="sc-label">Não achou?</p>
                <p className="sc-display lv-ask__title">Procura outro modelo?</p>
                <p className="sc-body lv-ask__text">
                  Pergunte pelo WhatsApp pela capinha, pelo carregador ou pelo fone do seu aparelho.
                </p>
                <a className="sc-pill sc-pill--white lv-ask__link" href={whatsappLink(ASK_MESSAGE)} target="_blank" rel="noopener noreferrer">
                  <span className="lv-ask__long">Perguntar no WhatsApp</span>
                  <span className="lv-ask__short">Perguntar</span> <ArrowUpRight aria-hidden="true" />
                </a>
              </li>
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
        </section>
      )}

      {/* Sem produto, não há pedido de compra para explicar. */}
      {products.length > 0 && (
        <>
          <PurchaseSteps />
          <ReceivingBand />
        </>
      )}
    </main>
  )
}

/** O título da página, em duas partes como na home, e os fatos de como comprar. */
function Masthead({ count }: { count: number }) {
  return (
    <section className="lv-mast">
      <div className="lv-mast__mat" aria-hidden="true" />
      <div className="lv-mast__stage">
        <h1 className="lv-mast__title">
          <span className="sc-label lv-mast__kicker">Acessórios para celular em Divinópolis</span>{" "}
          <span className="lv-mast__words">
            <span className="lv-mast__word">Loja</span>{" "}
            <span className="lv-mast__word lv-mast__word--red">virtual</span>
          </span>
        </h1>
        {count > 0 && (
          <p className="sc-label lv-mast__count">{count === 1 ? "1 produto em estoque" : `${count} produtos em estoque`}</p>
        )}
        <dl className="lv-facts">
          <div>
            <dt className="sc-label">Retirada</dt>
            <dd>Na loja, {ADDRESS.street}</dd>
          </div>
          <div>
            <dt className="sc-label">Entrega</dt>
            <dd>Consulte disponibilidade e valor</dd>
          </div>
          <div>
            <dt className="sc-label">Pagamento</dt>
            <dd>Combinado pelo WhatsApp</dd>
          </div>
        </dl>
        <p className="sc-body lv-mast__lead">
          Capinhas, carregadores, fones e caixinhas de som. Escolha aqui e envie o pedido de compra pelo WhatsApp.
        </p>
      </div>
    </section>
  )
}
