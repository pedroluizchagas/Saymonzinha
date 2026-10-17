// Regras do catálogo da loja virtual (ver GLOSSARY.md): os filtros, a busca e os selos dos produtos.

import type { Product, ProductCategory } from "@/types/database"

/** Endereço da loja virtual nova. Fica em /nova-loja até o lançamento, quando passa a ser /loja. */
export const STORE_PATH = "/nova-loja"

export type CatalogFilter = { value: ProductCategory | "all"; label: string }

const PRICE = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

export function formatPrice(value: number) {
  return PRICE.format(value)
}

/** As categorias na ordem em que aparecem nos filtros. */
const CATEGORIES: [ProductCategory, string][] = [
  ["accessory", "Acessórios"],
  ["part", "Peças"],
  ["other", "Outros"],
  ["service", "Serviços"],
]

/** Filtros do catálogo: Todos e as categorias que têm produto, na ordem da loja. Com uma categoria só, nenhum. */
export function catalogFilters(products: Product[]): CatalogFilter[] {
  const present = CATEGORIES.filter(([category]) => products.some((p) => p.category === category))
  if (present.length < 2) return []
  return [{ value: "all", label: "Todos" }, ...present.map(([value, label]) => ({ value, label }))]
}

/** Até 12 produtos cabem na tela sem busca; a partir de 13, ela aparece. */
const SEARCH_FROM = 13

export function shouldShowSearch(products: Product[]) {
  return products.length >= SEARCH_FROM
}

/** Até este estoque, o produto mostra "Últimas unidades". */
const FEW_LEFT = 2

export function stockBadge(product: Product): "Esgotado" | "Últimas unidades" | null {
  if (product.stock_quantity <= 0) return "Esgotado"
  return product.stock_quantity <= FEW_LEFT ? "Últimas unidades" : null
}

/** Quantos caracteres do código do produto entram no endereço (ver docs/adr/0002). */
const CODE_LENGTH = 8
const NAME_MAX = 60

/** Endereço da página do produto: o nome legível mais o começo do código (ADR 0002). */
export function productPath(product: Product) {
  const name =
    plain(product.name)
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, NAME_MAX)
      .replace(/^-+|-+$/g, "") || "produto"
  return `${STORE_PATH}/${name}-${product.id.slice(0, CODE_LENGTH)}`
}

/**
 * O produto de um endereço da loja virtual, achado pelo trecho do código no fim. Se o nome do
 * endereço não é o atual (o produto mudou de nome), devolve o endereço certo para redirecionar.
 */
export function findProduct(address: string, products: Product[]): { product: Product } | { redirect: string } | null {
  const code = address.slice(address.lastIndexOf("-") + 1)
  if (code.length !== CODE_LENGTH) return null
  const product = products.find((p) => p.id.startsWith(code))
  if (!product) return null
  const path = productPath(product)
  return path === `${STORE_PATH}/${address}` ? { product } : { redirect: path }
}

/** Texto comparável: sem acentos, sem maiúsculas e sem espaços nas pontas. */
function plain(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
}

/** Os produtos do catálogo que a pessoa está vendo: a categoria escolhida e o que ela buscou. */
export function filterCatalog(products: Product[], view: { category: CatalogFilter["value"]; query: string }) {
  const query = plain(view.query)
  return products.filter(
    (p) =>
      (view.category === "all" || p.category === view.category) &&
      (!query || plain(`${p.name} ${p.description ?? ""}`).includes(query)),
  )
}
