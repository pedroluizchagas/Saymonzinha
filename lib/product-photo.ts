// Foto do produto da loja virtual: reduzida no navegador antes do envio, para a loja virtual abrir
// rápido em celular simples, e guardada no espaço público de fotos do Supabase (scripts/010).

import { createClient } from "@/lib/supabase/client"

export const PRODUCT_PHOTOS_BUCKET = "produtos"

/** Lado maior da foto guardada, em pixels. */
export const PRODUCT_PHOTO_MAX_SIDE = 1200

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))
}

/**
 * Reduz a foto para no máximo PRODUCT_PHOTO_MAX_SIDE no lado maior, sobre fundo branco, em JPEG. O
 * JPEG, e não o WebP, porque a prévia do link (opengraph-image) não desenha WebP.
 */
async function shrinkPhoto(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    // O <img> respeita a orientação gravada pela câmera.
    const img = new Image()
    img.src = url
    await img.decode().catch(() => {
      throw new Error("Não deu para abrir essa foto. Use uma foto JPG, PNG ou WebP.")
    })
    const scale = Math.min(1, PRODUCT_PHOTO_MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    const context = canvas.getContext("2d")!
    context.fillStyle = "#ffffff"
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(img, 0, 0, canvas.width, canvas.height)
    const photo = await toBlob(canvas, "image/jpeg", 0.85)
    if (!photo) throw new Error("Não deu para preparar essa foto. Tente outra.")
    return photo
  } finally {
    URL.revokeObjectURL(url)
  }
}

/** Reduz e envia a foto; devolve o endereço público para guardar no produto. */
export async function uploadProductPhoto(file: File): Promise<string> {
  const photo = await shrinkPhoto(file)
  const path = `${crypto.randomUUID()}.jpg`
  const storage = createClient().storage.from(PRODUCT_PHOTOS_BUCKET)
  // O nome é sempre novo, então a foto pode ficar em cache por um ano.
  const { error } = await storage.upload(path, photo, { contentType: photo.type, cacheControl: "31536000" })
  if (error) {
    throw new Error(
      /bucket not found/i.test(error.message)
        ? "O espaço de fotos ainda não existe no Supabase: rode o script scripts/010_product_photos.sql."
        : "Não deu para enviar a foto agora. Confira a conexão e tente de novo.",
    )
  }
  return storage.getPublicUrl(path).data.publicUrl
}
