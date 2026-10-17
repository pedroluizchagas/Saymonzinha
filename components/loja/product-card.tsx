"use client"

// Cartão de um produto na vitrine: a foto inteira numa área clara (ou o desenho da marca numa área
// escura), o número do produto na vitrine, o selo de estoque, o nome e o preço, que levam à página do
// produto, e o botão redondo de adicionar, que confirma com um visto quando o produto entra no carrinho.

import { Check, Plus } from "lucide-react"
import { useEffect, useState } from "react"
import { productPath, stockBadge } from "@/lib/catalog"
import type { Product } from "@/types/database"
import { Price } from "./price"

const ADDED_MS = 1600

export function ProductCard({
  product,
  index,
  onAdd,
  eager = false,
}: {
  product: Product
  /** Posição na vitrine, a partir de 0; aparece como "01". */
  index: number
  /** Põe no carrinho; devolve se entrou alguma unidade. */
  onAdd: (product: Product) => boolean
  /** Os primeiros cartões carregam a foto logo; os outros, quando chegam perto da tela. */
  eager?: boolean
}) {
  const badge = stockBadge(product)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!added) return
    const timer = window.setTimeout(() => setAdded(false), ADDED_MS)
    return () => window.clearTimeout(timer)
  }, [added])

  return (
    <article className="lv-tile">
      {/* O link cobre o cartão inteiro (ver .lv-tile__link::after); o título já dá o nome, então a foto não repete. */}
      <a className="lv-tile__link" href={productPath(product)}>
        <span className="lv-photo lv-tile__photo" data-empty={product.image_url ? undefined : "1"}>
          <img
            src={product.image_url || "/home/glyph.png"}
            alt=""
            width={600}
            height={600}
            loading={eager ? "eager" : "lazy"}
            decoding="async"
          />
          <span className="sc-label lv-tile__index" aria-hidden="true">
            {String(index + 1).padStart(2, "0")}
          </span>
        </span>
        <h3 className="lv-tile__name">{product.name}</h3>
        {/* Depois do nome, para o leitor de tela dizer o produto antes do estoque; o CSS põe o selo sobre a foto. */}
        {badge && <span className="sc-label lv-badge lv-tile__badge">{badge}</span>}
      </a>
      <div className="lv-tile__foot">
        <Price value={product.sale_price} className="lv-tile__price" />
        <button
          type="button"
          className="lv-add"
          data-added={added ? "1" : undefined}
          aria-label={`Adicionar ${product.name} ao carrinho`}
          onClick={() => setAdded(onAdd(product))}
        >
          {added ? <Check aria-hidden="true" strokeWidth={2.6} /> : <Plus aria-hidden="true" strokeWidth={2.2} />}
        </button>
      </div>
    </article>
  )
}
