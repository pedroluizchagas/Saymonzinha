import type { Metadata } from "next"
import { permanentRedirect, redirect } from "next/navigation"
import { cache } from "react"
import { scFontVariables } from "@/components/home/fonts"
import { SITE_URL } from "@/components/home/shared/content"
import { ProductDetail } from "@/components/loja/product-detail"
import { StoreShell } from "@/components/loja/store-shell"
import { getPublishedProducts } from "@/lib/actions/store-actions"
import { STORE_PATH, findProduct, formatPrice, productPath } from "@/lib/catalog"
import type { Product } from "@/types/database"

// Página de um produto da loja virtual (ADR 0002). O metadado e a página leem os produtos uma vez só;
// se o banco não responder, o endereço cai na loja virtual.
const published = cache(async () => (await getPublishedProducts()) ?? [])

type Props = { params: Promise<{ produto: string }> }

function describe(product: Product) {
  return product.description || `${product.name} por ${formatPrice(product.sale_price)} na loja virtual da Saymon Cell, em Divinópolis.`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = findProduct((await params).produto, await published())
  if (!found || !("product" in found)) return { robots: { index: false, follow: false } }
  const { product } = found
  return {
    metadataBase: new URL(SITE_URL),
    title: `${product.name} | Loja virtual Saymon Cell`,
    description: describe(product),
    // Fica fora do Google até a loja virtual nova substituir /loja.
    robots: { index: false, follow: false },
    alternates: { canonical: productPath(product) },
    openGraph: { title: product.name, description: describe(product), url: productPath(product), type: "website" },
  }
}

export default async function ProdutoPage({ params }: Props) {
  const found = findProduct((await params).produto, await published())
  // Produto desativado, desmarcado ou endereço sem produto: a loja virtual. Nome mudado: o endereço novo.
  if (!found) redirect(STORE_PATH)
  if ("redirect" in found) permanentRedirect(found.redirect)
  const { product } = found
  const url = SITE_URL + productPath(product)
  // Dados de produto para o Google; o "<" escapado impede fechar o <script> pelo nome do produto.
  const data = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: describe(product),
    image: product.image_url ? [product.image_url] : undefined,
    sku: product.id,
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "BRL",
      price: product.sale_price.toFixed(2),
      availability: product.stock_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Saymon Cell" },
    },
  }).replace(/</g, "\\u003c")

  return (
    <div className={scFontVariables}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: data }} />
      <StoreShell>
        <ProductDetail product={product} url={url} />
      </StoreShell>
    </div>
  )
}
