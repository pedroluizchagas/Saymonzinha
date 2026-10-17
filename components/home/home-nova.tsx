// Home nova: a Desdobra no desktop e a Raio-X em celular e tablet (ver docs/adr/0001).
// O conteúdo das duas vem de ./shared/content.ts.

import type { HomeVersion } from "@/lib/home-presentation"
import type { Product } from "@/types/database"
import { Desdobra } from "./desdobra/desdobra"
import { scFontVariables } from "./fonts"
import { RaioX } from "./raio-x/raio-x"
import "./sc-system.css"

export function HomeNova({ version, products }: { version: HomeVersion; products: Product[] }) {
  return (
    <div className={scFontVariables}>
      {version === "desdobra" ? <Desdobra products={products} /> : <RaioX products={products} />}
    </div>
  )
}
