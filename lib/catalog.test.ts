import { describe, expect, test } from "vitest"
import type { Product } from "@/types/database"
import {
  catalogFilters,
  categoryName,
  closingSpan,
  filterCatalog,
  findProduct,
  priceParts,
  productPath,
  relatedProducts,
  shouldShowSearch,
  stockBadge,
} from "./catalog"

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

  test("o endereço do produto é o nome sem acentos, em minúsculas e com hífens, mais o começo do código", () => {
    const id = "3f2a9c1d-0000-4000-8000-000000000001"
    expect(productPath(product("Película de vidro 3D", { id }))).toBe("/loja/pelicula-de-vidro-3d-3f2a9c1d")
    expect(productPath(product("Carregador turbo USB-C 25W (original)!", { id }))).toBe(
      "/loja/carregador-turbo-usb-c-25w-original-3f2a9c1d",
    )
    expect(productPath(product("Power bank 10.000 mAh", { id }))).toBe("/loja/power-bank-10-000-mah-3f2a9c1d")
    expect(productPath(product("***", { id }))).toBe("/loja/produto-3f2a9c1d")
  })

  test("acha o produto pelo trecho do código no endereço", () => {
    const pelicula = product("Película de vidro 3D", { id: "3f2a9c1d-0000-4000-8000-000000000001" })
    const capinha = product("Capinha", { id: "9b8c7d6e-0000-4000-8000-000000000002" })
    expect(findProduct("pelicula-de-vidro-3d-3f2a9c1d", [capinha, pelicula])).toEqual({ product: pelicula })
  })

  test("quando o nome mudou, o endereço antigo manda para o endereço atual", () => {
    const pelicula = product("Película de vidro 3D", { id: "3f2a9c1d-0000-4000-8000-000000000001" })
    expect(findProduct("pelicula-antiga-3f2a9c1d", [pelicula])).toEqual({ redirect: "/loja/pelicula-de-vidro-3d-3f2a9c1d" })
  })

  test("endereço sem produto não acha nada: código desconhecido, sem código ou incompleto", () => {
    const pelicula = product("Película de vidro 3D", { id: "3f2a9c1d-0000-4000-8000-000000000001" })
    expect(findProduct("qualquer-coisa-00000000", [pelicula])).toBeNull()
    expect(findProduct("pelicula-de-vidro-3d-", [pelicula])).toBeNull()
    expect(findProduct("pelicula-3f2a", [pelicula])).toBeNull()
  })

  test("a página do produto sugere outros com estoque, da mesma categoria primeiro", () => {
    const capinha = product("Capinha")
    const carregador = product("Carregador")
    const esgotado = product("Fone", { stock_quantity: 0 })
    const pelicula = product("Película", { category: "part" })
    const cabo = product("Cabo")
    const all = [pelicula, capinha, esgotado, carregador, cabo]
    expect(relatedProducts(capinha, all)).toEqual([carregador, cabo, pelicula])
    expect(relatedProducts(capinha, all, 2)).toEqual([carregador, cabo])
  })

  test("o cartão do fim fecha a última linha da grade, ou ocupa a linha toda quando ela já fechou", () => {
    expect(closingSpan(9, 4)).toBe(3)
    expect(closingSpan(9, 3)).toBe(3)
    expect(closingSpan(9, 2)).toBe(1)
    expect(closingSpan(10, 4)).toBe(2)
    expect(closingSpan(8, 4)).toBe(4)
  })

  test("o preço se divide em moeda e valor, com o milhar e os centavos do real", () => {
    expect(priceParts(39.9)).toEqual({ currency: "R$", amount: "39,90" })
    expect(priceParts(1299.9)).toEqual({ currency: "R$", amount: "1.299,90" })
  })

  test("a categoria aparece no singular na página do produto", () => {
    expect(categoryName(product("Capinha"))).toBe("Acessório")
    expect(categoryName(product("Película", { category: "part" }))).toBe("Peça")
  })
})
