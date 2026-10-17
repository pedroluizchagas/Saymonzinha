// Pedido de compra (ver GLOSSARY.md): o carrinho da loja virtual conferido com o banco, pronto para
// seguir pelo WhatsApp.

import { whatsappLink } from "@/components/home/shared/content"
import { formatPrice } from "@/lib/catalog"
import type { CartItem, Product } from "@/types/database"

/** Retirada: o cliente busca na loja. Entrega: a loja leva até o cliente. */
export type Receiving = "retirada" | "entrega"

export type PurchaseItem = { product: Product; quantity: number; subtotal: number }

export function checkPurchaseRequest(cart: CartItem[], published: Product[], receiving: Receiving) {
  const items: PurchaseItem[] = []
  // Produtos que saíram da loja virtual ou esgotaram desde que foram para o carrinho.
  const removed: string[] = []
  for (const saved of cart) {
    const product = published.find((p) => p.id === saved.product.id)
    if (!product || product.stock_quantity <= 0) {
      removed.push(saved.product.name)
      continue
    }
    const quantity = Math.min(saved.quantity, product.stock_quantity)
    items.push({ product, quantity, subtotal: cents(product.sale_price) * quantity / 100 })
  }
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
