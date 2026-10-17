// Cartão de um produto do catálogo: a foto numa área clara (ou o desenho da marca), o nome, o preço,
// o selo de estoque e "Adicionar".

import { Plus } from "lucide-react"
import { formatPrice, stockBadge } from "@/lib/catalog"
import type { Product } from "@/types/database"

export function ProductCard({
  product,
  onAdd,
  eager = false,
}: {
  product: Product
  onAdd: (product: Product) => void
  /** Os primeiros cartões carregam a foto logo; os outros, quando chegam perto da tela. */
  eager?: boolean
}) {
  const badge = stockBadge(product)
  return (
    <article className="lv-card">
      <div className="lv-card__photo" data-empty={product.image_url ? undefined : "1"}>
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            width={600}
            height={600}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
          />
        ) : (
          <img src="/home/glyph.png" alt="" aria-hidden="true" />
        )}
        {badge && <span className="sc-label lv-badge">{badge}</span>}
      </div>
      <div className="lv-card__body">
        <h2 className="lv-card__name">{product.name}</h2>
        <p className="lv-card__price">{formatPrice(product.sale_price)}</p>
        <button
          type="button"
          className="sc-pill sc-pill--red sc-pill--sm lv-card__add"
          aria-label={`Adicionar ${product.name} ao carrinho`}
          onClick={() => onAdd(product)}
        >
          <Plus aria-hidden="true" /> Adicionar
        </button>
      </div>
    </article>
  )
}
