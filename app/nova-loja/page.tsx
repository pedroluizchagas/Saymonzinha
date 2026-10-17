import type { Metadata } from "next"
import { scFontVariables } from "@/components/home/fonts"
import { Catalog } from "@/components/loja/catalog"
import { StoreShell } from "@/components/loja/store-shell"
import { getStoreProducts } from "@/lib/actions/store-actions"

// Loja virtual nova em aprovação: fica fora do Google até substituir /loja.
export const metadata: Metadata = {
  title: "Loja virtual | Saymon Cell - Acessórios para celular em Divinópolis",
  description:
    "Capinhas, carregadores, fones e caixinhas de som na loja virtual da Saymon Cell, em Divinópolis. Retire na loja ou receba em casa.",
  robots: { index: false, follow: false },
}

export default async function NovaLojaPage() {
  const products = await getStoreProducts().catch(() => [])
  return (
    <div className={scFontVariables}>
      <StoreShell>
        <Catalog products={products} />
      </StoreShell>
    </div>
  )
}
