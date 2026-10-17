"use client"

// Página de um produto da loja virtual (endereço no ADR 0002): a foto grande numa moldura de bancada,
// com a legenda "Fig. 01" das ilustrações da home; a categoria e o estoque, o nome, o preço, a
// descrição, a quantidade, "Adicionar ao carrinho" e "Perguntar no WhatsApp"; a ficha de como receber
// e pagar; e outros produtos da vitrine. No celular, quando o botão de comprar sai da tela, uma barra
// fixa embaixo o traz de volta. Esgotado, a página continua, com o aviso e a pergunta de quando chega.

import { ArrowLeft, MessageCircle } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { ADDRESS, HOURS, whatsappLink } from "@/components/home/shared/content"
import { STORE_PATH, categoryName, isSoldOut, stockBadge } from "@/lib/catalog"
import type { Product } from "@/types/database"
import { Price } from "./price"
import { ProductCard } from "./product-card"
import { QuantityStepper } from "./quantity-stepper"
import { useAddToCart } from "./store-shell"

export function ProductDetail({ product, url, related }: { product: Product; url: string; related: Product[] }) {
  const add = useAddToCart()
  const badge = stockBadge(product)
  const soldOut = isSoldOut(product)
  const [quantity, setQuantity] = useState(1)
  const buyRef = useRef<HTMLDivElement>(null)
  const [buyInView, setBuyInView] = useState(true)
  const question = soldOut
    ? `Olá Saymon Cell! O produto ${product.name} está esgotado na loja virtual. Quando chega? ${url}`
    : `Olá Saymon Cell! Tenho uma dúvida sobre este produto da loja virtual: ${product.name} ${url}`

  // A barra fixa aparece enquanto o botão de comprar está fora da tela.
  useEffect(() => {
    const buy = buyRef.current
    if (!buy) return
    const observer = new IntersectionObserver(([entry]) => setBuyInView(entry.isIntersecting))
    observer.observe(buy)
    return () => observer.disconnect()
  }, [])

  return (
    <main className="lv-main">
      <nav className="sc-label lv-crumbs" aria-label="Caminho">
        <a href={STORE_PATH}>
          <ArrowLeft aria-hidden="true" /> Loja virtual
        </a>
        <span aria-hidden="true">/</span>
        <span>{categoryName(product)}</span>
      </nav>

      <div className="lv-pd__grid">
        <figure className="lv-pd__media">
          <div className="lv-photo lv-pd__photo" data-empty={product.image_url ? undefined : "1"}>
            {product.image_url ? (
              <img src={product.image_url} alt={product.name} width={1200} height={1200} />
            ) : (
              <img src="/home/glyph.png" alt="" aria-hidden="true" />
            )}
            <span className="lv-pd__marks" aria-hidden="true" />
            {badge && <span className="sc-label lv-badge">{badge}</span>}
          </div>
          <figcaption className="sc-label lv-pd__caption">Fig. 01 · {product.name}</figcaption>
        </figure>

        <div className="lv-pd__info">
          <p className="sc-label lv-pd__meta">
            {categoryName(product)} ·{" "}
            <span className="lv-pd__stock" data-stock={soldOut ? "out" : badge ? "few" : "ok"}>
              {badge ?? "Em estoque"}
            </span>
          </p>
          <h1 className="sc-display lv-pd__name">{product.name}</h1>
          <Price value={product.sale_price} className="lv-pd__price" />
          {product.description && <p className="sc-body lv-pd__description">{product.description}</p>}

          <div className="lv-pd__actions" ref={buyRef}>
            {!soldOut && (
              <div className="lv-pd__buy">
                <QuantityStepper value={quantity} max={product.stock_quantity} onChange={setQuantity} label="Quantidade" />
                <button type="button" className="sc-pill sc-pill--red lv-pd__add" onClick={() => add(product, quantity)}>
                  Adicionar ao carrinho
                </button>
              </div>
            )}
            <a
              className={soldOut ? "sc-pill sc-pill--red lv-pd__ask" : "sc-pill sc-pill--ghost lv-pd__ask"}
              href={whatsappLink(question)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle aria-hidden="true" /> {soldOut ? "Perguntar no WhatsApp quando chega" : "Perguntar no WhatsApp"}
            </a>
          </div>

          <dl className="lv-pd__facts">
            <div>
              <dt className="sc-label">Retirada</dt>
              <dd>
                Na loja, {ADDRESS.street}, {ADDRESS.unit} · {HOURS.map((h) => `${h.days.toLowerCase()}, ${h.time}`).join("; ")}
              </dd>
            </div>
            <div>
              <dt className="sc-label">Entrega</dt>
              <dd>Consulte disponibilidade e valor para sua região.</dd>
            </div>
            <div>
              <dt className="sc-label">Pagamento</dt>
              <dd>Combinado pelo WhatsApp. Não há pagamento no site.</dd>
            </div>
          </dl>
        </div>
      </div>

      {related.length > 0 && (
        <section className="lv-more" aria-labelledby="lv-more-title">
          <div className="lv-head lv-head--row">
            <div>
              <p className="sc-label lv-muted">Vitrine</p>
              <h2 className="sc-display lv-h2" id="lv-more-title">
                Mais na loja virtual
              </h2>
            </div>
            <a className="sc-pill sc-pill--ghost" href={STORE_PATH}>
              Ver todos
            </a>
          </div>
          <ul className="lv-grid lv-grid--more">
            {related.map((item, i) => (
              <li key={item.id}>
                <ProductCard product={item} index={i} onAdd={add} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {!soldOut && (
        <div className="lv-buybar" data-on={buyInView ? "0" : "1"} aria-hidden={buyInView}>
          <div className="lv-buybar__text">
            <span className="lv-buybar__name">{product.name}</span>
            <Price value={product.sale_price} className="lv-buybar__price" />
          </div>
          <button
            type="button"
            className="sc-pill sc-pill--red"
            tabIndex={buyInView ? -1 : 0}
            onClick={() => add(product, quantity)}
          >
            Adicionar
          </button>
        </div>
      )}
    </main>
  )
}
