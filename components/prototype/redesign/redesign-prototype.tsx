// PROTÓTIPO do redesign (referência: foldfolio.framer.website), descartável.
// Três variantes radicalmente diferentes em /prototipo/a|b|c, fora da home:
//   A "Desdobra" — o site vive dentro de um celular dobrável que se conserta e desdobra com o scroll.
//   B "Raio-X"   — o celular se desmonta em camadas; cada peça apresenta um serviço.
//   C "Sistema"  — o site é o sistema operacional de um celular; navegação por apps.
// /prototipo/atual mostra o site atual com a barra de troca. Está na main só para ser visto
// em produção enquanto a variante é escolhida: reverter depois da escolha.

import type { Product } from "@/types/database"
import { PrototypeSwitcher, type PrototypeVariant } from "../prototype-switcher"
import { scFontVariables } from "./fonts"
import "./sc-system.css"
import { VariantA } from "./variant-a/variant-a"
import { VariantB } from "./variant-b/variant-b"
import { VariantC } from "./variant-c/variant-c"

export const REDESIGN_PATH = "/prototipo"

export const REDESIGN_VARIANTS: PrototypeVariant[] = [
  { key: "atual", name: "Site atual" },
  { key: "A", name: "Desdobra" },
  { key: "B", name: "Raio-X" },
  { key: "C", name: "Sistema" },
]

export function redesignVariant(segment: string) {
  const key = segment.toUpperCase()
  return key === "A" || key === "B" || key === "C" ? key : null
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
  return <PrototypeSwitcher basePath={REDESIGN_PATH} variants={REDESIGN_VARIANTS} />
}
