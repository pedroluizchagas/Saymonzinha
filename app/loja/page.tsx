import type { Metadata } from "next"
import { scFontVariables } from "@/components/home/fonts"
import { SITE_URL } from "@/components/home/shared/content"
import { Catalog } from "@/components/loja/catalog"
import { StoreShell } from "@/components/loja/store-shell"
import { getStoreProducts } from "@/lib/actions/store-actions"
import { STORE_PATH } from "@/lib/catalog"

const description =
  "Capinhas, carregadores, fones e caixinhas de som na loja virtual da Saymon Cell, em Divinópolis. Retire na loja ou receba em casa."

// A loja virtual (ver GLOSSARY.md e a spec #12). A prévia do link é a dela, e não a do conserto, que viria do layout.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Loja virtual | Saymon Cell - Acessórios para celular em Divinópolis",
  description,
  alternates: { canonical: STORE_PATH },
  openGraph: { title: "Loja virtual Saymon Cell", description, url: STORE_PATH, type: "website" },
}

export default async function StorePage() {
  const products = await getStoreProducts().catch(() => [])
  return (
    <div className={scFontVariables}>
      <StoreShell>
        <Catalog products={products} />
      </StoreShell>
    </div>
  )
}
