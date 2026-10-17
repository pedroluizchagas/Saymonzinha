// PROTÓTIPO do redesign (referência: foldfolio.framer.website), descartável.
// Três variantes radicalmente diferentes na rota "/", alternadas por ?variant=:
//   A "Desdobra" — o site vive dentro de um celular dobrável que se conserta e desdobra com o scroll.
//   B "Raio-X"   — o celular se desmonta em camadas; cada peça apresenta um serviço.
//   C "Sistema"  — o site é o sistema operacional de um celular; navegação por apps.
// Sem ?variant= a rota mostra o site atual. Nada aqui deve ir para a main.

import { Suspense } from "react"
import type { Product } from "@/types/database"
import { PrototypeSwitcher, type PrototypeVariant } from "../prototype-switcher"
import { scFontVariables } from "./fonts"
import "./sc-system.css"
import { VariantA } from "./variant-a/variant-a"
import { VariantB } from "./variant-b/variant-b"
import { VariantC } from "./variant-c/variant-c"

export const REDESIGN_VARIANTS: PrototypeVariant[] = [
  { key: "atual", name: "Site atual" },
  { key: "A", name: "Desdobra" },
  { key: "B", name: "Raio-X" },
  { key: "C", name: "Sistema" },
]

export function isPrototypeEnabled() {
  return process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_VERCEL_ENV === "preview"
}

export function redesignVariant(value: string | string[] | undefined) {
  const key = Array.isArray(value) ? value[0] : value
  return REDESIGN_VARIANTS.some((v) => v.key === key && key !== "atual") ? (key as "A" | "B" | "C") : null
}

export function RedesignPrototype({ variant, products }: { variant: "A" | "B" | "C"; products: Product[] }) {
  return (
    <div className={scFontVariables}>
      {variant === "A" && <VariantA products={products} />}
      {variant === "B" && <VariantB products={products} />}
      {variant === "C" && <VariantC products={products} />}
      <RedesignSwitcher />
    </div>
  )
}

export function RedesignSwitcher() {
  return (
    <Suspense fallback={null}>
      <PrototypeSwitcher variants={REDESIGN_VARIANTS} />
    </Suspense>
  )
}
