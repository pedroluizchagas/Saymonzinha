import type { MetadataRoute } from "next"
import { SITE_URL } from "@/components/home/shared/content"
import { getPublishedProducts } from "@/lib/actions/store-actions"
import { STORE_PATH, productPath } from "@/lib/catalog"

// O que o Google deve achar: a home, a loja virtual e cada produto publicado (inclusive os esgotados,
// cuja página continua no ar).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = (await getPublishedProducts()) ?? []
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}${STORE_PATH}`, changeFrequency: "weekly", priority: 0.8 },
    ...products.map((product) => ({
      url: `${SITE_URL}${productPath(product)}`,
      lastModified: product.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ]
}
