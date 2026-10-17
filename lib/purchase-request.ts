// Pedido de compra (ver GLOSSARY.md): o carrinho da loja virtual conferido com o banco, pronto para
// seguir pelo WhatsApp.

import { whatsappLink } from "@/components/home/shared/content"
import { formatPrice, isSoldOut } from "@/lib/catalog"
import type { CartItem, Product } from "@/types/database"

/** Retirada: o cliente busca na loja. Entrega: a loja leva até o cliente. */
export type Receiving = "retirada" | "entrega"

export type PurchaseItem = { product: Product; quantity: number; subtotal: number }

/**
 * O carrinho guardado conferido com os produtos publicados: preço atual, quantidade até o estoque e
 * sem os produtos que saíram ou esgotaram (listados para o aviso). `changed` diz se algo mudou.
 */
export function reconcileCart(cart: CartItem[], published: Product[]) {
  const items: CartItem[] = []
  const removed: string[] = []
  for (const saved of cart) {
    const product = published.find((p) => p.id === saved.product.id)
    if (!product || isSoldOut(product)) {
      removed.push(saved.product.name)
      continue
    }
    items.push({ product, quantity: Math.min(saved.quantity, product.stock_quantity) })
  }
  const key = (list: CartItem[]) =>
    JSON.stringify(list.map((i) => [i.product.id, i.quantity, i.product.sale_price, i.product.stock_quantity]))
  return { items, removed, changed: key(items) !== key(cart) }
}

export function checkPurchaseRequest(cart: CartItem[], published: Product[], receiving: Receiving) {
  const { items: checked, removed } = reconcileCart(cart, published)
  const items: PurchaseItem[] = checked.map(({ product, quantity }) => ({
    product,
    quantity,
    subtotal: (cents(product.sale_price) * quantity) / 100,
  }))
  const total = items.reduce((sum, item) => sum + cents(item.subtotal), 0) / 100
  // O começo é fixo: é por ele que a loja reconhece e conta os pedidos de compra no WhatsApp.
  const message = [
    "Olá Saymon Cell! Quero fazer um pedido de compra pela loja virtual:",
    "",
    ...items.map((item) => `${item.quantity}x ${item.product.name}: ${formatPrice(item.subtotal)}`),
    "",
    `Total: ${formatPrice(total)}`,
    `Como receber: ${RECEIVING[receiving]}`,
    "",
    "Aguardo a confirmação!",
  ].join("\n")
  return { items, removed, total, message, whatsappUrl: whatsappLink(message) }
}

const RECEIVING: Record<Receiving, string> = {
  retirada: "Retirar na loja",
  entrega: "Receber em casa (consultar disponibilidade e valor para a região)",
}

/** Contas em centavos inteiros, para 2 × 29,90 + 19,90 dar 79,70, e não 79,6999… */
function cents(value: number) {
  return Math.round(value * 100)
}
