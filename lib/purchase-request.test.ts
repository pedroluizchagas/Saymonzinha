import { describe, expect, test } from "vitest"
import type { CartItem, Product } from "@/types/database"
import { checkPurchaseRequest } from "./purchase-request"

function product(name: string, overrides: Partial<Product> = {}): Product {
  return {
    id: `id-${name}`,
    barcode: null,
    name,
    description: null,
    category: "accessory",
    purchase_price: 1,
    sale_price: 10,
    stock_quantity: 5,
    min_stock: 1,
    is_active: true,
    image_url: null,
    show_in_store: true,
    created_at: "2026-10-01T00:00:00Z",
    updated_at: "2026-10-01T00:00:00Z",
    ...overrides,
  }
}

/** O que ficou guardado no navegador: o produto como estava quando foi adicionado e a quantidade. */
const saved = (p: Product, quantity: number): CartItem => ({ product: p, quantity })

describe("pedido de compra", () => {
  test("o preço vem do banco, não do que ficou guardado no carrinho", () => {
    const old = product("Capinha", { sale_price: 10 })
    const now = { ...old, sale_price: 12 }
    const request = checkPurchaseRequest([saved(old, 2)], [now], "retirada")
    expect(request.items).toEqual([{ product: now, quantity: 2, subtotal: 24 }])
  })

  test("a quantidade fica limitada ao estoque atual", () => {
    const capinha = product("Capinha", { stock_quantity: 2 })
    expect(checkPurchaseRequest([saved(capinha, 5)], [capinha], "retirada").items[0].quantity).toBe(2)
  })

  test("o produto que saiu da loja virtual ou esgotou sai do pedido e é listado para o aviso", () => {
    const capinha = product("Capinha")
    const cabo = product("Cabo")
    const fone = product("Fone", { stock_quantity: 0 })
    const request = checkPurchaseRequest([saved(capinha, 1), saved(cabo, 1), saved(fone, 1)], [capinha, fone], "retirada")
    expect(request.items.map((i) => i.product.name)).toEqual(["Capinha"])
    expect(request.removed).toEqual(["Cabo", "Fone"])
  })

  test("o total soma os itens, em centavos certos", () => {
    const capinha = product("Capinha", { sale_price: 29.9 })
    const cabo = product("Cabo", { sale_price: 19.9 })
    expect(checkPurchaseRequest([saved(capinha, 2), saved(cabo, 1)], [capinha, cabo], "retirada").total).toBe(79.7)
  })

  test("a mensagem começa fixa e traz cada item, o total e a retirada", () => {
    const capinha = product("Capinha transparente", { sale_price: 29.9 })
    const cabo = product("Cabo USB-C", { sale_price: 19.9 })
    expect(checkPurchaseRequest([saved(capinha, 2), saved(cabo, 1)], [capinha, cabo], "retirada").message).toBe(
      "Olá Saymon Cell! Quero fazer um pedido de compra pela loja virtual:\n\n" +
        "2x Capinha transparente: R$\u00a059,80\n" +
        "1x Cabo USB-C: R$\u00a019,90\n\n" +
        "Total: R$\u00a079,70\n" +
        "Como receber: Retirar na loja\n\n" +
        "Aguardo a confirmação!",
    )
  })

  test("com entrega, a mensagem traz a ressalva de disponibilidade e valor", () => {
    const capinha = product("Capinha")
    expect(checkPurchaseRequest([saved(capinha, 1)], [capinha], "entrega").message).toContain(
      "Como receber: Receber em casa (consultar disponibilidade e valor para a região)",
    )
  })

  test("o link abre o WhatsApp oficial com a mensagem do pedido de compra", () => {
    const capinha = product("Capinha")
    const request = checkPurchaseRequest([saved(capinha, 1)], [capinha], "retirada")
    expect(request.whatsappUrl.startsWith("https://wa.me/5537988023341?text=")).toBe(true)
    expect(decodeURIComponent(request.whatsappUrl.split("text=")[1])).toBe(request.message)
  })
})
