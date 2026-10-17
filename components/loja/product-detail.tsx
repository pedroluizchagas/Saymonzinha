"use client"

// Página de um produto da loja virtual (endereço no ADR 0002): a foto grande, o preço, a descrição,
// a quantidade, "Adicionar ao carrinho" e "Perguntar no WhatsApp". Esgotado, a página continua, com o
// aviso e a pergunta de quando chega.

import { ArrowLeft, MessageCircle } from "lucide-react"
import { useState } from "react"
import { whatsappLink } from "@/components/home/shared/content"
import { STORE_PATH, formatPrice, isSoldOut, stockBadge } from "@/lib/catalog"
import type { Product } from "@/types/database"
import { QuantityStepper } from "./quantity-stepper"
import { useAddToCart } from "./store-shell"

export function ProductDetail({ product, url }: { product: Product; url: string }) {
  const add = useAddToCart()
  const badge = stockBadge(product)
  const soldOut = isSoldOut(product)
  const [quantity, setQuantity] = useState(1)
  const question = soldOut
    ? `Olá Saymon Cell! O produto ${product.name} está esgotado na loja virtual. Quando chega? ${url}`
    : `Olá Saymon Cell! Tenho uma dúvida sobre este produto da loja virtual: ${product.name} ${url}`

  return (
    <main className="lv-main lv-product">
      <a className="sc-label lv-back" href={STORE_PATH}>
        <ArrowLeft aria-hidden="true" /> Loja virtual
      </a>
      <div className="lv-product__grid">
        <div className="lv-product__photo" data-empty={product.image_url ? undefined : "1"}>
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} width={1200} height={1200} />
          ) : (
            <img src="/home/glyph.png" alt="" aria-hidden="true" />
          )}
          {badge && <span className="sc-label lv-badge">{badge}</span>}
        </div>

        <div className="lv-product__info">
          <h1 className="sc-display lv-product__name">{product.name}</h1>
          <p className="lv-product__price">{formatPrice(product.sale_price)}</p>
          {product.description && <p className="sc-body lv-product__description">{product.description}</p>}

          {!soldOut && (
            <div className="lv-product__buy">
              <QuantityStepper value={quantity} max={product.stock_quantity} onChange={setQuantity} label="Quantidade" />
              <button type="button" className="sc-pill sc-pill--red lv-product__add" onClick={() => add(product, quantity)}>
                Adicionar ao carrinho
              </button>
            </div>
          )}

          <a className="sc-pill sc-pill--ghost lv-product__ask" href={whatsappLink(question)} target="_blank" rel="noopener noreferrer">
            <MessageCircle aria-hidden="true" /> {soldOut ? "Perguntar no WhatsApp quando chega" : "Perguntar no WhatsApp"}
          </a>
          <p className="sc-body lv-product__note">
            Retire na loja ou receba em casa (consulte disponibilidade e valor para sua região).
          </p>
        </div>
      </div>
    </main>
  )
}
