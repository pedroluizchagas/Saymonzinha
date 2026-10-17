import { describe, expect, test } from "vitest"
import type { Product } from "@/types/database"
import { catalogFilters, filterCatalog, shouldShowSearch, stockBadge } from "./catalog"

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

describe("catálogo da loja virtual", () => {
  test("os filtros são Todos e as categorias que têm produto, na ordem da loja", () => {
    const products = [
      product("Película", { category: "part" }),
      product("Capinha"),
      product("Caixinha de som", { category: "other" }),
    ]
    expect(catalogFilters(products)).toEqual([
      { value: "all", label: "Todos" },
      { value: "accessory", label: "Acessórios" },
      { value: "part", label: "Peças" },
      { value: "other", label: "Outros" },
    ])
  })

  test("com uma categoria só, não há filtro", () => {
    expect(catalogFilters([product("Capinha"), product("Carregador")])).toEqual([])
  })

  test("a busca aparece a partir de 13 produtos", () => {
    const many = (n: number) => Array.from({ length: n }, (_, i) => product(`Produto ${i + 1}`))
    expect(shouldShowSearch(many(12))).toBe(false)
    expect(shouldShowSearch(many(13))).toBe(true)
  })

  test("o filtro mostra só os produtos da categoria escolhida", () => {
    const capinha = product("Capinha")
    const pelicula = product("Película", { category: "part" })
    expect(filterCatalog([capinha, pelicula], { category: "part", query: "" })).toEqual([pelicula])
    expect(filterCatalog([capinha, pelicula], { category: "all", query: "" })).toEqual([capinha, pelicula])
  })

  test("a busca procura no nome e na descrição, sem diferenciar acentos e maiúsculas", () => {
    const pelicula = product("Película 3D", { category: "part" })
    const fone = product("Fone bluetooth", { description: "Com estojo de recarga" })
    const capinha = product("Capinha")
    const all = [pelicula, fone, capinha]
    expect(filterCatalog(all, { category: "all", query: "pelicula" })).toEqual([pelicula])
    expect(filterCatalog(all, { category: "all", query: "  ESTOJO " })).toEqual([fone])
    expect(filterCatalog(all, { category: "accessory", query: "película" })).toEqual([])
  })

  test("o selo diz quando o produto acabou ou está nas últimas unidades", () => {
    expect(stockBadge(product("A", { stock_quantity: 0 }))).toBe("Esgotado")
    expect(stockBadge(product("B", { stock_quantity: 1 }))).toBe("Últimas unidades")
    expect(stockBadge(product("C", { stock_quantity: 2 }))).toBe("Últimas unidades")
    expect(stockBadge(product("D", { stock_quantity: 3 }))).toBeNull()
  })
})
