import { ImageResponse } from "next/og"
import { SITE_URL } from "@/components/home/shared/content"
import { getPublishedProducts } from "@/lib/actions/store-actions"
import { findProduct, formatPrice } from "@/lib/catalog"

// Prévia do link de um produto (WhatsApp, Instagram): um cartão com a cara da marca, com a foto (ou o
// desenho da marca), o nome e o preço. Todas as prévias ficam no mesmo padrão.

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Produto da loja virtual da Saymon Cell"

/** A foto como dado, se for um formato que o gerador da prévia desenha (JPEG, PNG ou SVG); senão, nada. */
async function drawablePhoto(url: string | null) {
  if (!url) return null
  if (/^data:image\/(jpeg|png|svg\+xml)/.test(url)) return url
  try {
    const response = await fetch(url)
    const type = response.headers.get("content-type") ?? ""
    if (!response.ok || !/^image\/(jpeg|png)/.test(type)) return null
    return `data:${type};base64,${Buffer.from(await response.arrayBuffer()).toString("base64")}`
  } catch {
    return null
  }
}

export default async function Image({ params }: { params: Promise<{ produto: string }> }) {
  const found = findProduct((await params).produto, await getPublishedProducts())
  const product = found && "product" in found ? found.product : null
  // Foto em formato que a prévia não desenha (WebP, por exemplo): o desenho da marca, e não um quadro vazio.
  const photo = await drawablePhoto(product?.image_url ?? null)

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", gap: 56, padding: 64, background: "#0a0908", color: "#f4f3f0" }}>
        <div style={{ display: "flex", width: 500, height: 500, flex: "none", alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 36, background: photo ? "#f4f3f0" : "#0b0b0b", border: "2px solid #2a2724" }}>
          {photo ? (
            <img src={photo} width={500} height={500} style={{ objectFit: "contain" }} />
          ) : (
            <img src={`${SITE_URL}/home/glyph.png`} width={190} height={190} />
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22, flex: 1 }}>
          <div style={{ fontSize: 26, letterSpacing: 6, color: "#a6a29b", textTransform: "uppercase" }}>Saymon Cell · Loja virtual</div>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.05 }}>{product?.name ?? "Loja virtual"}</div>
          {product && <div style={{ fontSize: 76, fontWeight: 700, color: "#ff0200" }}>{formatPrice(product.sale_price)}</div>}
          <div style={{ fontSize: 26, color: "#a6a29b" }}>Divinópolis · Retire na loja ou receba em casa</div>
        </div>
      </div>
    ),
    size,
  )
}
