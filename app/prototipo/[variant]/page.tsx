import type { Metadata } from "next"
import { notFound } from "next/navigation"
import HomePage from "@/app/page"
import { getFeaturedProducts } from "@/lib/actions/store-actions"
import { RedesignPrototype, RedesignSwitcher, redesignVariant } from "@/components/prototype/redesign/redesign-prototype"

// PROTÓTIPO do redesign: /prototipo/a|b|c e /prototipo/atual (site atual com a barra de troca).
// Fica fora da home para poder ser visto em produção sem mudar nada para os clientes.

export const metadata: Metadata = {
  title: "Protótipo do redesign | Saymon Cell",
  robots: { index: false, follow: false },
}

export default async function RedesignPrototypePage({ params }: { params: Promise<{ variant: string }> }) {
  const { variant: segment } = await params
  if (segment === "atual") {
    return (
      <>
        <HomePage />
        <RedesignSwitcher />
      </>
    )
  }

  const variant = redesignVariant(segment)
  if (!variant) notFound()

  const products = await getFeaturedProducts(4).catch(() => [])
  return <RedesignPrototype variant={variant} products={products} />
}
