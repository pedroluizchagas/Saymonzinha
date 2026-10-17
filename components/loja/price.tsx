// Preço no display da loja virtual: o "R$" menor e alto, junto do valor (cartões, página do produto e
// carrinho). O leitor de tela ouve o preço inteiro, de uma vez.

import { formatPrice, priceParts } from "@/lib/catalog"

export function Price({ value, className }: { value: number; className?: string }) {
  const { currency, amount } = priceParts(value)
  return (
    <span className={className ? `lv-price ${className}` : "lv-price"}>
      <span className="sc-sr">{formatPrice(value)}</span>
      <span aria-hidden="true">
        <span className="lv-price__cur">{currency}</span>
        {amount}
      </span>
    </span>
  )
}
